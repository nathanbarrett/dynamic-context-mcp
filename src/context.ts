import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // Parses frontmatter
import { minimatch } from 'minimatch'; // Matches globs

interface ContextFile {
  trigger: 'glob' | 'always';
  glob?: string;
  content: string;
}

export class ContextManager {
  private contextDir: string;

  constructor(contextDir: string) {
    this.contextDir = contextDir;
  }

  // Scans the directory for .md files and parses their headers
  private getAllContextFiles(): ContextFile[] {
    if (!fs.existsSync(this.contextDir)) {
      return [];
    }

    const files = fs.readdirSync(this.contextDir).filter(f => f.endsWith('.md'));
    const results: ContextFile[] = [];

    for (const file of files) {
      const filePath = path.join(this.contextDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // gray-matter separates the YAML header from the body
      const parsed = matter(fileContent);
      const data = parsed.data;

      // Extract trigger
      let trigger: 'glob' | 'always' = 'glob'; // Default to glob for backward compatibility if needed, or strict?
      if (data.trigger === 'always') {
        trigger = 'always';
      } else if (data.trigger === 'glob') {
        trigger = 'glob';
      } else {
         // Fallback or ignore? Let's assume files without explicit trigger might be old format or ignored.
         // For now, if no trigger is specified, we check if there are globs.
         if (data.globs || data.patterns) {
             trigger = 'glob';
         } else {
             continue; // Skip file if no trigger and no globs
         }
      }

      let globPattern: string | undefined;

      if (trigger === 'glob') {
        // Handle 'globs' (plural in antigravity but we treat as single) or 'patterns'
        const rawGlob = data.globs || data.patterns;
        
        if (typeof rawGlob === 'string') {
            globPattern = rawGlob;
        } else if (Array.isArray(rawGlob) && rawGlob.length > 0) {
            // Take the first one if it's an array
            globPattern = rawGlob[0];
        }
        
        if (!globPattern) {
            continue; // Skip if trigger is glob but no pattern found
        }
      }

      results.push({
        trigger: trigger,
        glob: globPattern,
        content: parsed.content
      });
    }

    return results;
  }

  // The main function the AI will call indirectly
  public getContextForPath(targetPath: string): string {
    const contextFiles = this.getAllContextFiles();
    
    const alwaysMatches = contextFiles.filter(ctx => ctx.trigger === 'always');
    const conditionalMatches = contextFiles.filter(ctx => {
        if (ctx.trigger !== 'glob' || !ctx.glob) return false;
        return minimatch(targetPath, ctx.glob);
    });

    if (alwaysMatches.length === 0 && conditionalMatches.length === 0) {
      return "No dynamic context found for this path.";
    }

    let combinedContext = `Context for: ${targetPath}\n\n`;

    // 1. Add 'always' matches first
    for (const ctx of alwaysMatches) {
        combinedContext += `--- START CONTEXT (ALWAYS) ---\n`;
        combinedContext += ctx.content + "\n";
        combinedContext += `--- END CONTEXT ---\n\n`;
    }

    // 2. Add 'glob' matches second
    for (const ctx of conditionalMatches) {
        combinedContext += `--- START CONTEXT FROM MATCHING GLOB ---\n`;
        combinedContext += ctx.content + "\n";
        combinedContext += `--- END CONTEXT ---\n\n`;
    }

    return combinedContext;
  }
}