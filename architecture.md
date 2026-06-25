# System Architecture: Context-Aware Gateway (MCP Edition)

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client Environment
        A[IDE / Coding Agent e.g., Cursor, Antigravity]
    end

    subgraph Context-Aware Gateway (Headless Daemon)
        B((MCP Server Endpoint))
        
        subgraph Core Logic
            D[YAML Config Parser]
            E[Code Minifier]
            F[Resource Packager]
        end
    end
    
    subgraph Filesystem (User's Working Project)
        G[.cag-config.yaml]
        H[Source Code Files]
        I[.agents/skills/cag_manager/SKILL.md]
    end

    %% Execution Flow
    A -->|User types /cag db| B
    B -->|Fetch Category 'db'| D
    D -->|Reads Config| G
    D -->|Fetches Target Paths| H
    H --> E
    E -->|Strips Function Bodies| F
    F -->|Returns Massive String| B
    B -->|Native UI Injection| A
    
    %% AI Skill Flow
    A -.->|Reads Skill| I
    A -.->|Agent Updates Config| G
```

## 2. Execution Lifecycle
1. **Trigger:** User types a slash command in their IDE (e.g., `/cag frontend`).
2. **MCP Request:** The IDE recognizes the command and sends an MCP request to the local CAG daemon via standard I/O.
3. **Configuration Lookup:** The daemon reads the `.cag-config.yaml` file located in the current project's root directory.
4. **Context Assembly:**
   - The daemon parses the requested category.
   - It gathers all global rules defined for that category.
   - It reads the requested source code files from disk.
   - Files marked for minification are passed through the minifier to extract signatures.
5. **Payload Construction:** A formatted Markdown string is generated combining the rules and minified code files.
6. **Delivery:** The daemon returns the string to the IDE via the MCP protocol.
7. **Execution:** The IDE injects the string seamlessly into the chat context window, allowing the LLM to process the user's prompt with full contextual awareness.
