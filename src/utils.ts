import path from "path";

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
