import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveContextDir } from '../src/utils';

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
