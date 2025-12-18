#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ContextManager } from "./context.js";
import { resolveContextDir } from "./utils.js";
import path from "path";

// Initialize the server
const server = new McpServer({
  name: "dynamic-context-mcp",
  version: "1.0.0",
});

// Determine where the markdown files live.
// Users can pass an argument: npx @nathan/mcp ./my-context-folder
// Default is a folder named ".agent/rules" in the current working directory
const contextDir = resolveContextDir(process.argv.slice(2), process.cwd());

const contextManager = new ContextManager(contextDir);

// Define the Tool
server.tool(
  "get_context_for_file",
  "Retrieves coding guidelines and context based on the file path provided. Call this before editing code.",
  {
    filePath: z.string().describe("The file or folder path you are about to edit or create"),
  },
  async ({ filePath }) => {
    try {
      const context = contextManager.getContextForPath(filePath);
      return {
        content: [
          {
            type: "text",
            text: context,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving context: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start the server using Stdio (Standard Input/Output)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Dynamic Context MCP Server running on stdio scanning: ${contextDir}`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});