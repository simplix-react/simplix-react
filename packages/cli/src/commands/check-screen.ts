import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { Command } from "commander";

import {
  flatKeyProblems,
  formProblems,
  listProblems,
  nameFieldProblems,
  type ReferenceFact,
  type ScreenFacts,
  type ScreenProblem,
} from "../checks/screen-check.js";
import { loadConfig } from "../config/config-loader.js";
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
      nested: one.fkEntityField,
      path: one.referenceNamePath,
      source: one.referenceNameSource ?? "declared",
    });
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
          (source.createRequired ?? []).includes(one.name),
      )
      .map((one) => one.name),
    createRequired: (source.createRequired ?? []).filter((name) => !(source.roles.order !== undefined && name === source.orderField)),
    maxLengths,
    booleans: new Set(source.fields.filter((one) => one.tsType === "boolean").map((one) => one.name)),
    references: [...references.values()],
    rowFields: new Set(records.map((one) => one.name)),
  };
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
      const file = relative(rootDir, path);
      problems.push(...nameFieldProblems(file, text, facts));
      if (name === "form.tsx") problems.push(...formProblems(file, text, facts));
      if (name === "list.tsx") problems.push(...listProblems(file, text, facts));
    }
  }
  const config = await loadConfig(rootDir);
  const storiesDir = config.templates?.storiesDir;
  if (storiesDir) {
    const kebab = kebabEntity(entity);
    const storyPath = join(rootDir, storiesDir, storyFileFor(config.templates?.story, kebab, `${kebab}.stories.tsx`));
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

interface CheckScreenFlags {
  root?: string;
}

export const checkScreenCommand = new Command("check-screen")
  .description(
    "Judge the generated screens' files against the committed SimpliX Meta: the form carries and marks what the create body " +
      "requires (a required list of records is named by the form), long text follows its length, a reference is drawn by the name field its entity declares, and a frame's sample " +
      "rows nest it. Exits 1 on an error. Without an entity, every screen read from Meta is judged.",
  )
  .argument("[entity...]", "Entities in any case (emailLog, email-log); default: every screen under modules/")
  .option("--root <dir>", "Project root (default: discovered from the working directory)")
  .action(
    reportConfigError(async (entities: string[], flags: CheckScreenFlags) => {
      const rootDir = flags.root ?? (await findProjectRoot(process.cwd()));
      await runScreenCheck(rootDir, entities.map(kebabEntity));
    }),
  );
