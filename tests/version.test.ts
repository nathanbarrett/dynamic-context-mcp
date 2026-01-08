import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('version consistency', () => {
  it('should have matching versions in index.ts and package.json', () => {
    const rootDir = path.resolve(__dirname, '..');

    // Read package.json version
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const packageVersion = packageJson.version;

    // Read index.ts and extract version from packageVersion constant
    const indexPath = path.join(rootDir, 'src/index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    // Match: const packageVersion = "X.X.X";
    const versionMatch = indexContent.match(/const\s+packageVersion\s*=\s*["']([^"']+)["']/);
    expect(versionMatch).not.toBeNull();

    const indexVersion = versionMatch![1];

    expect(indexVersion).toBe(packageVersion);
  });
});
