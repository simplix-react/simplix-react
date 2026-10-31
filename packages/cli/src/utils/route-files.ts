import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { RouteTarget } from "../config/types.js";
import type { AccessMeta } from "../meta/types.js";
import { toKebabCase } from "./case.js";
import { pathExists, readJsonFile, writeFileWithDir } from "./fs.js";
import type { GeneratedOutcome } from "./generated-merge.js";
import { writeGenerated } from "./project-templates.js";
import { renderTemplate } from "./template.js";

/** What routing one list screen came to. */
export interface RouteWrite {
  readonly file: string;
  readonly outcome: GeneratedOutcome | "no-template";
  /** Whether a menu entry was inserted; `false` where one for the path already existed. */
  readonly menuInserted?: boolean;
  /** Catalog files a label was added to. */
  readonly labelled: readonly string[];
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

/**
 * Registers a list screen in a menu file and returns the new text, or `undefined` when nothing
 * changes. An entry already holding the key keeps its place: it gets the `href` (and the gate)
 * it lacks, so a placeholder drawn under its own group is completed rather than duplicated. A key
 * with no entry, where nothing routes `href` either, is inserted on the line before the marker.
 */
export function insertMenuEntry(text: string, marker: string, target: MenuEntryTarget, entry: string): string | undefined {
  const keyed = new RegExp(`\\{([^{}]*?\\bkey:\\s*"${target.key.replace(/[^\w]/g, "\\$&")}")([^{}]*?)(\\s*)\\}`);
  const found = keyed.exec(text);
  if (found) {
    const [whole, head, tail, close] = found;
    if (/\bhref:/.test(head + tail)) return undefined;
    const gate = target.gate !== "undefined" && !/\bgate:/.test(head + tail) ? `, gate: ${target.gate}` : "";
    const filled = `{${head}, href: "${target.href}"${tail}${gate}${close}}`;
    return text.slice(0, found.index) + filled + text.slice(found.index + whole.length);
  }
  if (text.includes(`href: "${target.href}"`)) return undefined;
  const lines = text.split("\n");
  const at = lines.findIndex((line) => line.includes(marker));
  if (at < 0) throw new Error(`The menu file has no line holding the marker "${marker}"`);
  return [...lines.slice(0, at), entry.replace(/\n$/, ""), ...lines.slice(at)].join("\n");
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
  if (menuTemplate !== undefined) {
    const menuFile = resolve(input.rootDir, menu.file);
    const permission = input.listAccess?.kind === "permission" ? input.listAccess : undefined;
    const gate = permission ? `{ action: "${permission.action}", subject: "${permission.group}" }` : "undefined";
    const entry = renderTemplate(menuTemplate, { ...routeCtx, menuKey: input.entityPlural, menuIcon: menu.icon ?? "CircleIcon", menuGate: gate });
    const inserted = insertMenuEntry(await readFile(menuFile, "utf-8"), menu.marker, { key: input.entityPlural, href: `/${routePath}`, gate }, entry);
    if (inserted !== undefined) {
      await writeFileWithDir(menuFile, inserted);
      menuInserted = true;
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
  return { file, outcome, menuInserted, labelled };
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
