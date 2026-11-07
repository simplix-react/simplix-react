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

/** The file that marks a simplix-react project's root. */
export const PROJECT_MARKER = "simplix.config.ts";

/** No project root was named and none lies at or above the directory searched. */
export class ProjectRootError extends Error {
  constructor(readonly searched: string) {
    super(`No ${PROJECT_MARKER} in ${searched} or any directory above it: run simplix inside the project, or name its root with --root <dir>.`);
    this.name = "ProjectRootError";
  }
}

/**
 * The directory `--root` names on a command line (`--root <dir>` or `--root=<dir>`), wherever it
 * stands, or `undefined` when it names none. Read before the commands are parsed, so the plugins
 * the project declares load from the named root too.
 */
export function rootFlagOf(argv: readonly string[]): string | undefined {
  for (let at = 0; at < argv.length; at++) {
    const arg = argv[at] as string;
    if (arg === "--") return undefined;
    if (arg === "--root") return argv[at + 1];
    if (arg.startsWith("--root=")) return arg.slice("--root=".length);
  }
  return undefined;
}

let rootOverride: string | undefined;

/** Names the project root for the rest of the run (`simplix --root <dir>`), or clears it. */
export function setProjectRootOverride(dir: string | undefined): void {
  rootOverride = dir === undefined ? undefined : resolve(dir);
}

/** The nearest directory at or above `startDir` holding `marker`, or `undefined`. */
async function nearestHolding(startDir: string, marker: string): Promise<string | undefined> {
  let dir = resolve(startDir);
  while (true) {
    if (await pathExists(join(dir, marker))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

/**
 * The project root of a command that reads the project's config: the directory `--root` named,
 * else the nearest directory at or above `startDir` holding `simplix.config.ts`.
 *
 * @remarks
 * A `pnpm-workspace.yaml` is not taken as the root here: a sibling workspace that is not a
 * simplix-react project (a desktop app beside the web project) has one too, and a command run from
 * inside it would read that workspace as the project and fail on settings it never declared.
 *
 * @throws {@link ProjectRootError} when `--root` was not given and no directory holds the marker
 */
export async function requireProjectRoot(startDir: string): Promise<string> {
  if (rootOverride !== undefined) return rootOverride;
  const found = await nearestHolding(startDir, PROJECT_MARKER);
  if (found === undefined) throw new ProjectRootError(resolve(startDir));
  return found;
}

/**
 * The project root of a command that also works before a project has a config (adding a domain,
 * a module or an app to a workspace): the directory `--root` named, else the nearest directory
 * holding `simplix.config.ts` at any level above `startDir`, else the nearest holding
 * `pnpm-workspace.yaml`, else `startDir`.
 *
 * @remarks
 * The config wins at any distance: a workspace file nearer to `startDir` that belongs to another
 * workspace nested in the project is not the project.
 */
export async function findProjectRoot(startDir: string): Promise<string> {
  if (rootOverride !== undefined) return rootOverride;
  return (await nearestHolding(startDir, PROJECT_MARKER)) ?? (await nearestHolding(startDir, "pnpm-workspace.yaml")) ?? resolve(startDir);
}
