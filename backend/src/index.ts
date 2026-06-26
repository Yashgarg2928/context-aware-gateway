#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { execSync } from "child_process";

const gen = (catName: string, dir: string) => {
  if (!existsSync(join(dir, ".cag-config.yaml"))) throw new Error("No .cag-config.yaml");
  const cat = parse(readFileSync(join(dir, ".cag-config.yaml"), "utf8")).categories?.find((c: any) => c.name === catName);
  if (!cat) throw new Error(`Category '${catName}' missing`);

  const rules = cat.rules?.map((r: string) => `- ${r}`).join("\n") || "";
  const files = cat.context?.map((c: any) => {
    const p = join(dir, c.path);
    if (!existsSync(p)) return `### ${c.path}\nNot found.\n`;
    let body = readFileSync(p, "utf8");
    if (c.minify) body = body.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{[^\{\}]*\}/g, "{ /* minified */ }");
    return `### ${c.path}\n\`\`\`\n${body}\n\`\`\`\n`;
  }).join("\n") || "";

  return `# CAG: ${catName}\n\n${rules}\n${files}`;
};

if (process.argv[2] === "inject") {
  execSync("pbcopy", { input: gen(process.argv[3], process.cwd()) });
  execSync(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`);
  process.exit(0);
}

const srv = new Server({ name: "cag", version: "1" }, { capabilities: { tools: {} } });
srv.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_category_context",
    description: "Fetch context for /cag <category>",
    inputSchema: {
      type: "object",
      properties: { categoryName: { type: "string" }, projectPath: { type: "string" } },
      required: ["categoryName", "projectPath"],
    },
  }],
}));

srv.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name !== "get_category_context") throw new Error("Not found");
  try {
    const args = req.params.arguments as any;
    return { content: [{ type: "text", text: gen(args.categoryName, args.projectPath) }] };
  } catch (e: any) {
    return { content: [{ type: "text", text: e.message }], isError: true };
  }
});

srv.connect(new StdioServerTransport()).catch(console.error);
