---
trigger: glob
globs: .github/**/*
---

## GitHub Actions

- **Node Version**: Use `setup-node` with the version specified in `.nvmrc` or `package.json` engines.
- **Triggers**: Define clear `on: push` and `on: pull_request` triggers.
- **Caching**: Cache `node_modules` to speed up builds.
