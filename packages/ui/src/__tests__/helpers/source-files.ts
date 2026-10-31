import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Every file under `dir` whose name matches `pattern`, found by walking the tree.
 *
 * <p>Tests and `node_modules` are skipped: a source sweep asks what this package ships, and a test
 * file is where the forms a sweep looks for are written down on purpose.
 *
 * @param dir the directory to walk
 * @param pattern the file names to keep
 * @returns absolute paths, in directory order
 */
export function sourceFiles(dir: string, pattern: RegExp = /\.tsx?$/, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "__tests__") sourceFiles(path, pattern, out);
    } else if (pattern.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}
