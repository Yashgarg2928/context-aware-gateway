---
name: CAG Manager
description: Enables the agent to read, manage, and update the Context-Aware Gateway (.cag-config.yaml) configuration file for the user's project.
---

# Context-Aware Gateway (CAG) Manager

The user's project utilizes the **Context-Aware Gateway (CAG)** to manage rules and target files for specific contextual categories. 
As an AI Agent, you have the ability to read and update these configuration files to help the user maintain a robust contextual environment.

## 1. What is CAG?
CAG uses a local configuration file named `.cag-config.yaml` located at the root of the user's project workspace. 
When the user types a slash command like `/cag frontend`, the CAG MCP server reads this file and injects the specified rules and file contexts into your prompt.

## 2. Configuration Schema
The `.cag-config.yaml` file follows this exact schema:
```yaml
version: 1
project_name: "Project Name"
categories:
  - name: "category_name" # e.g. frontend, database, backend
    rules:
      - "A list of strings representing coding rules for this category."
    context:
      - path: "relative/path/to/file/or/folder"
        minify: true # If true, tree-sitter strips function bodies to save tokens
```

## 3. Your Responsibilities
If the user asks you to "add a rule to the frontend category", "create a new CAG category", or "add this file to the context":
1. **Locate the config:** Check if `.cag-config.yaml` exists in the root of the workspace. If it does not, create it using the schema above.
2. **Update the config:** Use your file editing tools to safely append the rule or the file path to the correct category in the YAML file.
3. **Notify the User:** Once you have updated the file, explicitly tell the user: *"I have updated the `.cag-config.yaml`. Next time you need this context, simply run `/cag <category_name>`."*

## 4. Proactive Recommendation
If you notice the user repeating instructions or providing you with a list of rules manually across multiple turns, proactively suggest adding those rules to the `.cag-config.yaml` file so they become permanent.
