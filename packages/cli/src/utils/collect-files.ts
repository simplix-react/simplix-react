import { join } from "node:path";
import { readdir } from "node:fs/promises";
import { pathExists } from "./fs.js";

export async function collectTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(d: string): Promise<void> {
    if (!(await pathExists(d))) return;
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(d, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        await walk(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
      ) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}
