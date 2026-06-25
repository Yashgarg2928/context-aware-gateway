# Implementation Plan: Context-Aware Gateway (MCP Edition)

This document outlines the step-by-step implementation plan to build the Context-Aware Gateway (CAG) utilizing the Model Context Protocol (MCP) and a local Web UI. It also includes the integration of an AI "Skill" so coding agents know how to interact with and update the configuration.

## Phase 1: Project Setup & Local Web UI
**Goal:** Build the visual dashboard for managing projects and the config file manager.
1. **Daemon Initialization:** Set up a lightweight Go or Rust backend. This will serve the frontend statics and act as the local API.
2. **Web UI Construction:** Build a React/Vite dashboard where users can select a local folder to initialize as a "CAG Project".
3. **Config Manager:** Implement the logic to create, read, and update a `.cag-config.yaml` file located directly inside the user's working project directory. The Web UI will provide a visual editor for defining Categories, Rules, and Target Files.

## Phase 2: The MCP Server (The Integration Layer)
**Goal:** Allow IDEs and AI Agents to fetch context natively via slash commands (`/`) or mentions (`@`).
1. **MCP SDK Integration:** Implement the Model Context Protocol in the Go/Rust daemon.
2. **Expose Tools/Resources:** Expose an MCP tool (e.g., `fetch_category_context(category_name)`). When an IDE triggers this via a slash command, the daemon processes the request.
3. **Tree-Sitter Minifier:** Integrate `tree-sitter` parsers. When the MCP tool is called, the daemon reads the project's config, extracts the requested files, strips function bodies (leaving only signatures/docstrings), and returns the massive string payload back to the IDE.

## Phase 3: The AI "Skill" Integration
**Goal:** Teach autonomous AI agents (like Antigravity, Claude Code) how to manage the context rules for the user.
1. **Skill Definition (`SKILL.md`):** We will create a standardized Skill file that gets placed in the user's agent customizations.
2. **Skill Capabilities:** The instructions will teach the agent:
   - **Schema Understanding:** How to read and understand the project's local `.cag-config.yaml`.
   - **Config Mutation:** If the user says *"Agent, add a rule to the frontend category that we must use Tailwind"*, the agent will know how to safely edit the `.cag-config.yaml` file to append that rule.
   - **Context Recommendation:** The agent will proactively suggest: *"I've updated the rules. Next time you work on this, use the `/cag frontend` command to load this context."*

## Phase 4: Packaging and Distribution
**Goal:** Make installation seamless.
1. Bundle the React UI statics directly into the Go/Rust binary.
2. Set up release pipelines for macOS, Linux, and Windows.
3. Provide a simple `brew install` or `curl | bash` installation script.
