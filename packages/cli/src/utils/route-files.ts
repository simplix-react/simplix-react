import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { MenuGateConfig, RouteTarget } from "../config/types.js";
import type { AccessMeta } from "../meta/types.js";
import { toCamelCase, toKebabCase } from "./case.js";
import { pathExists, readJsonFile, writeFileWithDir } from "./fs.js";
import type { GeneratedOutcome } from "./generated-merge.js";
import { log } from "./logger.js";
import { writeGenerated } from "./project-templates.js";
import { ensureTableEntry } from "./subjects-table.js";
import { renderTemplate } from "./template.js";

/** What routing one list screen came to. */
export interface RouteWrite {
  readonly file: string;
  readonly outcome: GeneratedOutcome | "no-template";
  /** Whether a menu entry was inserted; `false` where one for the path already existed. */
  readonly menuInserted?: boolean;
  /** What became of the subjects table entry the inserted gate reads, where the config names a table. */
  readonly subject?: SubjectWrite;
  /** Catalog files a label was added to. */
  readonly labelled: readonly string[];
}

/** What routing a list screen did to the subjects table its menu gate reads. */
export interface SubjectWrite {
  /** The table file, relative to the project root. */
  readonly file: string;
  /** The property the gate reads, or `undefined` where the rendered expression is not a member of the table. */
  readonly key?: string;
  readonly outcome: "added" | "present" | "no-file" | "no-table" | "inline-table" | "not-a-member";
}

export interface RouteInput {
  readonly rootDir: string;
  readonly moduleDir: string;
  readonly target: RouteTarget;
  readonly templates: ReadonlyMap<string, string>;
  readonly ctx: Readonly<Record<string, unknown>>;
  readonly entityKebab: string;
  /** The entity's plural in camel case, which names the menu entry and its label key. */
  readonly entityPlural: string;
  /** The generated access rule's export name for the list operation, where SimpliX Meta states one. */
  readonly accessList?: string;
  readonly listAccess?: AccessMeta;
  readonly plural?: Readonly<Record<string, string>>;
  readonly origin: string;
}

/** The URL path a list screen is routed at: the configured one, else the entity's plural in kebab case. */
export function routePathOf(target: RouteTarget, entityKebab: string, entityPlural: string): string {
  return target.paths?.[entityKebab] ?? toKebabCase(entityPlural);
}

/** The menu template beside a route template: `route.tanstack` → `menu-entry.tanstack`. */
export function menuTemplateOf(routeTemplate: string): string {
  return routeTemplate.replace(/^route/, "menu-entry");
}

/** The menu entry a list screen registers: its key, the path it routes, and its gate expression. */
export interface MenuEntryTarget {
  readonly key: string;
  readonly href: string;
  /** The gate expression, or `"undefined"` when the screen has none. */
  readonly gate: string;
}

/** A menu file with a screen registered in it. */
export interface MenuPlacement {
  readonly text: string;
  /** Whether the target's gate expression is now in the file because of this placement. */
  readonly gated: boolean;
}

/**
 * Registers a list screen in a menu file, or returns `undefined` when nothing changes. An entry
 * already holding the key keeps its place: it gets the `href` it lacks and the screen's gate, so a
 * placeholder drawn under its own group is completed rather than duplicated. A placeholder routes
 * nowhere, so a gate it carries stood for a screen that did not exist yet and gives way to the gate
 * of the screen it now opens, which reads the list permission the server enforces. A key with no
 * entry, where nothing routes `href` either, is inserted on the line before the marker.
 */
export function placeMenuEntry(text: string, marker: string, target: MenuEntryTarget, entry: string): MenuPlacement | undefined {
  const keyed = new RegExp(`\\{([^{}]*?\\bkey:\\s*"${target.key.replace(/[^\w]/g, "\\$&")}")([^{}]*?)(\\s*)\\}`);
  const found = keyed.exec(text);
  if (found) {
    const [whole, head, tail, close] = found;
    if (/\bhref:/.test(head + tail)) return undefined;
    const gated = target.gate !== "undefined";
    // The placeholder's own gate is dropped: an expression without braces, up to the next comma.
    const strip = (part: string) => (gated ? part.replace(/,?\s*\bgate:\s*[^,{}]+/, "") : part);
    const gate = gated ? `, gate: ${target.gate}` : "";
    const filled = `{${strip(head)}, href: "${target.href}"${strip(tail)}${gate}${close}}`;
    return { text: text.slice(0, found.index) + filled + text.slice(found.index + whole.length), gated };
  }
  if (text.includes(`href: "${target.href}"`)) return undefined;
  const lines = text.split("\n");
  const at = lines.findIndex((line) => line.includes(marker));
  if (at < 0) throw new Error(`The menu file has no line holding the marker "${marker}"`);
  return { text: [...lines.slice(0, at), entry.replace(/\n$/, ""), ...lines.slice(at)].join("\n"), gated: target.gate !== "undefined" && entry.includes(target.gate) };
}

/** {@link placeMenuEntry}, returning only the new text. */
export function insertMenuEntry(text: string, marker: string, target: MenuEntryTarget, entry: string): string | undefined {
  return placeMenuEntry(text, marker, target, entry)?.text;
}

/** The subject expression of a menu gate: the configured template, else the group as a string literal. */
export function menuSubject(gate: MenuGateConfig | undefined, ctx: Readonly<Record<string, unknown>>, group: string): string {
  return gate ? renderTemplate(gate.subject, { ...ctx, group }) : `"${group}"`;
}

/**
 * Adds the property a menu gate reads to the subjects table, where the rendered expression is
 * `<table name>.<key>`. A table that already has the key keeps its value.
 */
async function ensureSubject(rootDir: string, table: NonNullable<MenuGateConfig["table"]>, expression: string, group: string, label: string | undefined): Promise<SubjectWrite> {
  const file = table.file;
  const name = table.name ?? "SUBJECTS";
  const key = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.([A-Za-z_$][\\w$]*)$`).exec(expression.trim())?.[1];
  if (key === undefined) return { file, outcome: "not-a-member" };
  const path = resolve(rootDir, file);
  if (!(await pathExists(path))) return { file, key, outcome: "no-file" };
  const result = ensureTableEntry(await readFile(path, "utf-8"), name, key, group, label === undefined ? undefined : `${label}.`);
  if (result.outcome !== "added") return { file, key, outcome: result.outcome };
  await writeFileWithDir(path, result.text);
  return { file, key, outcome: "added" };
}

/** Says what routing did to the subjects table; an outcome that leaves a gate unresolved is a warning. */
export function logSubjectWrite(write: SubjectWrite): void {
  const where = `menu.gate.table "${write.file}"`;
  const entry = write.key === undefined ? "the gate's property" : `"${write.key}"`;
  if (write.outcome === "added") log.info(`Added ${entry} to ${write.file}`);
  else if (write.outcome === "no-file") log.warn(`${where} does not exist: add ${entry} to the subjects table by hand`);
  else if (write.outcome === "no-table") log.warn(`${write.file} declares no object of the configured name: add ${entry} to the subjects table by hand`);
  else if (write.outcome === "inline-table") log.warn(`${write.file} lists its entries on one line: add ${entry} to the subjects table by hand`);
  else if (write.outcome === "not-a-member") log.warn(`menu.gate.subject renders an expression that is not a member of the table in ${write.file}: the table was left as it is`);
}

/**
 * Writes the route file a list screen is reached through, from the route template, and registers
 * its menu entry and label where the module group's route target names a menu.
 */
export async function writeRoute(input: RouteInput): Promise<RouteWrite> {
  const templateName = input.target.template ?? "route";
  const template = input.templates.get(templateName);
  const routePath = routePathOf(input.target, input.entityKebab, input.entityPlural);
  const file = resolve(input.rootDir, input.target.dir, `${routePath}.tsx`);
  if (template === undefined) return { file, outcome: "no-template", labelled: [] };

  const manifest = await readJsonFile<{ name?: string; exports?: Record<string, unknown> }>(join(input.moduleDir, "package.json"));
  const modulePackage = manifest.name ?? "";
  // A module that exports its catalogs registers them when its screen is first routed to.
  const moduleLocales = manifest.exports?.["./locales"] !== undefined;
  const routeCtx = { ...input.ctx, routePath, modulePackage, moduleLocales, accessList: input.accessList };
  const outcome = await writeGenerated(file, renderTemplate(template, routeCtx), input.origin);
  await ensureAppDependencies(resolve(input.rootDir, input.target.dir), [String(input.ctx.packageName ?? ""), modulePackage]);

  const menu = input.target.menu;
  if (!menu) return { file, outcome, labelled: [] };
  const menuTemplate = input.templates.get(menuTemplateOf(templateName));
  let menuInserted = false;
  let subjectWrite: SubjectWrite | undefined;
  if (menuTemplate !== undefined) {
    const menuFile = resolve(input.rootDir, menu.file);
    const permission = input.listAccess?.kind === "permission" ? input.listAccess : undefined;
    const subject = permission ? menuSubject(menu.gate, { ...routeCtx, entityCamel: toCamelCase(input.entityKebab) }, permission.group) : undefined;
    const gate = permission ? `{ action: "${permission.action}", subject: ${subject} }` : "undefined";
    const entry = renderTemplate(menuTemplate, { ...routeCtx, menuKey: input.entityPlural, menuIcon: menu.icon ?? "CircleIcon", menuGate: gate });
    const placed = placeMenuEntry(await readFile(menuFile, "utf-8"), menu.marker, { key: input.entityPlural, href: `/${routePath}`, gate }, entry);
    if (placed !== undefined) {
      await writeFileWithDir(menuFile, placed.text);
      menuInserted = true;
      // The table gains the property only for a gate this run put into the menu: an entry that kept
      // a gate of its own reads nothing from it.
      if (placed.gated && permission && subject !== undefined && menu.gate?.table) {
        subjectWrite = await ensureSubject(input.rootDir, menu.gate.table, subject, permission.group, input.plural?.["en"]);
      }
    }
  }

  const labelled: string[] = [];
  // An entry already in the menu already has its label, under whatever key its author chose.
  for (const [locale, catalog] of menuInserted ? Object.entries(menu.catalogs ?? {}) : []) {
    const label = input.plural?.[locale] ?? input.plural?.["en"];
    if (label === undefined) continue;
    const path = resolve(input.rootDir, catalog);
    if (!(await pathExists(path))) continue;
    const data = await readJsonFile<Record<string, unknown>>(path);
    let node: Record<string, unknown> = data;
    for (const segment of (menu.keyPath ?? "").split(".").filter(Boolean)) {
      const next = node[segment];
      if (typeof next !== "object" || next === null) node[segment] = {};
      node = node[segment] as Record<string, unknown>;
    }
    if (node[input.entityPlural] !== undefined) continue;
    node[input.entityPlural] = label;
    await writeFileWithDir(path, `${JSON.stringify(data, null, 2)}\n`);
    labelled.push(catalog);
  }
  return { file, outcome, menuInserted, ...(subjectWrite ? { subject: subjectWrite } : {}), labelled };
}

/**
 * Declares each package the route imports in the app that owns the route directory (the nearest
 * `package.json` above it), so the import resolves once the workspace is installed.
 *
 * @returns the packages added
 */
export async function ensureAppDependencies(routeDir: string, packages: readonly string[]): Promise<string[]> {
  let dir = routeDir;
  while (!(await pathExists(join(dir, "package.json")))) {
    const parent = resolve(dir, "..");
    if (parent === dir) return [];
    dir = parent;
  }
  const path = join(dir, "package.json");
  const manifest = await readJsonFile<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(path);
  const declared = { ...manifest.dependencies, ...manifest.devDependencies };
  const missing = packages.filter((name) => name !== "" && declared[name] === undefined);
  if (missing.length === 0) return [];
  manifest.dependencies = { ...manifest.dependencies, ...Object.fromEntries(missing.map((name) => [name, "workspace:*"])) };
  await writeFileWithDir(path, `${JSON.stringify(manifest, null, 2)}\n`);
  return missing;
}
