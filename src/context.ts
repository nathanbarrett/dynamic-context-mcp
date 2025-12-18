import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // Parses frontmatter
import { minimatch } from 'minimatch'; // Matches globs

interface ContextFile {
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
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // gray-matter separates the YAML header from the body
      const parsed = matter(fileContent);
      
      // We expect a 'patterns' or 'globs' array in the YAML frontmatter
      const globs = parsed.data.patterns || parsed.data.globs || [];
      
      if (Array.isArray(globs)) {
        results.push({
          globs: globs,
          content: parsed.content
        });
      }
    }

    return results;
  }

  // The main function the AI will call indirectly
  public getContextForPath(targetPath: string): string {
    const contextFiles = this.getAllContextFiles();
    let combinedContext = `Context for: ${targetPath}\n\n`;
    let foundMatch = false;

    for (const ctx of contextFiles) {
      // Check if the target path matches ANY of the globs in this file
      const isMatch = ctx.globs.some(pattern => minimatch(targetPath, pattern));
      
      if (isMatch) {
        foundMatch = true;
        combinedContext += `--- START CONTEXT FROM MATCHING GLOB ---\n`;
        combinedContext += ctx.content + "\n";
        combinedContext += `--- END CONTEXT ---\n\n`;
      }
    }

    if (!foundMatch) {
      return "No dynamic context found for this path.";
    }

    return combinedContext;
  }
}