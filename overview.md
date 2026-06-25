# Project Overview: Context-Aware Gateway (MCP Edition)

## The Problem
Developers use AI coding agents extensively, but managing the "context" for these agents—ensuring they know the specific rules, database schemas, and architectures for a given task—is tedious. Copy-pasting context manually is slow, and feeding the entire codebase causes "context pollution" and token limit errors.

## The Solution
The Context-Aware Gateway (CAG) is an ultra-lightweight, headless local tool that uses the **Model Context Protocol (MCP)** to inject precise context using standard IDE slash commands (e.g., `/cag frontend`). It relies entirely on a simple `.cag-config.yaml` file in your project root, keeping things incredibly simple and fast.

## Key Differentiators
- **Native IDE Integration (MCP):** CAG runs as an MCP server in the background. It integrates flawlessly into the native UI of modern tools like Cursor, Claude Code, and Antigravity via slash commands or @mentions.
- **Headless & Simple Configuration:** There is no heavy UI. You simply define your categories, rules, and files in a `.cag-config.yaml` file inside your working project. Your rules are version-controllable and travel with your code.
- **AI "Skills" Enabled:** The project includes an AI Skill definition (`SKILL.md`) that teaches autonomous coding agents how to read and modify the `.cag-config.yaml` file themselves. You can simply ask your agent to "add this new rule to the database category," and the agent will edit the YAML for you.
- **Zero-Latency Minification:** CAG strips massive code files down to just their function signatures and docstrings before handing them to the LLM, saving tokens and preserving LLM attention.
