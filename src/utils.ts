import path from "path";

/**
 * Validates that the filePath is a relative file path (not absolute, glob, or folder).
 * Returns an error message if invalid, or null if valid.
 */
export function validateFilePath(filePath: string): string | null {
  // 1. Detect absolute path (Unix / or Windows C:\)
  if (filePath.startsWith('/') || /^[a-zA-Z]:[\\\/]/.test(filePath)) {
    return "Error: The path must be relative to the project root. You provided an absolute path. Please use a relative path like 'src/components/MyComponent.tsx' instead of an absolute path.";
  }

  // 2. Detect glob pattern (* ? [ ] { })
  if (/[*?[\]{}]/.test(filePath)) {
    return "Error: Glob patterns are not accepted. Please provide a specific file path relative to the project root (e.g., 'src/components/MyComponent.tsx'). The file does not need to exist - you can use the path of a file you intend to create.";
  }

  // 3. Detect folder path (ends with / or has no file extension)
  if (filePath.endsWith('/') || !path.extname(filePath)) {
    return "Error: This appears to be a folder path, not a file path. Please provide a file path relative to the project root (e.g., 'src/components/MyComponent.tsx'). If the file doesn't exist yet, you can use the name of the file you intend to create.";
  }

  return null; // Valid
}

/**
 * Resolves the directory where context files are stored.
 * 
 * @param args - Command line arguments (excluding node executable and script path).
 * @param cwd - Current working directory.
 * @returns The absolute path to the context directory.
 */
export function resolveContextDir(args: string[], cwd: string): string {
  if (args[0]) {
    return path.resolve(cwd, args[0]);
  }
  return path.resolve(cwd, ".agent/rules");
}
