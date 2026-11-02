import { readFile, realpath } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";

import { writeFileWithDir } from "../utils/fs.js";
import { GENERATED_HASH_MARKER, renderOrigin } from "../utils/project-templates.js";
import { collectGenerated, renderOriginNow } from "./generated.js";

/** One generated file's origin change: ready to write, or the reason it was refused. */
export interface OriginChange {
  /** Path relative to the project root. */
  readonly path: string;
  readonly file: string;
  /** The origin the file records now; absent when it records none. */
  readonly from?: string;
  readonly to: string;
  /** Why the origin cannot be recorded in this file; absent when it can. */
  readonly refusal?: string;
  /** What the file holds once its stamp line names the new origin. */
  readonly rewritten?: string;
}

const STAMP = new RegExp(`(${GENERATED_HASH_MARKER}\\s+[0-9a-f]{12})(?:[ \\t]+.*)?$`);

/**
 * Works out, per generated file at the named paths, what recording a new origin would change,
 * without writing anything. The new origin must render the file: the command is run in capture
 * mode and the file has to be among the files it writes or keeps.
 *
 * <p>Only the stamp line changes. The fingerprint hashes everything but that line and the merge
 * base is left as it is, so the file stays as edited as it was and the next regeneration merges the
 * new origin's render into it three-way.
 *
 * @param projectRoot the project root, which must also be the working directory
 * @param callerDir the directory the paths were typed in
 * @param paths generated files, or directories holding them
 * @param origin the command arguments that lay the files down, e.g. `scaffold user --module admin --list-presentation cards`
 * @throws Error when no generated file lies at or under the paths, or the origin cannot be rendered
 */
export async function planOriginChange(projectRoot: string, callerDir: string, paths: readonly string[], origin: string): Promise<OriginChange[]> {
  const { rootDir, held } = await collectGenerated(projectRoot);
  const wanted = paths.map((one) => resolve(callerDir, one));
  const named = [...held.keys()].filter((file) => wanted.some((path) => file === path || file.startsWith(path + sep))).sort();
  if (named.length === 0) throw new Error(`no generated file at or under ${paths.join(", ")}`);
  const rendered = await renderOriginNow(origin.split(/\s+/));
  const rendersIt = (file: string) => rendered.written.has(file) || rendered.kept.has(file);
  const changes: OriginChange[] = [];
  for (const requested of named) {
    const file = (await realpath(requested).catch(() => requested)) as string;
    const path = relative(rootDir, file).split(sep).join("/");
    const text = held.get(requested) ?? (await readFile(file, "utf-8"));
    const from = renderOrigin(text)?.join(" ");
    const refuse = (refusal: string) => changes.push({ path, file, from, to: origin, refusal });
    if (!STAMP.test(text.split("\n").find((line) => line.includes(GENERATED_HASH_MARKER)) ?? "")) {
      refuse(`it carries no ${GENERATED_HASH_MARKER} stamp line to record an origin in`);
      continue;
    }
    if (!rendersIt(file)) {
      refuse(`"${origin}" does not render this file`);
      continue;
    }
    const rewritten = text
      .split("\n")
      .map((line) => (line.includes(GENERATED_HASH_MARKER) ? line.replace(STAMP, `$1 ${origin}`) : line))
      .join("\n");
    changes.push({ path, file, from, to: origin, rewritten });
  }
  return changes;
}

/** Writes each ready change's stamp line. */
export async function applyOriginChange(changes: readonly OriginChange[]): Promise<void> {
  for (const change of changes) {
    if (change.refusal !== undefined || change.rewritten === undefined) continue;
    if (change.rewritten !== (await readFile(change.file, "utf-8"))) await writeFileWithDir(change.file, change.rewritten);
  }
}
