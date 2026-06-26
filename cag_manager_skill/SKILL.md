---
name: cag
description: Manages Context-Aware Gateway (CAG) profiles. Use when the user asks to update context rules, files, or categories for their project.
---

# Context-Aware Gateway (CAG) Skill

When the user types `/cag <project-id> <category>`, the MCP server fetches context for that category.

If the user asks you to ADD or EDIT a rule/file in their CAG context:
1. Assume the project is local. Read `.cag-config.yaml` in their project root.
2. If it doesn't exist, create it with this schema:
```yaml
version: 1
categories:
  - name: "frontend"
    rules: ["Always use React Hooks"]
    context:
      - path: "src/App.tsx"
        minify: true
```
3. Edit `.cag-config.yaml` to add the requested rules or file paths.
4. If the user is editing a "Cloud" project stored in `~/.cag.json`, politely decline and tell them to run `cag ui` to edit it visually in the dashboard.
