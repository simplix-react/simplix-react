import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeFileWithDir(
  filePath: string,
  content: string,
): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, "utf-8");
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as T;
}

export function resolveFromRoot(root: string, ...segments: string[]): string {
  return join(root, ...segments);
}

/**
 * Find the monorepo project root by traversing up from `startDir`.
 * Looks for `simplix.config.ts` as the primary indicator,
 * then `pnpm-workspace.yaml` as a fallback.
 * Returns `startDir` if no marker is found (original behavior).
 */
export async function findProjectRoot(startDir: string): Promise<string> {
  const markers = ["simplix.config.ts", "pnpm-workspace.yaml"];
  let dir = resolve(startDir);

  while (true) {
    for (const marker of markers) {
      if (await pathExists(join(dir, marker))) {
        return dir;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break; // filesystem root
    dir = parent;
  }

  return resolve(startDir);
}
