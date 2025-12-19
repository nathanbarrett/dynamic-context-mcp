---
trigger: glob
globs: **/*Controller.php
---
# Laravel Controllers Guidelines

## Laravel Conventions: Controllers
- Plural resource names (`PostsController`)
- Stick to CRUD methods (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`)
- Extract new controllers for non-CRUD actions

## Quick Reference: Controllers
- **Classes**: PascalCase (`UserController`, `OrderStatus`)
- **File Structure**: Controllers: plural resource name + `Controller` (`PostsController`)
