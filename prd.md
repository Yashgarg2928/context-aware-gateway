# Product Requirements Document (PRD)
**Product:** Context-Aware Gateway (CAG)

## 1. Goal
Provide an ultra-simple, headless proxy that allows developers to manage project-specific context categories in a YAML file and instantly inject that context into any MCP-compatible AI coding agent via native slash commands.

## 2. Target Audience
Developers using modern, MCP-compatible AI tools (Cursor, Claude Code, Antigravity) who want a low-friction, config-driven way to manage project rules.

## 3. Core User Stories
- As a developer, I want to define categories, rules, and file mappings in a simple `.cag-config.yaml` file located in my project directory so it can be committed to Git.
- As a developer, I want to type `/cag database` in my IDE's chat window, and have the IDE natively pull in all the rules and minified database schema files I defined.
- As a developer, I want to be able to tell my AI agent, "Add the current file to the backend context category," and have the agent understand how to update the `.cag-config.yaml` file automatically using its AI Skill.

## 4. Feature Requirements

### 4.1. Model Context Protocol (MCP) Server
- A lightweight Node.js/TypeScript daemon that implements the MCP standard.
- Exposes tools/resources (e.g., `get_category_context`) that the IDE can call when the user triggers a slash command or mention.

### 4.2. File-Based Configuration
- Reads configuration from `<Project_Root>/.cag-config.yaml`.
- Requires zero UI overhead.

### 4.3. AST-Driven Context Minification
- Reads the target files from the project.
- Minifies code context by stripping function bodies and keeping signatures to save context window space.

### 4.4. AI Agent Skill
- A standardized `SKILL.md` file distributed with the tool that instructs AI agents on the schema of `.cag-config.yaml` and grants them permission to update it based on user prompts.
