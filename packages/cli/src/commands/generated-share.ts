import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { toCamelCase, toKebabCase, toPascalCase } from "../utils/case.js";
import type { GeneratedEntry } from "./generated.js";

/** How much of one screen is the generator's, and how much is its own. */
export interface ScreenShare {
  /** The screen: an entity's or a page's directory name, shared by its pages, widgets and story. */
  readonly screen: string;
  /** Lines the generator renders for the screen's files now. */
  readonly generated: number;
  /** Lines an edited generated file holds that its render does not. */
  readonly customised: number;
  /** Lines the screen's `*.blocks.tsx` files hold beyond the stub their template laid down. */
  readonly blocks: number;
  /** `(customised + blocks) / (generated + customised + blocks)`, 0 to 1. */
  readonly share: number;
}

/** A customised or block line that two or more screens hold, once their own names are taken out. */
export interface RecurringCustomisation {
  readonly line: string;
  readonly screens: readonly string[];
}

const BLOCKS_FILE = /\.blocks\.tsx?$/;

/** Lines shorter than this, imports and closing punctuation say nothing about a customisation. */
const MIN_LINE = 24;
const TRIVIAL = /^(import\b|export \{|\}|\)|\]|\/\/|\/\*|\*)/;

function screenOf(path: string): string {
  const file = basename(path);
  if (/\.stories\.tsx?$/.test(file)) return file.replace(/\.stories\.tsx?$/, "");
  return basename(dirname(path));
}

/** Lines `held` has beyond `base`, counted as a multiset so a moved line is not counted twice. */
function addedLines(held: string, base: string): string[] {
  const left = new Map<string, number>();
  for (const line of base.split("\n")) left.set(line, (left.get(line) ?? 0) + 1);
  const added: string[] = [];
  for (const line of held.split("\n")) {
    const n = left.get(line) ?? 0;
    if (n > 0) left.set(line, n - 1);
    else if (line.trim() !== "") added.push(line);
  }
  return added;
}

/** A line with the screen's own names replaced, so the same change on two screens reads the same. */
function normalise(line: string, screen: string): string {
  let out = line.trim();
  for (const name of [toPascalCase(screen), toCamelCase(screen), toKebabCase(screen)]) {
    if (name.length > 0) out = out.split(name).join("<entity>");
  }
  return out;
}

/**
 * Per screen, the lines its blocks and edited files hold against the lines the generator renders,
 * and the customisations two or more screens repeat, which belong in a template or the kit.
 *
 * @param rootDir the project root the entries' paths are relative to
 * @param entries the generated-state report, taken with renders for edited files
 * @param keptRenders what the generator renders now for each kept file, blocks included, by path
 */
export async function shareReport(
  rootDir: string,
  entries: readonly GeneratedEntry[],
  keptRenders: ReadonlyMap<string, string> = new Map(),
): Promise<{ screens: ScreenShare[]; recurring: RecurringCustomisation[] }> {
  const tally = new Map<string, { generated: number; customised: number; blocks: number }>();
  const own = new Map<string, Set<string>>();
  const at = (screen: string) => {
    let t = tally.get(screen);
    if (!t) {
      t = { generated: 0, customised: 0, blocks: 0 };
      tally.set(screen, t);
    }
    return t;
  };
  const remember = (screen: string, lines: readonly string[]) => {
    let set = own.get(screen);
    if (!set) {
      set = new Set();
      own.set(screen, set);
    }
    for (const line of lines) {
      const n = normalise(line, screen);
      if (n.length >= MIN_LINE && !TRIVIAL.test(n)) set.add(n);
    }
  };

  const dirs = new Set<string>();
  const tracked = new Set<string>();
  for (const e of entries) {
    const file = resolve(rootDir, e.path);
    const screen = screenOf(e.path);
    const held = await readFile(file, "utf-8");
    dirs.add(dirname(file));
    tracked.add(file);
    if (e.state === "edited" && e.render !== undefined) {
      const added = addedLines(held, e.render);
      at(screen).generated += e.render.split("\n").length;
      // A tracked blocks file's own lines are the screen's blocks, read against its render.
      if (BLOCKS_FILE.test(e.path)) at(screen).blocks += added.length;
      else at(screen).customised += added.length;
      remember(screen, added);
    } else if (e.state === "edited") {
      // No render to read it against (stamped before origins were recorded): all of it is the
      // screen's own until it is regenerated.
      at(screen).customised += held.split("\n").filter((l) => l.trim() !== "").length;
    } else {
      at(screen).generated += held.split("\n").length;
    }
  }
  for (const dir of dirs) {
    for (const name of await readdir(dir)) {
      if (!BLOCKS_FILE.test(name)) continue;
      const file = join(dir, name);
      if (tracked.has(file)) continue;
      const held = await readFile(file, "utf-8");
      const stub = keptRenders.get(file);
      // A blocks file starts as its template's stub; only what was written into it is the screen's.
      const lines = stub !== undefined ? addedLines(held, stub) : held.split("\n").filter((l) => l.trim() !== "");
      const screen = basename(dir);
      at(screen).blocks += lines.length;
      remember(screen, lines);
    }
  }

  const screens = [...tally]
    .map(([screen, t]) => {
      const total = t.generated + t.customised + t.blocks;
      return { screen, ...t, share: total === 0 ? 0 : (t.customised + t.blocks) / total };
    })
    .sort((a, b) => a.screen.localeCompare(b.screen));

  const holders = new Map<string, string[]>();
  for (const [screen, lines] of own) {
    for (const line of lines) holders.set(line, [...(holders.get(line) ?? []), screen]);
  }
  const recurring = [...holders]
    .filter(([, list]) => list.length >= 2)
    .map(([line, list]) => ({ line, screens: list.sort() }))
    .sort((a, b) => b.screens.length - a.screens.length || a.line.localeCompare(b.line));
  return { screens, recurring };
}
