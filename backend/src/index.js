"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const server = new index_js_1.Server({
    name: "cag-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Load the configuration file from the working directory
function loadConfig(targetDir) {
    const configPath = path.join(targetDir, ".cag-config.yaml");
    if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found at ${configPath}`);
    }
    const fileContent = fs.readFileSync(configPath, "utf8");
    return yaml.parse(fileContent);
}
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_category_context",
                description: "Fetches the context rules and files for a specific Context-Aware Gateway (CAG) category. Use this whenever the user types /cag <category>",
                inputSchema: {
                    type: "object",
                    properties: {
                        categoryName: {
                            type: "string",
                            description: "The name of the category to fetch context for",
                        },
                        projectPath: {
                            type: "string",
                            description: "The absolute path to the root of the current project",
                        },
                    },
                    required: ["categoryName", "projectPath"],
                },
            },
        ],
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_category_context") {
        const categoryName = request.params.arguments?.categoryName;
        const projectPath = request.params.arguments?.projectPath;
        try {
            const config = loadConfig(projectPath);
            const category = config.categories?.find((c) => c.name === categoryName);
            if (!category) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: Category '${categoryName}' not found in .cag-config.yaml`,
                        },
                    ],
                    isError: true,
                };
            }
            let responseText = `# CAG Context: ${categoryName}\n\n`;
            if (category.rules && category.rules.length > 0) {
                responseText += `## Rules\n`;
                category.rules.forEach((rule) => {
                    responseText += `- ${rule}\n`;
                });
                responseText += `\n`;
            }
            if (category.context && category.context.length > 0) {
                responseText += `## Files\n`;
                category.context.forEach((ctx) => {
                    const filePath = path.join(projectPath, ctx.path);
                    if (fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath, "utf8");
                        // Placeholder for tree-sitter minification
                        const minifiedContent = ctx.minify ? `/* Minified: ${ctx.path} */\n${content.substring(0, 500)}...` : content;
                        responseText += `### ${ctx.path}\n\`\`\`\n${minifiedContent}\n\`\`\`\n\n`;
                    }
                    else {
                        responseText += `### ${ctx.path}\nFile not found.\n\n`;
                    }
                });
            }
            return {
                content: [
                    {
                        type: "text",
                        text: responseText,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error loading context: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    throw new Error(`Tool not found: ${request.params.name}`);
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("CAG MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map