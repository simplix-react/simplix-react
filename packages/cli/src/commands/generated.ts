import { Command } from "commander";
import { readFile, readdir, realpath, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import { loadConfig } from "../config/config-loader.js";
import { assertOutputDirs } from "../config/output-dirs.js";
import { reportConfigError } from "../config/report-config-error.js";
import { captureWrites, findProjectRoot, lastKeptRenders } from "../utils/fs.js";
import { log, withSilentLog } from "../utils/logger.js";
import { runAfterGenerate } from "../utils/generated-after.js";
import { takeGeneratedOutcomes, withConflictMarkers, withRemovalsHonoured, type GeneratedWrite } from "../utils/generated-merge.js";
import { GENERATED_PAGE_MARKER, isUntouchedRender, renderOrigin } from "../utils/project-templates.js";

/**
 * Where a generated file stands against the generator.
 *
 * - `untouched`: still exactly what the generator laid down, and what it would lay down now
 * - `edited`: changed since it was laid down (customised); a regeneration merges the template
 *   change into it three-way, and {@link GeneratedEntry.merge} says what that merge comes to
 * - `stale`: untouched, but the current templates render something else; a re-run would change it
 * - `unchecked`: untouched, but stamped without the command that made it, so it cannot be re-rendered
 */
export type GeneratedState = "untouched" | "edited" | "stale" | "unchecked";

/** One generated file and its state. */
export interface GeneratedEntry {
  /** Path relative to the project root. */
  readonly path: string;
  readonly state: GeneratedState;
  /** The command that laid it down, when recorded. */
  readonly origin?: string;
  /** For an edited file: what the generator renders for it now, the base its edits are read against. */
  readonly render?: string;
  /**
   * For an edited file: what a regeneration does to it. `merged` carries a template change in,
   * `current` changes nothing, `conflict` collides with the edits, `no-base` has no stored render
   * to merge against, `no-origin` records no command to render it from, so nothing can be merged.
   * `simplix generated --adopt` resolves the last two.
   */
  readonly merge?: "merged" | "current" | "conflict" | "no-base" | "no-origin";
  /** For a conflict: the conflicting regions, with markers. */
  readonly hunks?: readonly string[];
}

/** Directories never searched for generated files; `.simplix` holds the stored bases, which carry the marker too. */
const SKIP_DIRS = new Set([".simplix", "node_modules", "dist", ".git", ".turbo", "coverage", "storybook-static"]);
const SOURCE_FILE = /\.(tsx?|mdx)$/;

async function walk(dir: string, out: string[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
    throw err;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(join(dir, entry.name), out);
    } else if (entry.isFile() && SOURCE_FILE.test(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
}

/** What one origin renders now: the files it would write, and the renders it keeps off edited ones. */
export interface OriginRender {
  readonly written: ReadonlyMap<string, string>;
  readonly kept: ReadonlyMap<string, string>;
  /** What each generated file's write came to, by absolute path. */
  readonly outcomes: ReadonlyMap<string, GeneratedWrite>;
}

export async function renderOriginNow(origin: readonly string[]): Promise<OriginRender> {
  takeGeneratedOutcomes();
  const written = await captureOrigin(origin);
  const outcomes = new Map(takeGeneratedOutcomes().map((one) => [one.path, one]));
  return { written, kept: new Map(lastKeptRenders()), outcomes };
}

/** Runs the command an origin names with every write captured, returning what it would write. */
async function captureOrigin(origin: readonly string[]): Promise<Map<string, string>> {
  const [command, ...args] = origin;
  if (command === "scaffold") {
    const { runScaffold } = await import("./scaffold-crud.js");
    const entity = args[0];
    const flag = (name: string) => {
      const at = args.indexOf(name);
      return at >= 0 ? args[at + 1] : undefined;
    };
    return withSilentLog(() => captureWrites(() => runScaffold(entity, { module: flag("--module"), output: flag("--output"), quiet: true })));
  }
  if (command === "add-page") {
    const { addPageArgs, runAddPage } = await import("./add-page.js");
    const { kind, name, flags } = addPageArgs(args);
    return withSilentLog(() => captureWrites(() => runAddPage(kind, name, flags)));
  }
  throw new Error(`Unknown origin "${origin.join(" ")}"`);
}

/** The generated files of a project, found by their marker: the project root and the story directory. */
export interface GeneratedFiles {
  /** The project root with symbolic links resolved, the spelling the generators' paths use. */
  readonly rootDir: string;
  readonly config: Awaited<ReturnType<typeof loadConfig>>;
  /** Absolute path to content, for every file under the searched roots carrying the generated marker. */
  readonly held: ReadonlyMap<string, string>;
}

/**
 * Reads every generated file under the project root and the configured story directory.
 *
 * @throws {ConfigLoadError} when `simplix.config.ts` exists but cannot be loaded
 * @throws {OutputDirError} when the configured story directory is not an existing directory
 */
export async function collectGenerated(projectRoot: string): Promise<GeneratedFiles> {
  // The generators resolve the root from the working directory, which the OS reports through
  // symbolic links resolved; walking the same spelling is what lets their paths match.
  const rootDir = await realpath(projectRoot);
  const config = await loadConfig(rootDir);
  // A directory that is not there holds no generated files, which reads as a clean report.
  await assertOutputDirs(rootDir, config);
  const roots = [rootDir, ...(config.templates?.storiesDir ? [resolve(rootDir, config.templates.storiesDir)] : [])];
  const files: string[] = [];
  for (const root of roots) await walk(root, files);

  const held = new Map<string, string>();
  for (const file of new Set(files)) {
    const text = await readFile(file, "utf-8");
    if (text.includes(GENERATED_PAGE_MARKER)) held.set(file, text);
  }
  return { rootDir, config, held };
}

/**
 * Lists every generated file under the project root (and the configured story directory) with
 * its state against the current templates.
 *
 * @param rootDir the project root, which must also be the working directory
 */
export async function generatedReport(
  projectRoot: string,
  withRenders = false,
  /** Filled, when given, with what every origin renders for the files it kept: edited files and blocks. */
  keptRenders?: Map<string, string>,
): Promise<GeneratedEntry[]> {
  const { rootDir, held } = await collectGenerated(projectRoot);

  const renders = new Map<string, OriginRender>();
  const entries: GeneratedEntry[] = [];
  for (const [file, text] of [...held].sort(([a], [b]) => a.localeCompare(b))) {
    const path = relative(rootDir, file);
    const origin = renderOrigin(text);
    const originText = origin?.join(" ");
    const renderOf = async (): Promise<OriginRender | undefined> => {
      if (!origin || !originText) return undefined;
      let render = renders.get(originText);
      if (!render) {
        render = await renderOriginNow(origin);
        renders.set(originText, render);
        for (const [path, text] of render.kept) keptRenders?.set(path, text);
      }
      return render;
    };
    if (!isUntouchedRender(text)) {
      const render = await renderOf();
      const base = withRenders ? render?.kept.get(resolve(file)) : undefined;
      const write = render?.outcomes.get(resolve(file));
      const merge = origin === undefined ? "no-origin" : write && write.outcome !== "written" && write.outcome !== "removed" ? write.outcome : undefined;
      entries.push({
        path,
        state: "edited",
        origin: originText,
        ...(base !== undefined ? { render: base } : {}),
        ...(merge !== undefined ? { merge } : {}),
        ...(write?.hunks ? { hunks: write.hunks } : {}),
      });
      continue;
    }
    const render = await renderOf();
    if (!render) {
      entries.push({ path, state: "unchecked" });
      continue;
    }
    const now = render.written.get(resolve(file));
    entries.push({ path, state: now === text ? "untouched" : "stale", origin: originText });
  }
  return entries;
}

/**
 * Regenerates every recorded origin for real: each untouched file is rewritten, and the template
 * change is merged three-way into each edited one. A conflicting merge is left unwritten unless
 * `writeConflicts` asks for conflict markers. A generated file somebody deleted stays deleted.
 *
 * @returns the origins run and what each generated file's write came to
 */
export async function regenerateAll(rootDir: string, writeConflicts = false): Promise<{ origins: string[]; writes: GeneratedWrite[] }> {
  if (writeConflicts) return withConflictMarkers(() => regenerateAll(rootDir, false));
  return withRemovalsHonoured(() => regenerateOrigins(rootDir));
}

async function regenerateOrigins(rootDir: string): Promise<{ origins: string[]; writes: GeneratedWrite[] }> {
  const entries = await generatedReport(rootDir);
  takeGeneratedOutcomes();
  const origins = [...new Set(entries.map((e) => e.origin).filter((o): o is string => o !== undefined))];
  for (const origin of origins) {
    const [command, ...args] = origin.split(/\s+/);
    log.info(`simplix ${origin}`);
    if (command === "scaffold") {
      const { runScaffold } = await import("./scaffold-crud.js");
      const at = (name: string) => (args.indexOf(name) >= 0 ? args[args.indexOf(name) + 1] : undefined);
      await runScaffold(args[0], { module: at("--module"), output: at("--output") });
    } else if (command === "add-page") {
      const { addPageArgs, runAddPage } = await import("./add-page.js");
      const { kind, name, flags } = addPageArgs(args);
      await runAddPage(kind, name, flags);
    }
  }
  return { origins, writes: takeGeneratedOutcomes() };
}

/**
 * Why a report fails, one sentence each; empty when it passes.
 *
 * <p>Only a screen that did not start from a template fails: a page file with no generated marker.
 * A stale file and a conflicting or unrecorded merge are the normal state of a page customised by
 * hand after a later template change, so they are reported and fail only under `check`, which also
 * fails an edited file a clean merge would still move.
 */
export function generatedFailures(entries: readonly GeneratedEntry[], options: { check: boolean; conflicted: boolean; unstarted?: readonly string[] }): string[] {
  const failures: string[] = [];
  if ((options.unstarted ?? []).length > 0) {
    failures.push(`Pages that did not start from a template (no ${GENERATED_PAGE_MARKER} marker): ${options.unstarted?.join(", ")}. Lay each down with \`simplix scaffold\` or \`simplix add-page\` and reapply its customisation.`);
  }
  if (!options.check) return failures;
  if (entries.some((e) => e.state === "stale")) {
    failures.push("Stale generated files: run `simplix generated --all` to rewrite them from the current templates.");
  }
  if (options.conflicted || entries.some((e) => e.merge === "conflict")) {
    failures.push("Edited generated files conflict with the templates: resolve each conflict (or run `simplix generated --all --write-conflicts`).");
  }
  if (entries.some((e) => e.merge === "no-base" || e.merge === "no-origin")) {
    failures.push("Edited generated files have no base or no origin: record each with `simplix generated --adopt <path...>`.");
  }
  if (entries.some((e) => e.merge === "merged")) {
    failures.push("Edited generated files are behind the templates: run `simplix generated --all`.");
  }
  return failures;
}

/** The file names the generators lay a page down as, under `src/pages/<page>/`. */
const PAGE_FILES = new Set(["page.tsx", "crud-page.tsx", "list-page.tsx"]);

/**
 * Page files under the project's `modules/` and `apps/` that carry no generated marker, as paths
 * relative to the root: a screen built by hand rather than started from its type's template.
 */
export async function unstartedPages(rootDir: string): Promise<string[]> {
  const found: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    let names: string[];
    try {
      names = await readdir(dir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
      throw err;
    }
    for (const name of names) {
      if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
      const path = join(dir, name);
      if ((await stat(path)).isDirectory()) await walk(path);
      else if ((PAGE_FILES.has(name) && /[\\/]src[\\/]pages[\\/][^\\/]+[\\/][^\\/]+$/.test(path)) || /[\\/]src[\\/]app[\\/]layouts[\\/]root-layout\.tsx$/.test(path)) {
        if (!(await readFile(path, "utf-8")).includes(GENERATED_PAGE_MARKER)) found.push(relative(rootDir, path));
      }
    }
  };
  await walk(join(rootDir, "modules"));
  await walk(join(rootDir, "apps"));
  return found.sort();
}

export const generatedCommand = new Command("generated")
  .description(
    "Report every generated file as untouched, edited or stale against the current templates, and what a regeneration merges into each edited one",
  )
  .option("--all", "Regenerate every scaffolded screen and page first: untouched files are rewritten, edited ones merged three-way, and a deleted one stays deleted while its base under .simplix/generated is kept")
  .option("--write-conflicts", "With --all, write conflict markers into a file whose merge conflicts instead of leaving it alone")
  .option("--check", "Also exit non-zero on a stale file, a conflict, a file with no base or origin, and an edited file a clean merge would still move (without it only a page that did not start from a template fails)")
  .option("--json", "Print the report as JSON")
  .option("--share", "Report, per screen, the lines in blocks and edited files against the generated lines, and the customisations two screens repeat")
  .option(
    "--adopt <path...>",
    "Record the current render of an edited file as its merge base, after printing the diff between the two, so every difference is read as a customisation; a file with no origin gets one when it can be inferred",
  )
  .option("-y, --yes", "With --adopt, record without asking once the diffs are printed (a run with no terminal needs it)")
  .action(reportConfigError(async (flags: { all?: boolean; writeConflicts?: boolean; check?: boolean; json?: boolean; share?: boolean; adopt?: string[]; yes?: boolean }) => {
    const callerDir = process.cwd();
    const rootDir = await findProjectRoot(process.cwd());
    if (resolve(process.cwd()) !== rootDir) process.chdir(rootDir);
    if (flags.adopt !== undefined) {
      if (flags.all || flags.check || flags.share || flags.writeConflicts) {
        log.error("--adopt stands alone: run it without --all, --check, --share or --write-conflicts.");
        process.exitCode = 1;
        return;
      }
      const { runAdopt } = await import("./generated-adopt.js");
      process.exitCode = await runAdopt(rootDir, flags.adopt.map((one) => resolve(callerDir, one)), { yes: flags.yes === true });
      return;
    }
    if (flags.yes) {
      log.error("--yes applies to --adopt.");
      process.exitCode = 1;
      return;
    }
    if (flags.writeConflicts && !flags.all) {
      log.error("--write-conflicts applies to a regeneration: pass it with --all.");
      process.exitCode = 1;
      return;
    }
    let conflicted = false;
    if (flags.all) {
      const { origins, writes } = await regenerateAll(rootDir, flags.writeConflicts === true);
      for (const w of writes) {
        if (w.outcome === "written") continue;
        log.step(`${w.outcome.padEnd(9)} ${relative(rootDir, w.path)}${w.markersWritten ? "  (conflict markers written)" : ""}`);
        for (const hunk of w.hunks ?? []) process.stdout.write(hunk);
        if (w.outcome === "conflict" && !w.markersWritten) conflicted = true;
      }
      // Once per regeneration, however many origins it ran, and only when one ran.
      if (origins.length > 0) await runAfterGenerate(rootDir);
    }
    const kept = new Map<string, string>();
    const entries = await generatedReport(rootDir, flags.share === true, kept);
    if (flags.share) {
      const { shareReport } = await import("./generated-share.js");
      const report = await shareReport(await realpath(rootDir), entries, kept);
      if (flags.json) {
        process.stdout.write(JSON.stringify(report, null, 2) + "\n");
      } else {
        for (const s of report.screens) {
          log.step(
            `${s.screen.padEnd(28)} generated ${String(s.generated).padStart(5)}  customised ${String(s.customised).padStart(5)}  ` +
              `blocks ${String(s.blocks).padStart(5)}  own ${(s.share * 100).toFixed(0)}%`,
          );
        }
        for (const r of report.recurring) log.warn(`on ${r.screens.join(", ")}: ${r.line}`);
        log.info(`share: ${report.screens.length} screens, ${report.recurring.length} customisations repeated on a second screen`);
      }
      return;
    }
    if (flags.json) {
      process.stdout.write(JSON.stringify(entries, null, 2) + "\n");
    } else {
      for (const e of entries) {
        const merge =
          e.merge === "no-base" ? ", no base" : e.merge === "no-origin" ? ", no origin" : e.merge ? ` (${e.merge === "current" ? "merge is a no-op" : e.merge === "merged" ? "merges cleanly" : "conflict"})` : "";
        log.step(`${(e.state + merge).padEnd(9)} ${e.path}${e.origin ? `  (${e.origin})` : ""}`);
        for (const hunk of e.hunks ?? []) process.stdout.write(hunk);
      }
      const count = (s: GeneratedState) => entries.filter((e) => e.state === s).length;
      const merges = (m: GeneratedEntry["merge"]) => entries.filter((e) => e.merge === m).length;
      log.info(
        `generated: ${entries.length} files, ${count("untouched")} untouched, ${count("edited")} edited ` +
          `(${merges("merged")} would merge, ${merges("current")} current, ${merges("conflict")} conflict, ${merges("no-base")} no base, ${merges("no-origin")} no origin), ` +
          `${count("stale")} stale, ${count("unchecked")} unchecked`,
      );
    }
    const unstarted = await unstartedPages(rootDir);
    for (const failure of generatedFailures(entries, { check: flags.check === true, conflicted, unstarted })) {
      log.error(failure);
      process.exitCode = 1;
    }
  }));
