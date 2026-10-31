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

/**
 * Inserts `entry` on the line before the first line holding `marker`, unless `text` already
 * routes `href`; returns `undefined` when nothing is inserted.
 */
export function insertMenuEntry(text: string, marker: string, href: string, entry: string): string | undefined {
  if (text.includes(`href: "${href}"`)) return undefined;
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

  const menu = input.target.menu;
  if (!menu) return { file, outcome, labelled: [] };
  const menuTemplate = input.templates.get(menuTemplateOf(templateName));
  let menuInserted = false;
  if (menuTemplate !== undefined) {
    const menuFile = resolve(input.rootDir, menu.file);
    const permission = input.listAccess?.kind === "permission" ? input.listAccess : undefined;
    const gate = permission ? `{ action: "${permission.action}", subject: "${permission.group}" }` : "undefined";
    const entry = renderTemplate(menuTemplate, { ...routeCtx, menuKey: input.entityPlural, menuIcon: menu.icon ?? "CircleIcon", menuGate: gate });
    const inserted = insertMenuEntry(await readFile(menuFile, "utf-8"), menu.marker, `/${routePath}`, entry);
    if (inserted !== undefined) {
      await writeFileWithDir(menuFile, inserted);
      menuInserted = true;
    }
  }

  const labelled: string[] = [];
  for (const [locale, catalog] of Object.entries(menu.catalogs ?? {})) {
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
