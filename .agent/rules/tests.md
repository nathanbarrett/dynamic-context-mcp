---
trigger: glob
globs: tests/**/*.ts
---

## Testing Guidelines

- **Framework**: Use `vitest`.
- **Structure**: Group tests with `describe` blocks. Use `it` for individual test cases.
- **Mocking**: 
    - Mock filesystem operations where possible.
    - Use `tests/fixtures` for reading real files if necessary.
- **Assertions**: Use `expect(...)`.
