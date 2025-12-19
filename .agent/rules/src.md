---
trigger: glob
globs: src/**/*.ts
---

## Source Code Guidelines

- **Strict Typing**: Always use explicit types. Avoid `any` at all costs.
- **Async/Await**: Prefer `async/await` over promise chaining.
- **Error Handling**: 
    - Wrap MCP tool execution in `try/catch`.
    - Return structured error responses `{ isError: true, content: ... }`.
- **Imports**: Use ES6 imports.
