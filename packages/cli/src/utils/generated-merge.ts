import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

import { findProjectRoot, noteKeptRender, pathExists, writeFileWithDir } from "./fs.js";
import { GENERATED_HASH_MARKER, isUntouchedRender, renderFingerprint } from "./project-templates.js";

const run = promisify(execFile);

/**
 * The committed folder that holds, per generated file, the exact render the CLI last wrote for it.
 *
 * <p>That render is the merge base the next regeneration reads an edited file against. It lives in
 * the project, beside the templates, so a fresh clone merges exactly as the machine that wrote it.
 */
export const GENERATED_BASE_DIR = ".simplix/generated";

/**
 * What writing one generated file came to.
 *
 * - `written`: absent or untouched, so the fresh render was written
 * - `merged`: edited, and the template change merged into the edits without a conflict
 * - `current`: edited, and the merge changes nothing (the edits already carry the template change)
 * - `conflict`: edited, and the template change collides with the edits; nothing was written
 *   unless conflict markers were asked for
 * - `no-base`: edited, and no stored base exists to merge against; the file was kept
 * - `removed`: absent while a base is stored, so somebody deleted it after it was laid down; a
 *   regeneration leaves it deleted (see {@link withRemovalsHonoured})
 */
export type GeneratedOutcome = "written" | "merged" | "current" | "conflict" | "no-base" | "removed";

/** One file's outcome, as collected for the report. */
export interface GeneratedWrite {
  readonly path: string;
  readonly outcome: GeneratedOutcome;
  /** For a conflict: each conflicting region, with markers, as `git merge-file` prints it. */
  readonly hunks?: readonly string[];
  /** Whether conflict markers were written into the file. */
  readonly markersWritten?: boolean;
}

let outcomes: GeneratedWrite[] = [];
let conflictMarkers = false;
let honourRemovals = false;

/**
 * Runs `body` with every deleted generated file left deleted: a file that is absent while its base
 * is stored was laid down once and removed since, so a regeneration must not bring it back. A
 * file with no stored base is new to the templates and is still written.
 */
export async function withRemovalsHonoured<T>(body: () => Promise<T>): Promise<T> {
  const before = honourRemovals;
  honourRemovals = true;
  try {
    return await body();
  } finally {
    honourRemovals = before;
  }
}

/** Runs `body` with conflicting merges written into the file with markers instead of left alone. */
export async function withConflictMarkers<T>(body: () => Promise<T>): Promise<T> {
  const before = conflictMarkers;
  conflictMarkers = true;
  try {
    return await body();
  } finally {
    conflictMarkers = before;
  }
}

/** Returns and clears the outcomes collected since the last call. */
export function takeGeneratedOutcomes(): GeneratedWrite[] {
  const taken = outcomes;
  outcomes = [];
  return taken;
}

/**
 * Where the stored base of a generated file lives. A file outside the project root (a story
 * directory beside it) keeps its `..` segments spelled as `__up__` so the base stays inside the folder.
 */
export async function basePathFor(filePath: string): Promise<string> {
  const root = await findProjectRoot(process.cwd());
  const rel = relative(root, resolve(filePath));
  const safe = rel
    .split(sep)
    .map((part) => (part === ".." ? "__up__" : part))
    .join("/");
  return join(root, GENERATED_BASE_DIR, safe);
}

/** The stored base of a generated file, or undefined when none was ever recorded. */
export async function readBase(filePath: string): Promise<string | undefined> {
  const at = await basePathFor(filePath);
  return (await pathExists(at)) ? readFile(at, "utf-8") : undefined;
}

/** Stores `render` as the merge base the file's later regenerations read its edits against. */
export async function recordBase(filePath: string, render: string): Promise<void> {
  await writeFileWithDir(await basePathFor(filePath), render);
}

/** The fingerprint an edited file still carries from the render it was laid down as. */
function recordedFingerprint(held: string): string | undefined {
  const line = held.split("\n").find((one) => one.includes(GENERATED_HASH_MARKER));
  return line === undefined ? undefined : new RegExp(`${GENERATED_HASH_MARKER}\\s+([0-9a-f]{12})`).exec(line)?.[1];
}

/** A three-way merge of `ours` and `theirs` against `base`, through `git merge-file`. */
export async function mergeThreeWay(base: string, ours: string, theirs: string): Promise<{ text: string; hunks: string[] }> {
  const dir = await mkdtemp(join(tmpdir(), "simplix-merge-"));
  try {
    const [o, b, t] = ["edited", "base", "template"].map((name) => join(dir, name));
    await Promise.all([writeFile(o, ours), writeFile(b, base), writeFile(t, theirs)]);
    let text: string;
    try {
      ({ stdout: text } = await run("git", ["merge-file", "-p", "-L", "edited", "-L", "base", "-L", "template", o, b, t], { maxBuffer: 64 * 1024 * 1024 }));
    } catch (err) {
      // A positive exit status is the number of conflicts, and stdout still holds the merge.
      const failed = err as { code?: unknown; stdout?: string };
      if (typeof failed.code !== "number" || failed.code < 0 || failed.stdout === undefined) throw err;
      text = failed.stdout;
    }
    const hunks = [...text.matchAll(/^<<<<<<< edited\n[\s\S]*?^>>>>>>> template\n?/gm)].map((m) => m[0]);
    return { text, hunks };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Writes one stamped generated file under the rule every generated file follows: laid down when
 * absent, rewritten while untouched, merged three-way into the edits once somebody has edited it.
 *
 * <p>Every render written is kept as the file's base under {@link GENERATED_BASE_DIR}. An edited
 * file with no stored base gets one when its recorded fingerprint is the fingerprint of the
 * current render: that render is then the one the file was laid down as.
 *
 * @param filePath where the file goes
 * @param stamped the fresh render, already stamped with its fingerprint
 * @returns the outcome and what the file holds after this call
 */
export async function writeStampedGenerated(filePath: string, stamped: string): Promise<{ outcome: GeneratedOutcome; held: string }> {
  const note = (entry: Omit<GeneratedWrite, "path">) => outcomes.push({ path: resolve(filePath), ...entry });
  if (!(await pathExists(filePath))) {
    if (honourRemovals && (await readBase(filePath)) !== undefined) {
      note({ outcome: "removed" });
      return { outcome: "removed", held: "" };
    }
    await writeFileWithDir(filePath, stamped);
    await recordBase(filePath, stamped);
    note({ outcome: "written" });
    return { outcome: "written", held: stamped };
  }
  const ours = await readFile(filePath, "utf-8");
  if (isUntouchedRender(ours)) {
    await writeFileWithDir(filePath, stamped);
    await recordBase(filePath, stamped);
    note({ outcome: "written" });
    return { outcome: "written", held: stamped };
  }
  noteKeptRender(filePath, stamped);
  let base = await readBase(filePath);
  if (base === undefined && recordedFingerprint(ours) === renderFingerprint(stamped)) base = stamped;
  if (base === undefined) {
    note({ outcome: "no-base" });
    return { outcome: "no-base", held: ours };
  }
  const { text, hunks } = await mergeThreeWay(base, ours, stamped);
  if (hunks.length > 0) {
    if (conflictMarkers) {
      await writeFileWithDir(filePath, text);
      await recordBase(filePath, stamped);
    }
    note({ outcome: "conflict", hunks, markersWritten: conflictMarkers });
    return { outcome: "conflict", held: conflictMarkers ? text : ours };
  }
  await recordBase(filePath, stamped);
  if (text === ours) {
    note({ outcome: "current" });
    return { outcome: "current", held: ours };
  }
  await writeFileWithDir(filePath, text);
  note({ outcome: "merged" });
  return { outcome: "merged", held: text };
}
