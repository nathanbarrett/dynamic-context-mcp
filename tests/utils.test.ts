import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveContextDir, validateFilePath } from '../src/utils';

describe('resolveContextDir', () => {
  const mockCwd = '/mock/cwd';

  it('should return default directory when no args provided', () => {
    const result = resolveContextDir([], mockCwd);
    expect(result).toBe(path.resolve(mockCwd, '.agent/rules'));
  });

  it('should return custom directory when arg provided', () => {
    const customPath = 'custom/path';
    const result = resolveContextDir([customPath], mockCwd);
    expect(result).toBe(path.resolve(mockCwd, customPath));
  });

  it('should handle absolute paths in args', () => {
      const absolutePath = '/absolute/path/to/context';
      const result = resolveContextDir([absolutePath], mockCwd);
      expect(result).toBe(absolutePath);
  });
});

describe('validateFilePath', () => {
  // Valid paths - should return null
  it('should accept valid relative file paths', () => {
    expect(validateFilePath('src/components/Button.tsx')).toBeNull();
    expect(validateFilePath('README.md')).toBeNull();
    expect(validateFilePath('path/to/file.js')).toBeNull();
  });

  // Absolute paths - should return error
  it('should reject absolute Unix paths', () => {
    const result = validateFilePath('/Users/name/project/src/file.ts');
    expect(result).toContain('absolute path');
    expect(result).toContain('relative');
  });

  it('should reject absolute Windows paths', () => {
    const result = validateFilePath('C:\\Users\\name\\project\\file.ts');
    expect(result).toContain('absolute path');
  });

  // Glob patterns - should return error
  it('should reject glob patterns with asterisk', () => {
    const result = validateFilePath('**/*.ts');
    expect(result).toContain('Glob patterns');
  });

  it('should reject glob patterns with braces', () => {
    const result = validateFilePath('src/**/*.{ts,tsx}');
    expect(result).toContain('Glob patterns');
  });

  it('should reject glob patterns with brackets', () => {
    const result = validateFilePath('src/[id]/page.tsx');
    expect(result).toContain('Glob patterns');
  });

  it('should reject glob patterns with question mark', () => {
    const result = validateFilePath('src/file?.ts');
    expect(result).toContain('Glob patterns');
  });

  // Folder paths - should return error
  it('should reject folder paths ending with slash', () => {
    const result = validateFilePath('src/components/');
    expect(result).toContain('folder path');
  });

  it('should reject folder paths without extension', () => {
    const result = validateFilePath('src/components');
    expect(result).toContain('folder path');
  });
});
