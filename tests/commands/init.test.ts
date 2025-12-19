import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initCommand } from '../../src/commands/init';
import fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises');

describe('initCommand', () => {
  const mockCwd = '/mock/cwd';
  
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(mockCwd);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects Laravel and installs starter pack', async () => {
    // Mock checks
    vi.mocked(fs.access).mockImplementation(async (p: any) => {
      if (p.endsWith('composer.json')) return;
      throw { code: 'ENOENT' };
    });

    vi.mocked(fs.readFile).mockImplementation(async (p: any) => {
      if (p.endsWith('composer.json')) {
        return JSON.stringify({ require: { 'laravel/framework': '^10.0' } });
      }
      if (p.includes('README.md')) {
          return "<!-- DYNAMIC CONTEXT MCP GUIDELINES START -->GUIDELINES<!-- DYNAMIC CONTEXT MCP GUIDELINES END -->";
      }
      throw { code: 'ENOENT' };
    });

    vi.mocked(fs.readdir).mockResolvedValue(['test.md'] as any);

    await initCommand([]);

    // Verify .agent/rules creation
    expect(fs.mkdir).toHaveBeenCalledWith(path.join(mockCwd, '.agent', 'rules'), { recursive: true });
    
    // Verify file copy
    // We expect copyFile to be called for 'test.md'
    expect(fs.copyFile).toHaveBeenCalled();
  });

  it('detects Next.js and installs starter pack', async () => {
     vi.mocked(fs.access).mockImplementation(async (p: any) => {
      if (p.endsWith('package.json')) return;
      throw { code: 'ENOENT' };
    });

    vi.mocked(fs.readFile).mockImplementation(async (p: any) => {
      if (p.endsWith('package.json')) {
        return JSON.stringify({ dependencies: { 'next': '14.0.0' } });
      }
      if (p.includes('README.md')) {
          return "";
      }
      throw { code: 'ENOENT' };
    });
    
    vi.mocked(fs.readdir).mockResolvedValue(['next.md'] as any);

    await initCommand([]);
    
    expect(fs.mkdir).toHaveBeenCalledWith(path.join(mockCwd, '.agent', 'rules'), { recursive: true });
  });

  it('appends guidelines to context files', async () => {
    // No framework
    vi.mocked(fs.access).mockRejectedValue({ code: 'ENOENT' });
    
    vi.mocked(fs.readFile).mockImplementation(async (p: any) => {
        if (p.includes('README.md')) {
            return "<!-- DYNAMIC CONTEXT MCP GUIDELINES START -->\nNEW GUIDELINES\n<!-- DYNAMIC CONTEXT MCP GUIDELINES END -->";
        }
        if (p.endsWith('GEMINI.md')) {
            return "# My Prompt";
        }
        throw { code: 'ENOENT' };
    });

    await initCommand([]);

    expect(fs.appendFile).toHaveBeenCalledWith(
        path.join(mockCwd, 'GEMINI.md'), 
        expect.stringContaining("NEW GUIDELINES")
    );
  });
  
  it('does not append guidelines if already present', async () => {
     // No framework
    vi.mocked(fs.access).mockRejectedValue({ code: 'ENOENT' });
    
    vi.mocked(fs.readFile).mockImplementation(async (p: any) => {
        if (p.includes('README.md')) {
             return "<!-- DYNAMIC CONTEXT MCP GUIDELINES START -->\nNEW GUIDELINES\n<!-- DYNAMIC CONTEXT MCP GUIDELINES END -->";
        }
        if (p.endsWith('GEMINI.md')) {
            return "# My Prompt\n<!-- DYNAMIC CONTEXT MCP GUIDELINES START -->\nOLD GUIDELINES";
        }
        throw { code: 'ENOENT' };
    });

    await initCommand([]);

    expect(fs.appendFile).not.toHaveBeenCalled();
  });
});
