import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // Parses frontmatter
import { minimatch } from 'minimatch'; // Matches globs

interface ContextFile {
  trigger: 'glob' | 'always';
  globs: string[];
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
      
      try {
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Regex to find unquoted globs starting with *
        // Matches "globs: *.foo" but not "globs: "*.foo""
        // Capture group 1: Newline or start of string
        // Capture group 2: The key "globs:" and whitespace
        // Capture group 3: The unquoted glob starting with *
        const unquotedGlobRegex = /(^|\r?\n)(\s*globs:\s*)(\*.*?)(\r?\n|$)/;
        const match = fileContent.match(unquotedGlobRegex);
        let capturedGlob: string | null = null;

        if (match) {
            capturedGlob = match[3].trim();
            // Replace the unquoted glob with a quoted placeholder to make YAML valid
            fileContent = fileContent.replace(unquotedGlobRegex, `$1$2"__TEMP_GLOB_PLACEHOLDER__"$4`);
        }

        // gray-matter separates the YAML header from the body
        const parsed = matter(fileContent);
        const data = parsed.data;

        // Restore the captured glob if we found one
        if (capturedGlob) {
            data.globs = capturedGlob;
        }

        // Extract trigger
        let trigger: 'glob' | 'always' = 'glob'; // Default to glob for backward compatibility if needed, or strict?
        if (data.trigger === 'always') {
          trigger = 'always';
        } else if (data.trigger === 'glob') {
          trigger = 'glob';
        } else {
           // Fallback or ignore? Let's assume files without explicit trigger might be old format or ignored.
           // For now, if no trigger is specified, we check if there are globs.
           if (data.globs) {
               trigger = 'glob';
           } else {
               continue; // Skip file if no trigger and no globs
           }
        }

        let globPatterns: string[] = [];

        if (trigger === 'glob') {
          const rawGlob = data.globs;
          
          if (typeof rawGlob === 'string') {
              globPatterns = [rawGlob];
          } else if (Array.isArray(rawGlob)) {
              globPatterns = rawGlob;
          }
          
          if (globPatterns.length === 0) {
              continue; // Skip if trigger is glob but no pattern found
          }
        }

        results.push({
          trigger: trigger,
          globs: globPatterns,
          content: parsed.content
        });
      } catch (error) {
        console.error(`Failed to parse context file: ${file}`, error);
        // Continue to next file
      }
    }

    return results;
  }

  // The main function the AI will call indirectly
  public getContextForPath(targetPath: string): string {
    const contextFiles = this.getAllContextFiles();
    
    const alwaysMatches = contextFiles.filter(ctx => ctx.trigger === 'always');
    
    // Find files that match via glob, and capture the specific pattern that matched
    const conditionalMatches: { file: ContextFile, matchedPattern: string }[] = [];
    
    for (const ctx of contextFiles) {
        if (ctx.trigger !== 'glob' || ctx.globs.length === 0) continue;
        
        // Find the FIRST matching glob pattern
        const matchedPattern = ctx.globs.find(pattern => minimatch(targetPath, pattern, { matchBase: true }));
        
        if (matchedPattern) {
            conditionalMatches.push({ file: ctx, matchedPattern });
        }
    }

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
    for (const match of conditionalMatches) {
        combinedContext += `--- START CONTEXT FROM MATCHING GLOB PATTERN: ${match.matchedPattern} ---\n`;
        combinedContext += match.file.content + "\n";
        combinedContext += `--- END CONTEXT ---\n\n`;
    }

    return combinedContext;
  }
}