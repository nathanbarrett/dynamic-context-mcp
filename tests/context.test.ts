import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { ContextManager } from '../src/context';

describe('ContextManager', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const contextManager = new ContextManager(fixturesDir);

  it('should return TypeScript context for .ts files', () => {
    const context = contextManager.getContextForPath('src/main.ts');
    expect(context).toContain('TypeScript Context');
    expect(context).toContain('general TS guidelines');
    
    // Always context should also be present
    expect(context).toContain('Always included context');
    
    // Verify Order: Always context comes BEFORE TypeScript context
    const alwaysIndex = context.indexOf('Always included context');
    const tsIndex = context.indexOf('TypeScript Context');
    expect(alwaysIndex).toBeLessThan(tsIndex);

    expect(context).not.toContain('Special File Context');
  });

  it('should return combined context for special files', () => {
    const context = contextManager.getContextForPath('src/special.ts');
    expect(context).toContain('TypeScript Context');
    expect(context).toContain('Special File Context');
    expect(context).toContain('Always included context');
    
    // Verify Order: Always -> Others
    const alwaysIndex = context.indexOf('Always included context');
    const specialIndex = context.indexOf('Special File Context');
    expect(alwaysIndex).toBeLessThan(specialIndex);
  });

  it('should return only always context for unmatched files', () => {
    const context = contextManager.getContextForPath('random.txt');
    expect(context).toContain('Always included context');
    expect(context).not.toContain('TypeScript Context');
    expect(context).not.toContain('No dynamic context found');
  });

  it('should match folder paths', () => {
    const context = contextManager.getContextForPath('src/utils/');
    expect(context).toContain('Folder specific context');
    expect(context).toContain('Always included context');
  });

  it('should not return ignored context', () => {
    const context = contextManager.getContextForPath('src/main.ts');
    expect(context).not.toContain('Ignored Context');
  });

  it('should return no context message when no files match (and no always triggers)', () => {
    // Point to a directory with no context files or only non-matching ones
    // For simplicity, we'll just point to the 'src' dir which has no .md files
    const emptyManager = new ContextManager(path.join(__dirname, '../src'));
    const context = emptyManager.getContextForPath('random.txt');
    expect(context).toBe('No dynamic context found for this path.');
  });

  it('should support globs defined as a single string', () => {
    const context = contextManager.getContextForPath('src/style.css');
    expect(context).toContain('CSS Context');
    expect(context).toContain('Use flexbox');
  });

  it('should support globs defined as an array', () => {
    // Check .js match
    const jsContext = contextManager.getContextForPath('src/app.js');
    expect(jsContext).toContain('JavaScript Context');
    expect(jsContext).toContain('Use modern JS features');

    // Check .jsx match
    const jsxContext = contextManager.getContextForPath('src/components/Button.jsx');
    expect(jsxContext).toContain('JavaScript Context');
    expect(jsxContext).toContain('Use modern JS features');
  });

  it('should handle invalid YAML gracefully', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-test-'));
    const badFile = path.join(tmpDir, 'bad.md');
    fs.writeFileSync(badFile, '---\nglobs: *.php\n---\nBad content'); // invalid yaml
    
    const manager = new ContextManager(tmpDir);
    const context = manager.getContextForPath('test.php');
    
    // Should now return context because we handle the unquoted glob
    expect(context).toContain('Bad content');
    expect(context).toContain('START CONTEXT FROM MATCHING GLOB PATTERN: *.php');
    
    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should match *.ts glob against deep paths (bug reproduction)', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-repro-'));
    
    // 1. General context targeting *.ts
    const generalMd = path.join(tmpDir, 'general.md');
    fs.writeFileSync(generalMd, '---\nglobs: "*.ts"\n---\n# General TS Context');

    // 2. Specific context targeting src/deep/**/*.ts
    const specificMd = path.join(tmpDir, 'specific.md');
    fs.writeFileSync(specificMd, '---\nglobs: "src/deep/**/*.ts"\n---\n# Specific Deep Context');

    const manager = new ContextManager(tmpDir);
    const context = manager.getContextForPath('src/deep/nested/Target.ts');

    // We expect BOTH to be present
    expect(context).toContain('Specific Deep Context');
    expect(context).toContain('General TS Context');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
