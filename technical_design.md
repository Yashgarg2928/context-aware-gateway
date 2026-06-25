# Technical Design: Context-Aware Gateway (MCP Edition)

## 1. System Components
The application is intentionally kept as a minimal, headless CLI tool and background daemon written in TypeScript.

### 1.1. MCP Server Daemon (Backend)
- Implements the Model Context Protocol (MCP) over STDIO.
- **Resource/Tool Exposer:** Exposes a primary tool `get_category_context` that returns a highly formatted markdown string to the IDE.

### 1.2. Regex/AST Minifier
When a category requires context from a large file, the tool must not return 5,000 lines to the IDE.
- Parses target files and uses regex/heuristics to strip all function/method bodies.
- Reconstructs the file containing only docstrings, imports, class signatures, and function parameters.

### 1.3. AI Skill Definition
- A `SKILL.md` file injected into the user's AI configuration (e.g., `.agents/skills/cag_manager/SKILL.md`).
- Contains a precise system prompt teaching the LLM the YAML schema and guiding it on how to safely append rules or file paths to `.cag-config.yaml` when asked.

## 2. Configuration Schema (Project Level)
Stored directly in the working project root at `<Project_Root>/.cag-config.yaml`:
```yaml
version: 1
project_name: "My Awesome App"
categories:
  - name: "database"
    rules:
      - "Always use snake_case for column names."
      - "Never delete rows, use soft deletes (deleted_at)."
    context:
      - path: "src/db/schema.prisma"
        minify: false # Keep full file
      - path: "src/db/queries/*.ts"
        minify: true  # Strips bodies
```
