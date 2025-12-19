---
trigger: glob
globs: app/Console/Commands/**/*.php
---
# Laravel Artisan Commands Guidelines

## Laravel Conventions: Artisan Commands
- Names: kebab-case (`delete-old-records`)
- Always provide feedback (`$this->comment('All ok!')`)
- Show progress for loops, summary at end
- Put output BEFORE processing item (easier debugging):
  ```php
  $items->each(function(Item $item) {
      $this->info("Processing item id `{$item->id}`...");
      $this->processItem($item);
  });
  
  $this->comment("Processed {$items->count()} items.");
  ```

## Quick Reference: Artisan Commands
- **Artisan commands**: kebab-case (`php artisan delete-old-records`)
- **File Structure**: Commands: action + `Command` suffix (`PublishScheduledPostsCommand`)
