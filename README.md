# Context-Aware Gateway (CAG)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A headless, ultra-fast Model Context Protocol (MCP) server that injects massive, project-specific context blocks into AI coding agents using native slash commands.

## The Problem
Feeding an entire codebase to AI coding agents causes "context pollution" and token limit errors. Copy-pasting specific files and rules manually every time you start a new chat is incredibly tedious. 

## The Solution
CAG solves this by allowing you to define a simple `.cag-config.yaml` file in the root of your project. You map specific categories (like "frontend", "database", or "auth") to specific files and global rules. 

Because CAG acts as a local **Model Context Protocol (MCP) Server**, you simply type `/cag frontend` in your IDE (Cursor, Claude Code, etc.), and the daemon instantly parses your YAML, minifies the code, and injects the perfect context natively.

## Features
- **Native IDE Integration:** Seamlessly works with any MCP-compatible client. No hacky clipboard management.
- **Ultra-Lightweight & Headless:** Zero UI overhead. Configuration is strictly driven by version-controllable YAML files that travel with your project.
- **Token-Saving Minification:** Automatically strips function bodies and huge code blocks from target files, injecting only class signatures and docstrings to save precious LLM tokens.
- **AI "Skills" Enabled:** Comes with an AI Skill (`SKILL.md`) that teaches autonomous coding agents how to read and modify the `.cag-config.yaml` file themselves. Just ask your agent to "add this rule to the config!"

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed, then clone the repository and build the daemon:

```bash
git clone https://github.com/yourusername/context-aware-gateway.git
cd context-aware-gateway/backend
npm install
npm run build
```

## IDE Configuration

### For Cursor
Add the local MCP server to your Cursor settings by providing the path to the compiled daemon:
`node /path/to/context-aware-gateway/backend/dist/index.js`

### For Claude Code
```bash
claude mcp add cag node /path/to/context-aware-gateway/backend/dist/index.js
```

## Usage

1. Create a `.cag-config.yaml` file in the root of your working project:

```yaml
version: 1
project_name: "My App"
categories:
  - name: "database"
    rules:
      - "Always use snake_case for column names."
    context:
      - path: "src/db/schema.prisma"
        minify: false
      - path: "src/db/queries.ts"
        minify: true
```

2. Open your AI agent chat and type: `/cag database`. The agent will instantly fetch the rules and minified files!

## Contributing
Contributions are welcome! Please open an issue or submit a Pull Request.

## License
MIT License
