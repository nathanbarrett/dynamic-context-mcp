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

### 1. Prepare your Context Directory

Create a folder (default is `.ai-context`) in your project root. Add markdown files with YAML frontmatter containing `patterns`:

**File:** `.ai-context/styles.md`

```markdown
---
patterns:
  - "**/*.css"
  - "src/components/**/*.tsx"
---

# UI Styling Rules

- Use Tailwind CSS for all styling.
- Primary color is #ff4500.
- Never use inline styles.
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
        "@nathanbarrett/dynamic-context-mcp",
        "/absolute/path/to/your/project/.ai-context"
      ]
    }
  }
}
```

_Note: The last argument is optional. If omitted, it looks for `.ai-context` in the directory where the MCP server runs._

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
