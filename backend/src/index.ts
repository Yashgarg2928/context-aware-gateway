#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { parse } from "yaml";
import { execSync } from "child_process";
import { createServer } from "http";

const dbPath = join(homedir(), ".cag.json");
if (!existsSync(dbPath)) writeFileSync(dbPath, JSON.stringify({ projects: [] }));
const getDb = () => JSON.parse(readFileSync(dbPath, "utf8"));
const saveDb = (d: any) => writeFileSync(dbPath, JSON.stringify(d, null, 2));

const minify = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{[^\{\}]*\}/g, "{ /* minified */ }");

const gen = (projId: string, catName: string) => {
  const db = getDb();
  const proj = db.projects.find((p: any) => p.id === projId);
  if (!proj) throw new Error("Project not found in central DB. Open 'cag ui' to add it.");

  let cat;
  if (proj.type === "local") {
    if (!existsSync(join(proj.path, ".cag-config.yaml"))) throw new Error(`No .cag-config.yaml in ${proj.path}`);
    cat = parse(readFileSync(join(proj.path, ".cag-config.yaml"), "utf8")).categories?.find((c: any) => c.name === catName);
  } else {
    cat = proj.categories?.find((c: any) => c.name === catName);
  }
  
  if (!cat) throw new Error(`Category '${catName}' missing`);

  const rules = cat.rules?.map((r: string) => `- ${r}`).join("\n") || "";
  const snippets = cat.text_snippets?.map((s: string) => `> ${s}`).join("\n") || "";
  const files = cat.context?.map((c: any) => {
    if (proj.type !== "local") return "";
    const p = join(proj.path, c.path);
    if (!existsSync(p)) return `### ${c.path}\nNot found.\n`;
    return `### ${c.path}\n\`\`\`\n${c.minify ? minify(readFileSync(p, "utf8")) : readFileSync(p, "utf8")}\n\`\`\`\n`;
  }).join("\n") || "";

  return `# CAG: ${projId} -> ${catName}\n\n${rules}\n${snippets}\n${files}`;
};

const mode = process.argv[2];

if (mode === "inject") {
  execSync("pbcopy", { input: gen(process.argv[3], process.argv[4]) });
  execSync(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`);
  process.exit(0);
}

if (mode === "ui") {
  createServer((req, res) => {
    if (req.method === "GET" && req.url === "/api/db") return res.end(readFileSync(dbPath));
    if (req.method === "POST" && req.url === "/api/db") {
      let body = "";
      req.on("data", c => body += c);
      req.on("end", () => { saveDb(JSON.parse(body)); res.end("ok"); });
      return;
    }
    res.end(`<!DOCTYPE html><html><head><title>CAG Central</title>
      <style>body{font-family:system-ui;background:#111;color:#fff;max-width:800px;margin:0 auto;padding:2rem;} input,select,textarea{background:#222;color:#fff;border:1px solid #444;padding:8px;width:100%;margin:4px 0;} button{background:#2563eb;color:#fff;border:none;padding:8px 16px;cursor:pointer;} .card{border:1px solid #333;padding:1rem;margin-bottom:1rem;border-radius:8px;}</style>
      </head><body><h1>CAG Central Management</h1><div id="app"></div>
      <script>
        const load = async () => {
          const db = await (await fetch('/api/db')).json();
          document.getElementById('app').innerHTML = db.projects.map((p, i) => \`
            <div class="card">
              <h3>\${p.id} <span style="color:#888;font-size:12px;">(\${p.type})</span></h3>
              \${p.type === 'local' ? \`<p>Points to: \${p.path}</p>\` : \`<textarea onchange="updateCat(\${i}, this.value)" rows="5" placeholder='[{"name": "prompting", "rules": ["Always use markdown"], "text_snippets": ["System prompt context..."]}]'>\${JSON.stringify(p.categories || [])}</textarea>\`}
              <button onclick="del(\${i})" style="background:#dc2626">Delete Project</button>
            </div>
          \`).join('') + \`
            <div class="card"><h3>Add Project</h3>
            <input id="nId" placeholder="Project ID (e.g. google-ai-studio)">
            <select id="nType" onchange="document.getElementById('nPath').style.display=this.value==='local'?'block':'none'"><option value="local">Local Codebase</option><option value="cloud">Cloud / Web App</option></select>
            <input id="nPath" placeholder="Absolute path to folder (e.g. /Users/.../my-app)">
            <button onclick="add()">Create Project</button></div>\`;
        };
        const save = async (db) => { await fetch('/api/db', {method:'POST',body:JSON.stringify(db)}); load(); };
        const updateCat = async (i, val) => { const db = await (await fetch('/api/db')).json(); db.projects[i].categories = JSON.parse(val); save(db); };
        const add = async () => { const db = await (await fetch('/api/db')).json(); db.projects.push({id:document.getElementById('nId').value, type:document.getElementById('nType').value, path:document.getElementById('nPath').value, categories:[]}); save(db); };
        const del = async (i) => { const db = await (await fetch('/api/db')).json(); db.projects.splice(i, 1); save(db); };
        load();
      </script></body></html>`);
  }).listen(3030, () => {
    console.log("CAG UI running at http://localhost:3030");
    execSync("open http://localhost:3030");
  });
}

if (!mode || mode === "mcp") {
  const srv = new Server({ name: "cag", version: "2" }, { capabilities: { tools: {} } });
  srv.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [{
      name: "get_category_context",
      description: "Fetch context for /cag <project> <category>",
      inputSchema: { type: "object", properties: { projectId: { type: "string" }, categoryName: { type: "string" } }, required: ["projectId", "categoryName"] },
    }],
  }));
  srv.setRequestHandler(CallToolRequestSchema, async (req) => {
    try {
      const args = req.params.arguments as any;
      return { content: [{ type: "text", text: gen(args.projectId, args.categoryName) }] };
    } catch (e: any) { return { content: [{ type: "text", text: e.message }], isError: true }; }
  });
  srv.connect(new StdioServerTransport()).catch(console.error);
}
