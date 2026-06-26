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

const server = new Server(
  {
    name: "cag-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function loadConfig(targetDir: string) {
  const configPath = path.join(targetDir, ".cag-config.yaml");
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
  }
  const fileContent = fs.readFileSync(configPath, "utf8");
  return yaml.parse(fileContent);
}

function minifyCode(code: string): string {
  let minified = code;
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  minified = minified.replace(/\{[^\{\}]*\}/g, '{ /* body minified */ }');
  return minified;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_category_context",
        description:
          "Fetches the context rules and files for a specific Context-Aware Gateway (CAG) category. Use this whenever the user types /cag <category>",
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
      const config = loadConfig(projectPath);
      const category = config.categories?.find((c: any) => c.name === categoryName);

      if (!category) {
        return {
          content: [{ type: "text", text: `Error: Category '${categoryName}' not found in .cag-config.yaml` }],
          isError: true,
        };
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

      return { content: [{ type: "text", text: responseText }] };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CAG MCP Server running on stdio");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
