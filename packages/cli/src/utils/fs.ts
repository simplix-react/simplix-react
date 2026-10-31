import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

/**
 * Where writes go while a generator runs in capture mode: path to content, nothing on disk.
 *
 * <p>Set only by {@link captureWrites}, which the generated-state report uses to learn what a
 * generator would write now without changing the tree it is judging.
 */
let writeSink: Map<string, string> | null = null;

/**
 * What a captured run rendered for a file it then kept because somebody had edited it, keyed by
 * path. The share report diffs the edited file against it to count the customised lines.
 */
let keptSink: Map<string, string> | null = null;

/**
 * Records the render a generator kept off disk because the file there was edited. A no-op outside
 * capture mode.
 */
export function noteKeptRender(filePath: string, rendered: string): void {
  keptSink?.set(resolve(filePath), rendered);
}

/** The renders of edited files from the last {@link captureWrites} run. */
let lastKept = new Map<string, string>();
export function lastKeptRenders(): ReadonlyMap<string, string> {
  return lastKept;
}

/**
 * Runs `run` with every {@link writeFileWithDir} call recorded instead of written.
 *
 * @param run the generator invocation to observe
 * @returns each absolute path the run would have written, with its content
 */
export async function captureWrites(run: () => Promise<void>): Promise<Map<string, string>> {
  if (writeSink !== null) throw new Error("captureWrites does not nest");
  const sink = new Map<string, string>();
  const kept = new Map<string, string>();
  writeSink = sink;
  keptSink = kept;
  try {
    await run();
  } finally {
    writeSink = null;
    keptSink = null;
    lastKept = kept;
  }
  return sink;
}

export async function writeFileWithDir(
  filePath: string,
  content: string,
): Promise<void> {
  if (writeSink !== null) {
    writeSink.set(resolve(filePath), content);
    return;
  }
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
