# Dynamic Context MCP Server

**A Model Context Protocol (MCP) server that injects "Just-in-Time" context into AI conversations based on file paths and glob patterns.**

![License](https://img.shields.io/badge/license-MIT-blue) ![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)

## 🚀 What is this?

When coding with AI, you often have specific guidelines, architectural patterns, or database schemas that apply only to certain parts of your codebase.

**Dynamic Context MCP** allows you to define these rules in Markdown files with glob pattern headers. When the AI agent (like Claude or Gemini) looks at a specific file path, this tool automatically injects the relevant context for that file.

**Example Flow:**

1. You are working on `src/backend/api.ts`.
2. The AI calls this tool with that path.
3. This server finds `backend-guidelines.md` (which matches `src/backend/**/*.ts`).
4. The AI receives your backend rules _before_ it generates code.

---

## 📦 usage

### Quick Start (instead of manual setup)

Run the init command to automatically detect your framework (Laravel, Next.js, Python), create starter rules in `.agent/rules`, and append (NOT OVERWRITE) your primary context files (like `GEMINI.md`, `CLAUDE.md`, or `.cursorrules`) with the necessary instructions.

```bash
npx dynamic-context-mcp init
```

### 1. Prepare your Context Directory

Create a folder (default is `.agent/rules`) in your project root. Add markdown files with YAML frontmatter containing `globs` (either a single string or a list).

**Example 1: Single Glob**

**File:** `.agent/rules/styles.md`

```markdown
---
trigger: glob
globs: "**/*.css"
---

# CSS Rules

- Use flexbox layout.
```

**Example 2: Multiple Globs**

**File:** `.agent/rules/backend.md`

```markdown
---
trigger: glob
globs:
  - "src/backend/**/*.ts"
  - "config/**/*.json"
---

# Backend Rules

- Ensure strict type checking.
- Do not commit secrets in config files.
```

**Example 3: Always Trigger**

Use this for high-level rules that should apply to _every_ file, such as general coding standards or project philosophy.

**File:** `.agent/rules/general.md`

```markdown
---
trigger: always
---

# General Guidelines

- Write clean, commented code.
- Follow SOLID principles.
```

### 2. Configure your AI Client

Add this to your MCP configuration file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "dynamic-context": {
      "command": "npx",
      "args": [
        "-y",
        "dynamic-context-mcp",
        "/optional/absolute/path/to/your/project/.agent/rules"
      ]
    }
  }
}
```

_Note: The last argument is optional. If omitted, it looks for `.agent/rules` in the directory where the MCP server runs._

### 3. IMPORTANT: Agent Configuration

To ensure your AI agent uses this tool effectively, add the following instruction to your agent's system prompt or custom instructions (e.g., in `GEMINI.md`, `CLAUDE.md`, or your agent's settings):

```
<!-- DYNAMIC CONTEXT MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## DYNAMIC CONTEXT INSTRUCTIONS

This project uses dynamic context mcp to deliver "just in time" context for files that you are about to read, create, or edit.

**CRITICAL GUIDANCE**

- Before you read, create, or edit a file, check for dynamic context by requesting the `dynamic-context.get_context_for_file` tool with the file path as input.
- If dynamic context is available, read it carefully to understand important details about how to work with that file.

</CRITICAL_INSTRUCTION>

<!-- DYNAMIC CONTEXT MCP GUIDELINES END -->
```

---

## 🛠 Local Development

If you want to modify or contribute to this project:

1. **Clone the repo:**

   ```bash
   git clone [https://github.com/yourusername/dynamic-context-mcp.git](https://github.com/yourusername/dynamic-context-mcp.git)
   cd dynamic-context-mcp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**

   ```bash
   npm run build
   ```

4. **Test locally:**
   You can run the compiled script directly:
   ```bash
   node dist/index.js ./path/to/test/context-folder
   ```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License.
