---
trigger: glob
globs: routes/**/*.php
---
# Laravel Routes Guidelines

## Laravel Conventions: Routes
- URLs: kebab-case (`/open-source`)
- Route names: camelCase (`->name('openSource')`)
- Parameters: camelCase (`{userId}`)
- Use tuple notation: `[Controller::class, 'method']`

## API Routing
- Use plural resource names: `/errors`
- Use kebab-case: `/error-occurrences`
- Limit deep nesting for simplicity:
  ```
  /error-occurrences/1
  /errors/1/occurrences
  ```

## Quick Reference: Routes
- **Routes**: kebab-case (`/open-source`, `/user-profile`)
