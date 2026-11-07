import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { Command } from "commander";

import {
  figureKindProblems,
  flatKeyProblems,
  formProblems,
  listProblems,
  nameFieldProblems,
  type FigureFact,
  type ReferenceFact,
  type ScreenFacts,
  type ScreenProblem,
} from "../checks/screen-check.js";
import { designProblems } from "../checks/design-source.js";
import { loadConfig } from "../config/config-loader.js";
import { appFor, templatesFor } from "../utils/app-config.js";
import { reportConfigError } from "../config/report-config-error.js";
import type { MetaScaffoldSource } from "../meta/scaffold-source.js";
import { loadMetaHolders, loadMetaScaffoldSource } from "../meta/scaffold-source.js";
import { findProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { storyFileFor } from "../utils/story-file.js";

const SKIP_DIRS = new Set(["node_modules", "dist", ".turbo", "build", "coverage", ".git", ".simplix"]);

/** `emailLog`, `email-log` and `EmailLog` are one entity. */
export function camelEntity(name: string): string {
  const camel = name.replace(/[-_\s]+([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase());
  return camel.charAt(0).toLowerCase() + camel.slice(1);
}

/** `emailLog` → `email-log`. */
export function kebabEntity(name: string): string {
  return camelEntity(name).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Every `widgets/<kebab>` and `pages/<kebab>` directory under `modules/`, by kebab name. */
export function screenDirectories(rootDir: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const walk = (dir: string, depth: number): void => {
    if (depth > 7) return;
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name)) continue;
      const path = join(dir, name);
      if (!statSync(path).isDirectory()) continue;
      const parent = dir.split("/").pop();
      if (parent === "widgets" || parent === "pages") out.set(name, [...(out.get(name) ?? []), path]);
      else walk(path, depth + 1);
    }
  };
  const modules = join(rootDir, "modules");
  if (existsSync(modules)) walk(modules, 0);
  return out;
}

/**
 * The group of the module a screen directory sits in: `admin` for
 * `modules/admin/user/src/widgets/user`, undefined for an ungrouped `modules/user/src/widgets/user`.
 */
export function moduleGroupOf(rootDir: string, screenDir: string): string | undefined {
  const parts = relative(join(rootDir, "modules"), screenDir).split(/[\\/]/);
  const src = parts.indexOf("src");
  return src === 2 ? parts[0] : undefined;
}

/** What SimpliX Meta settles for an entity, in the terms the checks read. */
export function factsOf(source: MetaScaffoldSource, holders: readonly MetaScaffoldSource[] = []): ScreenFacts {
  // A detail also draws the rows of every entity that holds this one, as sub-lists.
  const records = [
    ...(source.rowFields ?? []),
    ...(source.detailFields ?? []),
    ...source.fields,
    ...holders.flatMap((one) => [...(one.rowFields ?? []), ...(one.detailFields ?? []), ...one.fields]),
  ];
  const references = new Map<string, ReferenceFact>();
  for (const one of records) {
    if (one.referenceNamePath === undefined || one.fkEntityField === null || references.has(one.name)) continue;
    references.set(one.name, {
      key: one.name,
      // A path a reference states runs through the record it nests, whatever the key's stem.
      nested: one.referenceNamePath.split(".")[0] ?? one.fkEntityField,
      path: one.referenceNamePath,
      source: one.referenceNameSource ?? "declared",
    });
  }
  // A field's figure kind as Meta's format settles it, read from the entity's own records only: a
  // holder's sub-list draws the holder's fields, which are judged where the holder's screen is.
  const figureOf = (one: MetaScaffoldSource["fields"][number]): FigureFact | undefined => {
    const kind = one.figureKind ?? (one.money ? "money" : undefined);
    return kind === undefined ? undefined : { kind, signed: one.signed === true };
  };
  const figures = new Map<string, FigureFact>();
  for (const one of [...(source.rowFields ?? []), ...(source.detailFields ?? []), ...source.fields]) {
    if (figures.has(one.name)) continue;
    const fact = figureOf(one);
    if (fact) figures.set(one.name, fact);
  }
  // A detail's holder table draws a holder's field under the same name in the same file, so a name
  // a holder carries with another figure (a ledger entry's signed amount beside a hold's unsigned
  // one) cannot be told apart by a text check and is not judged.
  for (const one of holders.flatMap((holder) => [...(holder.rowFields ?? []), ...(holder.detailFields ?? []), ...holder.fields])) {
    const own = figures.get(one.name);
    if (!own) continue;
    const theirs = figureOf(one);
    if (theirs?.kind !== own.kind || theirs.signed !== own.signed) figures.delete(one.name);
  }
  const maxLengths: Record<string, number> = {};
  for (const one of source.fields) if (one.maxLength !== undefined) maxLengths[one.name] = one.maxLength;
  return {
    // A list that reorders by drag owns the order: a create sends the default.
    createStructured: source.createStructured ?? [],
    // Only a key the create body requires: it is what the record is about (the account and the role of a
    // grant). A provider's external id or an attachment's key is no part of the question a list answers.
    bareKeys: (source.rowFields ?? source.fields)
      .filter(
        (one) =>
          /[a-z](Id|Ids)$/.test(one.name) &&
          one.name !== source.rowIdField &&
          one.referenceNamePath === undefined &&
          one.referenceNameField === undefined &&
          (source.createRequired ?? []).includes(one.name),
      )
      .map((one) => one.name),
    createRequired: (source.createRequired ?? []).filter((name) => !(source.roles.order !== undefined && name === source.orderField)),
    maxLengths,
    booleans: new Set(source.fields.filter((one) => one.tsType === "boolean").map((one) => one.name)),
    references: [...references.values()],
    rowFields: new Set(records.map((one) => one.name)),
    figures,
  };
}

/**
 * Every check one screen file is judged by: the name paths and figure kinds of any file, the
 * create body of a form, the bare keys of a list.
 *
 * @param file the file as the finding names it
 * @param name the file's base name, which decides the checks only one kind of file gets
 * @param text the file's text
 * @param facts what Meta settles for the entity
 */
export function screenFileProblems(file: string, name: string, text: string, facts: ScreenFacts): ScreenProblem[] {
  return [
    ...nameFieldProblems(file, text, facts),
    ...figureKindProblems(file, text, facts),
    ...(name === "form.tsx" ? formProblems(file, text, facts) : []),
    ...(name === "list.tsx" ? listProblems(file, text, facts) : []),
  ];
}

/**
 * Judges the files of one screen against SimpliX Meta.
 *
 * @param rootDir the project root
 * @param entity the entity in camel case
 * @param directories the screen's `widgets/<kebab>` and `pages/<kebab>` directories
 * @returns the findings, empty when the entity is not read from Meta or its files agree
 */
export async function checkScreen(rootDir: string, entity: string, directories: readonly string[]): Promise<ScreenProblem[]> {
  const source = await loadMetaScaffoldSource(rootDir, entity);
  if (!source) return [];
  const facts = factsOf(source, (await loadMetaHolders(rootDir, entity)).map((one) => one.source));
  const problems: ScreenProblem[] = [];
  const read = (path: string): string | undefined => (existsSync(path) ? readFileSync(path, "utf-8") : undefined);
  for (const directory of directories) {
    for (const name of readdirSync(directory)) {
      if (!name.endsWith(".tsx") || name.endsWith(".stories.tsx")) continue;
      const path = join(directory, name);
      const text = read(path);
      if (text === undefined) continue;
      problems.push(...screenFileProblems(relative(rootDir, path), name, text, facts));
    }
  }
  const config = await loadConfig(rootDir);
  // The frame sits in the story directory of the app the screen's module group belongs to.
  const settings = templatesFor(config, appFor(config, { moduleGroup: directories[0] ? moduleGroupOf(rootDir, directories[0]) : undefined }));
  const storiesDir = settings.storiesDir;
  if (storiesDir) {
    const kebab = kebabEntity(entity);
    const storyPath = join(rootDir, storiesDir, storyFileFor(settings.story, kebab, `${kebab}.stories.tsx`));
    const text = read(storyPath);
    if (text !== undefined) problems.push(...flatKeyProblems(relative(rootDir, storyPath), text, facts));
  }
  return problems;
}

/**
 * Judges the named entities (every screen when none is named), prints each finding, and sets the
 * exit code when one is an error.
 *
 * @returns how many screens were judged, and the findings
 */
export async function runScreenCheck(
  rootDir: string,
  kebabs: readonly string[],
): Promise<{ judged: number; problems: ScreenProblem[] }> {
  const screens = screenDirectories(rootDir);
  const wanted = kebabs.length > 0 ? kebabs : [...screens.keys()].sort();
  const problems: ScreenProblem[] = [];
  let judged = 0;
  for (const kebab of wanted) {
    const directories = screens.get(kebab);
    if (!directories) {
      log.error(`no widgets/${kebab} or pages/${kebab} directory under modules/`);
      process.exitCode = 1;
      continue;
    }
    problems.push(...(await checkScreen(rootDir, camelEntity(kebab), directories)));
    judged += 1;
  }
  for (const one of problems) {
    const line = `${one.file}: ${one.message}`;
    if (one.severity === "error") log.error(line);
    else log.warn(line);
  }
  const errors = problems.filter((one) => one.severity === "error").length;
  console.log(`check-screen: ${judged} screen(s) judged, ${errors} error(s), ${problems.length - errors} warning(s)`);
  if (errors > 0) process.exitCode = 1;
  return { judged, problems };
}

/**
 * Judges every app that declares a design source, prints each finding as an error and sets the
 * exit code when there is one. Prints nothing for a project whose apps declare none.
 *
 * @param command the command the summary line is printed under
 * @param summary whether a passing run prints its summary line
 */
export async function runDesignCheck(rootDir: string, command: string, summary = true): Promise<string[]> {
  const { apps, routes, problems } = await designProblems(rootDir, await loadConfig(rootDir));
  if (apps.length === 0) return [];
  for (const one of problems) log.error(one);
  if (problems.length > 0) process.exitCode = 1;
  if (summary || problems.length > 0) {
    console.log(`${command} design: ${routes} routed screen(s) of ${apps.join(", ")}, ${problems.length} without their design`);
  }
  return problems;
}

interface CheckScreenFlags {
  root?: string;
}

export const checkScreenCommand = new Command("check-screen")
  .description(
    "Judge the generated screens' files against the committed SimpliX Meta: the form carries and marks what the create body " +
      "requires (a required list of records is named by the form), long text follows its length, a figure is drawn by the kind its format declares, a reference is drawn by the name field its entity declares, and a frame's sample " +
      "rows nest it. Exits 1 on an error. Without an entity, every screen read from Meta is judged, and every routed screen of an app " +
      "that declares apps.<app>.design must have its entry or row in that design source.",
  )
  .argument("[entity...]", "Entities in any case (emailLog, email-log); default: every screen under modules/")
  .option("--root <dir>", "Project root (default: discovered from the working directory)")
  .action(
    reportConfigError(async (entities: string[], flags: CheckScreenFlags) => {
      const rootDir = flags.root ?? (await findProjectRoot(process.cwd()));
      await runScreenCheck(rootDir, entities.map(kebabEntity));
      // The design gate judges the apps' routes, so it runs on a whole-project check only.
      if (entities.length === 0) await runDesignCheck(rootDir, "check-screen");
    }),
  );
