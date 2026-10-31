import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import { pathExists } from "./fs.js";

/** The directory every UI module lives under, relative to the project root. */
export const MODULES_DIR = "modules";

/**
 * A module named on the command line, resolved against the project's module groups.
 *
 * - `path`: the module's directory relative to `modules/`, with `/` separators (`admin/user`)
 * - `group`: the group it sits in, or undefined for a module directly under `modules/`
 * - `leaf`: the module's own directory name (`user`)
 */
export interface ModulePath {
  readonly path: string;
  readonly group?: string;
  readonly leaf: string;
}

/** Raised when a `--module` value names a group the project does not declare, or a group itself. */
export class ModulePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModulePathError";
  }
}

/**
 * Resolves a `--module` value: either a bare module (`billing`) or a grouped one (`admin/user`),
 * whose group must be one of `groups` (the project's `modules.groups`).
 *
 * @throws ModulePathError when the value has more than two segments, names an undeclared group,
 *   or names a declared group as if it were a module
 */
export function parseModulePath(value: string, groups: readonly string[] = []): ModulePath {
  const segments = value.replace(/\\/g, "/").split("/").filter((part) => part.length > 0);
  if (segments.length === 0 || segments.some((part) => part === "." || part === "..")) {
    throw new ModulePathError(`"${value}" is not a module path`);
  }
  if (segments.length > 2) {
    throw new ModulePathError(`"${value}" nests deeper than <group>/<module>`);
  }
  if (segments.length === 2) {
    const [group, leaf] = segments;
    if (!groups.includes(group)) {
      const declared = groups.length > 0 ? groups.join(", ") : "none";
      throw new ModulePathError(`"${group}" is not a module group of this project (modules.groups: ${declared})`);
    }
    return { path: `${group}/${leaf}`, group, leaf };
  }
  const [leaf] = segments;
  if (groups.includes(leaf)) {
    throw new ModulePathError(`"${leaf}" is a module group; name a module inside it (${leaf}/<module>)`);
  }
  return { path: leaf, leaf };
}

/** The absolute directory of a resolved module. */
export function moduleDirOf(rootDir: string, module: ModulePath): string {
  return join(rootDir, MODULES_DIR, ...module.path.split("/"));
}

/** The `--module` spelling of a module directory: its path under `modules/`, `/`-separated. */
export function modulePathOf(rootDir: string, moduleDir: string): string {
  return relative(join(rootDir, MODULES_DIR), moduleDir).split(sep).join("/");
}

/**
 * Every module of the project as its `--module` spelling: each directory under `modules/`, except
 * that a declared group contributes the directories inside it (`admin/user`) instead of itself.
 */
export async function findModulePaths(rootDir: string, groups: readonly string[] = []): Promise<string[]> {
  const modulesDir = join(rootDir, MODULES_DIR);
  if (!(await pathExists(modulesDir))) return [];
  const found: string[] = [];
  for (const entry of await readdir(modulesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (!groups.includes(entry.name)) {
      found.push(entry.name);
      continue;
    }
    for (const inner of await readdir(join(modulesDir, entry.name), { withFileTypes: true })) {
      if (inner.isDirectory() && !inner.name.startsWith(".")) found.push(`${entry.name}/${inner.name}`);
    }
  }
  return found.sort();
}
