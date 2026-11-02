import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { SimplixConfig, SimplixDesignSource } from "../config/types.js";

/** The design source kinds the gate reads, by the shape of their manifest. */
export const DESIGN_SOURCES = ["screen-design", "story-manifest"] as const;

/** The path a TanStack file route's `createFileRoute("...")` call names, or undefined where it names none. */
export function readRoutePath(text: string): string | undefined {
  return /createFileRoute\(\s*(["'`])([^"'`]+)\1\s*\)/.exec(text)?.[2];
}

/**
 * The paths an app routes to: every `.ts`/`.tsx` file under `dir`, at any depth, whose name does not
 * start with `__` (a layout route draws no screen of its own), by the path its file route names.
 *
 * @returns the paths, sorted, once each; undefined when `dir` is not a directory
 */
export async function routedPaths(dir: string): Promise<string[] | undefined> {
  try {
    if (!(await stat(dir)).isDirectory()) return undefined;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") return undefined;
    throw err;
  }
  const found = new Set<string>();
  const walk = async (at: string): Promise<void> => {
    for (const entry of await readdir(at, { withFileTypes: true })) {
      const path = join(at, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.startsWith("__")) {
        const route = readRoutePath(await readFile(path, "utf-8"));
        if (route !== undefined) found.add(route);
      }
    }
  };
  await walk(dir);
  return [...found].sort();
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * The routes of `app` with no design entry in a `screen-design` manifest
 * (`{ "screens": [{ "app", "route", ... }] }`), as findings.
 *
 * @param manifest the parsed manifest
 * @param app the app whose routes are judged; only entries naming it count
 * @param routes the app's routed paths
 * @param manifestPath the manifest as configured, for the findings to name
 */
export function screenDesignProblems(manifest: unknown, app: string, routes: readonly string[], manifestPath: string): string[] {
  const screens = isRecord(manifest) ? manifest.screens : undefined;
  if (!Array.isArray(screens)) return [`${app}: ${manifestPath} has no "screens" list (design.source screen-design)`];
  const designed = new Set(screens.filter(isRecord).filter((one) => one.app === app).map((one) => one.route));
  return routes
    .filter((route) => !designed.has(route))
    .map((route) => `${app} ${route}: routed screen with no entry in ${manifestPath} (design.source screen-design); add { "app": "${app}", "route": "${route}" } with its design before the screen is made`);
}

/** Whether a manifest row names at least one story: `stories` maps each width to a list of story ids. */
function namesAStory(row: Record<string, unknown>): boolean {
  const stories = row.stories;
  if (!isRecord(stories)) return false;
  return Object.values(stories).some((ids) => Array.isArray(ids) && ids.some((id) => typeof id === "string" && id.trim() !== ""));
}

/**
 * The routes of `app` with no row naming a story in a `story-manifest` manifest
 * (`{ "rows": [{ "route", "state", "stories": { "<width>": ["<id>"] }, "fixture" }], "exempt": [{ "route", "reason" }] }`),
 * as findings; an exemption without its reason is a finding too.
 *
 * @param manifest the parsed manifest
 * @param app the app the manifest designs
 * @param routes the app's routed paths
 * @param manifestPath the manifest as configured, for the findings to name
 */
export function storyManifestProblems(manifest: unknown, app: string, routes: readonly string[], manifestPath: string): string[] {
  const rows = isRecord(manifest) ? manifest.rows : undefined;
  if (!Array.isArray(rows)) return [`${app}: ${manifestPath} has no "rows" list (design.source story-manifest)`];
  const problems: string[] = [];
  const exempt = new Set<unknown>();
  const declared = isRecord(manifest) ? manifest.exempt : undefined;
  for (const one of Array.isArray(declared) ? declared.filter(isRecord) : []) {
    if (typeof one.reason !== "string" || one.reason.trim() === "") problems.push(`${app} ${String(one.route)}: exempt in ${manifestPath} without a reason`);
    else exempt.add(one.route);
  }
  const designed = new Set(rows.filter(isRecord).filter(namesAStory).map((row) => row.route));
  for (const route of routes) {
    if (designed.has(route) || exempt.has(route)) continue;
    problems.push(
      `${app} ${route}: routed screen with no row naming a story in ${manifestPath} (design.source story-manifest); ` +
        `add { "route": "${route}", "stories": { "<width>": ["<story id>"] } } before the screen is made, or list the route under "exempt" with its reason`,
    );
  }
  return problems;
}

async function readManifest(path: string): Promise<{ manifest?: unknown; problem?: string }> {
  let text: string;
  try {
    text = await readFile(path, "utf-8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR" || code === "EISDIR") return { problem: "which is not a file" };
    throw err;
  }
  try {
    return { manifest: JSON.parse(text) as unknown };
  } catch (err) {
    if (err instanceof SyntaxError) return { problem: `which is not valid JSON: ${err.message}` };
    throw err;
  }
}

/** What judging one app came to: how many routed screens it has, and the findings. */
export interface AppDesignVerdict {
  readonly routes: number;
  readonly problems: string[];
}

/**
 * Judges one app's routed screens against the design source it declares.
 *
 * @returns the findings, empty when every routed screen has its design
 */
export async function appDesignProblems(rootDir: string, app: string, design: SimplixDesignSource): Promise<AppDesignVerdict> {
  if (!(DESIGN_SOURCES as readonly string[]).includes(design.source)) {
    return { routes: 0, problems: [`${app}: apps["${app}"].design.source "${design.source}" is not one of ${DESIGN_SOURCES.join(", ")}`] };
  }
  const routesDir = design.routes ?? join("apps", app, "src", "routes");
  const routes = await routedPaths(resolve(rootDir, routesDir));
  if (routes === undefined) {
    return { routes: 0, problems: [`${app}: apps["${app}"].design.routes "${routesDir}" resolves to ${resolve(rootDir, routesDir)}, which is not a directory`] };
  }
  const { manifest, problem } = await readManifest(resolve(rootDir, design.manifest));
  if (problem !== undefined) {
    const where = `apps["${app}"].design.manifest "${design.manifest}" resolves to ${resolve(rootDir, design.manifest)}, ${problem}`;
    return { routes: routes.length, problems: [`${app}: ${where} (design.source ${design.source}); write it before the app's screens are made`] };
  }
  const problems = design.source === "screen-design"
    ? screenDesignProblems(manifest, app, routes, design.manifest)
    : storyManifestProblems(manifest, app, routes, design.manifest);
  return { routes: routes.length, problems };
}

/**
 * Judges every app that declares a design source (`apps.<app>.design`), in app order.
 *
 * @returns the apps judged, how many routed screens they have together, and the findings; nothing
 *   is judged for a project whose apps declare no design source
 */
export async function designProblems(rootDir: string, config: SimplixConfig): Promise<{ apps: string[]; routes: number; problems: string[] }> {
  const apps: string[] = [];
  const problems: string[] = [];
  let routes = 0;
  for (const [app, settings] of Object.entries(config.apps ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    if (settings.design === undefined) continue;
    apps.push(app);
    const verdict = await appDesignProblems(rootDir, app, settings.design);
    routes += verdict.routes;
    problems.push(...verdict.problems);
  }
  return { apps, routes, problems };
}
