# Context-Aware Gateway (CAG)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A universal, headless context manager for AI coding agents and web-based LLMs. Manage your project rules and massive file contexts centrally, and instantly inject them into Cursor, Claude Code, or Google AI Studio.

## The Problem
Feeding an entire codebase to AI coding agents causes "context pollution". Copy-pasting specific files and rules manually every time you start a new chat is tedious.

## The Solution
CAG acts as a centralized database (`~/.cag.json`) with three powerful modes:
1. **The Web UI:** A zero-dependency local dashboard to manage all your "Projects" centrally.
2. **The MCP Server:** Native integration for Cursor and Claude.
3. **The Universal Injector:** A terminal command you can bind to a hotkey that instantly minifies context, copies it, and pastes it into any web browser text box.

## Project Types
CAG supports two types of projects:
- **Local Codebase:** Point CAG to a folder on your Mac. It reads a `.cag-config.yaml` inside that folder, allowing your autonomous AI agents to edit the rules natively.
- **Cloud / Web App:** For web tools where you have no local folder. You define your rules and snippets directly in the CAG Central dashboard.

## Installation

```bash
git clone https://github.com/yourusername/context-aware-gateway.git
cd context-aware-gateway/backend
npm install
npm run build
npm install -g .
```

## Usage

### 1. Central Management
Open the UI from anywhere:
```bash
cag ui
```
*This opens your browser to `http://localhost:3030`. Add a project here first!*

### 2. For IDEs (Cursor, Claude Code, etc.)
You only need to configure this once. The IDE will automatically run it in the background.

**Cursor:**
1. Go to Settings -> Features -> MCP Servers
2. Click **+ Add New MCP Server**
3. Name: `CAG` | Type: `command` | Command: `cag mcp`

**Claude Code (CLI):**
Run this in your terminal:
```bash
claude mcp add cag "cag mcp"
```

**Claude Desktop App:**
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "cag": {
      "command": "cag",
      "args": ["mcp"]
    }
  }
}
```

**Cline / RooCode (VS Code):**
Open the MCP Servers tab in the extension, click `+`, and set the command to `cag mcp`.

Then simply type `/cag <project-id> <category>` in your agent chat to natively fetch your rules and minified files.

### 3. For Web Browsers (Universal Injector)
If you are using ChatGPT or Google AI Studio, run this command (or bind it to an Alfred/Raycast hotkey):
```bash
cag inject <project-id> <category>
```
*CAG will grab the context, copy it to your clipboard, and automatically press `Cmd+V` to paste it into your active text box!*
