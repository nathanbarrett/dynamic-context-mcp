import fs from 'fs/promises';
import path from 'path';

export async function initCommand(args: string[]): Promise<void> {
  console.log("Initializing dynamic-context-mcp...");
  
  const cwd = process.cwd();
  
  // 1. Detect Framework
  const framework = await detectFramework(cwd);
  if (framework) {
    console.log(`Detected framework: ${framework}`);
  } else {
    console.log("No specific framework detected.");
  }

  // 2. Install Starter Pack
  if (framework) {
    const rulesDir = path.join(cwd, '.agent', 'rules');
    try {
      await fs.access(rulesDir);
      console.log(".agent/rules already exists. Skipping starter pack installation.");
    } catch {
      console.log(`Creating ${rulesDir} and installing ${framework} starter pack...`);
      await fs.mkdir(rulesDir, { recursive: true });
      
      // Locate starter packs in dist/starter-packs.
      // Since this file is in dist/commands/, we go up one level to dist/starter-packs
      const starterPackDir = path.resolve(__dirname, '../starter-packs', framework);
      
      try {
        const files = await fs.readdir(starterPackDir);
        for (const file of files) {
          const src = path.join(starterPackDir, file);
          const dest = path.join(rulesDir, file);
          await fs.copyFile(src, dest);
          console.log(`  Created ${file}`);
        }
      } catch (err: any) {
        console.error(`Failed to copy starter pack: ${err.message}`);
        console.error(`Checked path: ${starterPackDir}`);
      }
    }
  }

  // 3. Append Guidelines to Context Files
  const contextFiles = ['GEMINI.md', 'CLAUDE.md', 'AGENTS.md', 'cursorrules', '.cursorrules'];
  
  // README is in the package root.
  // If running from dist/commands/, package root is ../../
  const packageRoot = path.resolve(__dirname, '../../');
  const readmePath = path.join(packageRoot, 'README.md');
  
  let guidelines = "";
  try {
    const readmeContent = await fs.readFile(readmePath, 'utf-8');
    const startMarker = "<!-- DYNAMIC CONTEXT MCP GUIDELINES START -->";
    const endMarker = "<!-- DYNAMIC CONTEXT MCP GUIDELINES END -->";
    const startIndex = readmeContent.indexOf(startMarker);
    const endIndex = readmeContent.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
      guidelines = readmeContent.substring(startIndex, endIndex + endMarker.length);
    } else {
        console.warn("Could not find guidelines markers in README.md");
    }
  } catch (err) {
    console.warn("Could not read README.md to extract guidelines.");
  }

  if (guidelines) {
    for (const file of contextFiles) {
      const filePath = path.join(cwd, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        if (!content.includes("DYNAMIC CONTEXT MCP GUIDELINES START")) {
          console.log(`Appending guidelines to ${file}...`);
          await fs.appendFile(filePath, "\n\n" + guidelines);
        } else {
            console.log(`Guidelines already present in ${file}.`);
        }
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
             console.error(`Error processing ${file}: ${err.message}`);
        }
        // File doesn't exist, ignore
      }
    }
  }
}

async function detectFramework(cwd: string): Promise<string | null> {
  // Laravel
  try {
    const composerPath = path.join(cwd, 'composer.json');
    await fs.access(composerPath); // Ensure file exists before reading
    const composerJson = JSON.parse(await fs.readFile(composerPath, 'utf-8'));
    if (composerJson.require && composerJson.require['laravel/framework']) {
      return 'laravel';
    }
  } catch {} // Ignore errors, just means it's not Laravel

  // Next.js
  try {
    const packagePath = path.join(cwd, 'package.json');
    await fs.access(packagePath);
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
    if ((packageJson.dependencies && packageJson.dependencies['next']) || 
        (packageJson.devDependencies && packageJson.devDependencies['next'])) {
      return 'nextjs';
    }
  } catch {} // Ignore errors

  // Python
  try {
    await fs.access(path.join(cwd, 'requirements.txt'));
    return 'python';
  } catch {} // Ignore errors
  try {
    await fs.access(path.join(cwd, 'Pipfile'));
    return 'python';
  } catch {} // Ignore errors
   try {
    await fs.access(path.join(cwd, 'pyproject.toml'));
    return 'python';
  } catch {} // Ignore errors

  return null;
}