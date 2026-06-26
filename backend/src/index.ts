#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { execSync } from "child_process";

// Helper: Load config
function loadConfig(targetDir: string) {
  const configPath = path.join(targetDir, ".cag-config.yaml");
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
  }
  const fileContent = fs.readFileSync(configPath, "utf8");
  return yaml.parse(fileContent);
}

// Helper: AST Regex Minifier
function minifyCode(code: string): string {
  let minified = code;
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  minified = minified.replace(/\{[^\{\}]*\}/g, '{ /* body minified */ }');
  return minified;
}

// Helper: Generate the markdown payload
function generatePayload(categoryName: string, projectPath: string): string {
  const config = loadConfig(projectPath);
  const category = config.categories?.find((c: any) => c.name === categoryName);

  if (!category) {
    throw new Error(`Category '${categoryName}' not found in .cag-config.yaml`);
  }

  let responseText = `# CAG Context: ${categoryName}\n\n`;

  if (category.rules?.length > 0) {
    responseText += `## Rules\n`;
    category.rules.forEach((rule: string) => {
      responseText += `- ${rule}\n`;
    });
    responseText += `\n`;
  }

  if (category.context?.length > 0) {
    responseText += `## Files\n`;
    category.context.forEach((ctx: any) => {
      const filePath = path.join(projectPath, ctx.path);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        const finalContent = ctx.minify ? minifyCode(content) : content;
        responseText += `### ${ctx.path}\n\`\`\`\n${finalContent}\n\`\`\`\n\n`;
      } else {
        responseText += `### ${ctx.path}\nFile not found.\n\n`;
      }
    });
  }

  return responseText;
}

// ==========================================
// MODE 1: Universal Hotkey / Clipboard Injection
// ==========================================
if (process.argv.length > 2 && process.argv[2] === "inject") {
  const categoryName = process.argv[3];
  if (!categoryName) {
    console.error("Usage: cag-server inject <category_name>");
    process.exit(1);
  }

  try {
    const payload = generatePayload(categoryName, process.cwd());
    
    // Copy to clipboard (macOS specific for now)
    execSync("pbcopy", { input: payload });
    
    // Simulate Cmd+V (Paste) using AppleScript
    execSync(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`);
    
    console.log(`Successfully injected context for '${categoryName}'`);
    process.exit(0);
  } catch (err: any) {
    console.error(`Injection failed: ${err.message}`);
    process.exit(1);
  }
}

// ==========================================
// MODE 2: MCP Server (For Cursor/Claude/IDE)
// ==========================================
const server = new Server(
  { name: "cag-mcp-server", version: "1.0.1" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_category_context",
        description: "Fetches context for CAG category. Use when user types /cag <category>",
        inputSchema: {
          type: "object",
          properties: {
            categoryName: { type: "string" },
            projectPath: { type: "string" },
          },
          required: ["categoryName", "projectPath"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_category_context") {
    const categoryName = request.params.arguments?.categoryName as string;
    const projectPath = request.params.arguments?.projectPath as string;

    try {
      const payload = generatePayload(categoryName, projectPath);
      return { content: [{ type: "text", text: payload }] };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

async function runMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CAG MCP Server running on stdio");
}

runMCPServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
