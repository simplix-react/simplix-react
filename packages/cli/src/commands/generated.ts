import { Command } from "commander";
import { readFile, readdir, realpath, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

import { designProblems } from "../checks/design-source.js";
import { readSpecifiers, relativeCandidates, unresolvedRelativeImports } from "../checks/import-cycles.js";
import { loadConfig } from "../config/config-loader.js";
import { assertOutputDirs } from "../config/output-dirs.js";
import { reportConfigError } from "../config/report-config-error.js";
import { storyTargets } from "../utils/app-config.js";
import { captureWrites, requireProjectRoot, lastKeptRenders, pathExists, writeFileWithDir } from "../utils/fs.js";
import { log, withSilentLog } from "../utils/logger.js";
import { runAfterGenerate } from "../utils/generated-after.js";
import { basePathFor, takeGeneratedOutcomes, withConflictMarkers, withRemovalsHonoured, type GeneratedWrite } from "../utils/generated-merge.js";
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
    const { runScaffold, scaffoldOptionsFromOrigin } = await import("./scaffold-crud.js");
    const entity = args[0];
    return withSilentLog(() => captureWrites(() => runScaffold(entity, { ...scaffoldOptionsFromOrigin(args), quiet: true })));
  }
  if (command === "add-page") {
    const { addPageArgs, runAddPage } = await import("./add-page.js");
    const { kind, name, flags } = addPageArgs(args);
    return withSilentLog(() => captureWrites(() => runAddPage(kind, name, flags)));
  }
  throw new Error(`Unknown origin "${origin.join(" ")}"`);
}

/** The generated files of a project, found by their marker: the project root and the story directories. */
export interface GeneratedFiles {
  /** The project root with symbolic links resolved, the spelling the generators' paths use. */
  readonly rootDir: string;
  readonly config: Awaited<ReturnType<typeof loadConfig>>;
  /** Absolute path to content, for every file under the searched roots carrying the generated marker. */
  readonly held: ReadonlyMap<string, string>;
}

/**
 * Reads every generated file under the project root and every configured story directory (the
 * top-level one and each app's).
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
  const roots = [rootDir, ...storyTargets(config).map((one) => resolve(rootDir, one.storiesDir))];
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
      const { runScaffold, scaffoldOptionsFromOrigin } = await import("./scaffold-crud.js");
      await runScaffold(args[0], scaffoldOptionsFromOrigin(args));
    } else if (command === "add-page") {
      const { addPageArgs, runAddPage } = await import("./add-page.js");
      const { kind, name, flags } = addPageArgs(args);
      await runAddPage(kind, name, flags);
    }
  }
  return { origins, writes: takeGeneratedOutcomes() };
}

/**
 * Regenerates only the named generated files: each one's origin is rendered with every write
 * captured, and only the named file and its stored base are written from that render. The origin's
 * other files - the siblings of a screen, its story - stay as they are, and keep whatever state
 * the report gives them.
 *
 * <p>The render is the one {@link regenerateAll} would write: an untouched file is rewritten, an
 * edited one merged three-way, a conflicting merge left alone unless `writeConflicts` asks for
 * markers.
 *
 * @param rootDir the project root, which must also be the working directory
 * @param files absolute paths of generated files
 * @param writeConflicts write conflict markers into a named file whose merge conflicts
 * @returns the origins rendered, what each named file's write came to, and the named files that
 *   record no origin and so could not be rendered
 */
export async function regenerateNamed(
  rootDir: string,
  files: readonly string[],
  writeConflicts = false,
): Promise<{ origins: string[]; writes: GeneratedWrite[]; unrecorded: string[] }> {
  const { held } = await collectGenerated(rootDir);
  const byOrigin = new Map<string, string[]>();
  const unrecorded: string[] = [];
  for (const file of files) {
    const text = held.get(file) ?? (await readFile(file, "utf-8"));
    const origin = renderOrigin(text)?.join(" ");
    if (origin === undefined) {
      unrecorded.push(file);
      continue;
    }
    byOrigin.set(origin, [...(byOrigin.get(origin) ?? []), file]);
  }

  const writes: GeneratedWrite[] = [];
  for (const [origin, named] of byOrigin) {
    log.info(`simplix ${origin}  (${named.length} file(s))`);
    const capture = () => renderOriginNow(origin.split(/\s+/));
    const render = await withRemovalsHonoured(() => (writeConflicts ? withConflictMarkers(capture) : capture()));
    // A named file may import a package its module does not declare yet (a holder's domain); the
    // render adds it to that module's manifest, which is written with the file so the file compiles.
    for (const [manifest, content] of await manifestsOf(rootDir, named, render.written)) {
      const current = (await pathExists(manifest)) ? await readFile(manifest, "utf-8") : undefined;
      if (current === content) continue;
      await writeFileWithDir(manifest, content);
      log.info(`  → updated   ${relative(rootDir, manifest)} (dependencies the regenerated files import)`);
    }
    const laid = new Set<string>();
    for (const file of [...named, ...(await newCompanionsOf(named, render.written))]) {
      if (laid.has(file)) continue;
      laid.add(file);
      const content = render.written.get(file);
      if (content !== undefined) await writeFileWithDir(file, content);
      const basePath = await basePathFor(file);
      const base = render.written.get(resolve(basePath));
      if (base !== undefined) await writeFileWithDir(basePath, base);
      const outcome = render.outcomes.get(file);
      if (outcome !== undefined) writes.push(outcome);
    }
  }
  return { origins: [...byOrigin.keys()], writes, unrecorded };
}

/**
 * Reports each relative import of a file the regeneration reached that names no file on disk,
 * which would leave the app blank at its first load.
 *
 * @returns whether any was found
 */
export function reportUnresolvedImports(rootDir: string, writes: readonly GeneratedWrite[]): boolean {
  const files = writes.filter((w) => w.outcome !== "removed").map((w) => w.path);
  const unresolved = unresolvedRelativeImports(files);
  for (const one of unresolved) {
    log.error(`${relative(rootDir, one.file)} imports "${one.specifier}", which the regeneration did not lay down and no file provides`);
  }
  return unresolved.length > 0;
}

/**
 * The files a render lays down for the first time that a named file's new render imports by a
 * relative path (a page's `./page.blocks`): regenerating the page alone would leave it importing
 * a file that does not exist. A file already on disk is never among them, so nothing a screen
 * keeps is overwritten; one the author deleted after it was generated is not in the render.
 *
 * @param named absolute paths of the files being regenerated
 * @param written what the render would write, by absolute path
 * @returns absolute paths of the companions to lay down
 */
export async function newCompanionsOf(named: readonly string[], written: ReadonlyMap<string, string>): Promise<string[]> {
  const found: string[] = [];
  for (const file of named) {
    const content = written.get(file);
    if (content === undefined) continue;
    for (const { specifier } of readSpecifiers(file, content, true)) {
      if (!/^\.\.?\//.test(specifier)) continue;
      const target = relativeCandidates(file, specifier).find((one) => written.has(one));
      if (target !== undefined && !(await pathExists(target)) && !found.includes(target)) found.push(target);
    }
  }
  return found;
}

/**
 * The package manifest nearest above each file whose render the capture rewrote, with the content the
 * render gave it. The walk stops at the first manifest on disk or in the capture, and never leaves the
 * project root, so a file's own module is the only manifest it reaches.
 *
 * @param rootDir the project root
 * @param files absolute paths of the regenerated files
 * @param written what the render would write, by absolute path
 */
export async function manifestsOf(rootDir: string, files: readonly string[], written: ReadonlyMap<string, string>): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  // The generated files are named with links resolved, so the root is too.
  const root = await realpath(resolve(rootDir));
  for (const file of files) {
    for (let dir = dirname(resolve(file)); dir.startsWith(root); dir = dirname(dir)) {
      const manifest = join(dir, "package.json");
      const content = written.get(manifest);
      if (content !== undefined) {
        out.set(manifest, content);
        break;
      }
      if (dir === root || (await pathExists(manifest))) break;
    }
  }
  return out;
}

/**
 * The generated files at or under the typed paths, by absolute path.
 *
 * @returns the files, and the typed paths no generated file lies at or under
 */
export async function generatedFilesNamedBy(
  rootDir: string,
  callerDir: string,
  named: readonly string[],
): Promise<{ files: string[]; unmatched: string[] }> {
  const { rootDir: realRoot, held } = await collectGenerated(rootDir);
  const wanted = named.map((typed) => ({ typed, path: resolve(realRoot, relative(rootDir, resolve(callerDir, typed))) }));
  const under = (file: string, path: string) => file === path || file.startsWith(path + sep);
  const files = [...held.keys()].filter((file) => wanted.some((one) => under(file, one.path))).sort();
  const unmatched = wanted.filter((one) => !files.some((file) => under(file, one.path))).map((one) => one.typed);
  return { files, unmatched };
}

/**
 * Why a report fails, one sentence each; empty when it passes.
 *
 * <p>Only a screen that did not start from a template fails, and a routed screen with no entry or
 * row in its app's design source (`design`, the design gate's findings).
 * A stale file and a conflicting or unrecorded merge are the normal state of a page customised by
 * hand after a later template change, so they are reported and fail only under `check`, which also
 * fails an edited file a clean merge would still move.
 */
export function generatedFailures(entries: readonly GeneratedEntry[], options: { check: boolean; conflicted: boolean; unstarted?: readonly string[]; design?: readonly string[] }): string[] {
  const failures: string[] = [...(options.design ?? [])];
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

/**
 * The entries a path list names: a file by its path, a directory by every generated file under it.
 *
 * @param entries the whole report
 * @param rootDir the project root the entries' paths are relative to
 * @param callerDir the directory the paths were typed in
 * @param named the paths as typed
 * @returns the entries kept, and the paths that matched none
 */
export function entriesNamedBy(
  entries: readonly GeneratedEntry[],
  rootDir: string,
  callerDir: string,
  named: readonly string[],
): { kept: GeneratedEntry[]; unmatched: string[] } {
  const wanted = named.map((one) => ({ typed: one, path: relative(rootDir, resolve(callerDir, one)).split(sep).join("/") }));
  const matches = (entryPath: string, path: string) => entryPath === path || entryPath.startsWith(`${path}/`);
  const kept = entries.filter((e) => wanted.some((one) => matches(e.path, one.path)));
  const unmatched = wanted.filter((one) => !entries.some((e) => matches(e.path, one.path))).map((one) => one.typed);
  return { kept, unmatched };
}

export const generatedCommand = new Command("generated")
  .description(
    "Report every generated file as untouched, edited or stale against the current templates, and what a regeneration merges into each edited one",
  )
  .argument("[paths...]", "Report only the generated files at these paths, or under these directories; with --all, regenerate only them")
  .option("--all", "Regenerate every scaffolded screen and page first (only the files at the given paths, when paths are given): untouched files are rewritten, edited ones merged three-way, and a deleted one stays deleted while its base under .simplix/generated is kept")
  .option("--write-conflicts", "With --all, write conflict markers into a file whose merge conflicts instead of leaving it alone")
  .option("--check", "Also exit non-zero on a stale file, a conflict, a file with no base or origin, and an edited file a clean merge would still move (without it only a page that did not start from a template fails)")
  .option("--json", "Print the report as JSON")
  .option("--share", "Report, per screen, the lines in blocks and edited files against the generated lines, and the customisations two screens repeat")
  .option(
    "--adopt <path...>",
    "Record the current render of an edited file as its merge base, after printing the diff between the two, so every difference is read as a customisation; a file with no origin gets one when it can be inferred",
  )
  .option("-y, --yes", "With --adopt, record without asking once the diffs are printed (a run with no terminal needs it)")
  .option(
    "--origin <command>",
    "Record <command> (the arguments after `simplix`, e.g. `scaffold user --module admin --list-presentation cards`) as the origin of the generated files at the given paths: only their stamp line changes, so a regeneration renders them from it and merges into their edits. The command must render each file",
  )
  .option("--rebase", "With --adopt, also take a file that already has a base: its content is kept as the intended one against the current templates, and a template change that conflicts with it is declined")
  .action(reportConfigError(async (paths: string[], flags: { all?: boolean; writeConflicts?: boolean; check?: boolean; json?: boolean; share?: boolean; adopt?: string[]; yes?: boolean; rebase?: boolean; origin?: string }) => {
    const callerDir = process.cwd();
    const rootDir = await requireProjectRoot(process.cwd());
    if (resolve(process.cwd()) !== rootDir) process.chdir(rootDir);
    if (flags.adopt !== undefined) {
      if (flags.all || flags.check || flags.share || flags.writeConflicts) {
        log.error("--adopt stands alone: run it without --all, --check, --share or --write-conflicts.");
        process.exitCode = 1;
        return;
      }
      const { runAdopt } = await import("./generated-adopt.js");
      process.exitCode = await runAdopt(rootDir, flags.adopt.map((one) => resolve(callerDir, one)), { yes: flags.yes === true, rebase: flags.rebase === true });
      return;
    }
    if (flags.origin !== undefined) {
      if (flags.all || flags.check || flags.share || flags.writeConflicts || flags.rebase || flags.yes) {
        log.error("--origin stands alone: run it with paths and without --all, --check, --share, --write-conflicts, --rebase or --yes.");
        process.exitCode = 1;
        return;
      }
      if (paths.length === 0) {
        log.error("--origin takes the generated files, or the directories holding them, to record the origin in.");
        process.exitCode = 1;
        return;
      }
      const { applyOriginChange, planOriginChange } = await import("./generated-origin.js");
      const changes = await planOriginChange(rootDir, callerDir, paths, flags.origin);
      for (const change of changes) {
        if (change.refusal !== undefined) log.error(`refused ${change.path}: ${change.refusal}`);
        else log.step(`origin ${change.path}  (${change.from ?? "none"} -> ${change.to})`);
      }
      const refused = changes.filter((change) => change.refusal !== undefined).length;
      if (refused > 0) {
        log.error(`Nothing recorded: ${refused} file(s) refused. Name only the files this origin renders.`);
        process.exitCode = 1;
        return;
      }
      await applyOriginChange(changes);
      log.info(`recorded the origin in ${changes.length} file(s)`);
      return;
    }
    if (flags.rebase) {
      log.error("--rebase applies to --adopt.");
      process.exitCode = 1;
      return;
    }
    if (flags.yes) {
      log.error("--yes applies to --adopt.");
      process.exitCode = 1;
      return;
    }
    if (paths.length > 0 && flags.share) {
      log.error("Paths narrow the report and a regeneration: run them without --share.");
      process.exitCode = 1;
      return;
    }
    if (flags.writeConflicts && !flags.all) {
      log.error("--write-conflicts applies to a regeneration: pass it with --all.");
      process.exitCode = 1;
      return;
    }
    let conflicted = false;
    if (flags.all && paths.length > 0) {
      const named = await generatedFilesNamedBy(rootDir, callerDir, paths);
      if (named.unmatched.length > 0) {
        for (const one of named.unmatched) log.error(`no generated file at or under ${one}`);
        log.error("Nothing regenerated: name only generated files, or the directories holding them.");
        process.exitCode = 1;
        return;
      }
      const { origins, writes, unrecorded } = await regenerateNamed(rootDir, named.files, flags.writeConflicts === true);
      for (const file of unrecorded) {
        log.error(`not regenerated ${relative(rootDir, file)}: it records no origin; record one with \`simplix generated --origin "<command>" <path>\``);
        process.exitCode = 1;
      }
      for (const w of writes) {
        log.step(`${w.outcome.padEnd(9)} ${relative(rootDir, w.path)}${w.markersWritten ? "  (conflict markers written)" : ""}`);
        for (const hunk of w.hunks ?? []) process.stdout.write(hunk);
        if (w.outcome === "conflict" && !w.markersWritten) conflicted = true;
      }
      if (reportUnresolvedImports(rootDir, writes)) process.exitCode = 1;
      // The screens the named files belong to are judged against Meta, as --all judges every one.
      const entities = [...new Set(origins.map((one) => one.split(/\s+/)).filter(([command]) => command === "scaffold").map(([, entity]) => entity))];
      if (entities.length > 0) {
        const { runScreenCheck } = await import("./check-screen.js");
        await runScreenCheck(rootDir, entities);
      }
      if (origins.length > 0) await runAfterGenerate(rootDir);
    } else if (flags.all) {
      const { origins, writes } = await regenerateAll(rootDir, flags.writeConflicts === true);
      for (const w of writes) {
        if (w.outcome === "written") continue;
        log.step(`${w.outcome.padEnd(9)} ${relative(rootDir, w.path)}${w.markersWritten ? "  (conflict markers written)" : ""}`);
        for (const hunk of w.hunks ?? []) process.stdout.write(hunk);
        if (w.outcome === "conflict" && !w.markersWritten) conflicted = true;
      }
      if (reportUnresolvedImports(rootDir, writes)) process.exitCode = 1;
      // A template change reaches every screen it generated: they are judged against Meta once more.
      if (origins.length > 0) {
        const { runScreenCheck } = await import("./check-screen.js");
        await runScreenCheck(rootDir, []);
      }
      // Once per regeneration, however many origins it ran, and only when one ran.
      if (origins.length > 0) await runAfterGenerate(rootDir);
    }
    const kept = new Map<string, string>();
    const everything = await generatedReport(rootDir, flags.share === true, kept);
    let entries = everything;
    if (paths.length > 0) {
      const named = entriesNamedBy(everything, rootDir, callerDir, paths);
      for (const one of named.unmatched) {
        log.error(`no generated file at or under ${one}`);
        process.exitCode = 1;
      }
      entries = named.kept;
    }
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
    const allUnstarted = await unstartedPages(rootDir);
    const unstarted = paths.length > 0 ? allUnstarted.filter((one) => entriesNamedBy([{ path: one } as GeneratedEntry], rootDir, callerDir, paths).kept.length > 0) : allUnstarted;
    // The design gate judges the apps' routes, so a report narrowed to paths leaves it out.
    const design = paths.length > 0 ? [] : (await designProblems(rootDir, await loadConfig(rootDir))).problems;
    for (const failure of generatedFailures(entries, { check: flags.check === true, conflicted, unstarted, design })) {
      log.error(failure);
      process.exitCode = 1;
    }
  }));
