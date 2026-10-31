import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/*
 * Surfaces a SimpliX Meta snapshot lost while code still names them. The comparison is by name, so
 * reordering (Jackson getter order, insertion order) never counts as a removal.
 */

const SOURCE = /\.(ts|tsx|js|mjs|json)$/;
const SKIP_DIRS = new Set(["node_modules", "dist", ".turbo", "build", "coverage", ".git"]);

/** The parts of a SimpliX Meta document this check reads. */
export interface MetaDocument {
  readonly types?: Record<string, { fields?: { name: string }[] }>;
  readonly entities?: Record<string, { fields?: { name: string }[] }>;
  readonly operations?: { operationId?: string; id?: string; name?: string }[];
  readonly enums?: Record<string, { values?: (string | { name: string })[] }>;
}

/** One source file, by path, with its text. */
export interface SourceText {
  readonly path: string;
  readonly text: string;
}

/** A removed surface and the files that still name it. */
export interface MetaRemoval {
  readonly key: string;
  readonly users: string[];
}

/** Every named surface of a snapshot, as `"<kind> <owner>.<name>"` keys mapped to the bare name to search for. */
export function metaSurfaces(meta: MetaDocument): Map<string, string> {
  const out = new Map<string, string>();
  for (const group of [meta.types, meta.entities]) {
    for (const [owner, def] of Object.entries(group ?? {})) {
      out.set(`type ${owner}`, owner);
      for (const field of def.fields ?? []) out.set(`field ${owner}.${field.name}`, field.name);
    }
  }
  for (const op of meta.operations ?? []) {
    const id = op.operationId ?? op.id ?? op.name;
    if (id) out.set(`operation ${id}`, id);
  }
  for (const [owner, def] of Object.entries(meta.enums ?? {})) {
    out.set(`enum ${owner}`, owner);
    for (const value of def.values ?? []) {
      const name = typeof value === "string" ? value : value.name;
      out.set(`enumValue ${owner}.${name}`, name);
    }
  }
  return out;
}

/** Removed surfaces whose name still appears in the given sources and that nobody acknowledged. */
export function findMetaRemovals(
  before: MetaDocument,
  after: MetaDocument,
  sources: readonly SourceText[],
  acknowledged: ReadonlySet<string>,
): MetaRemoval[] {
  const now = metaSurfaces(after);
  const removals: MetaRemoval[] = [];
  for (const [key, name] of metaSurfaces(before)) {
    if (now.has(key) || acknowledged.has(key)) continue;
    const word = new RegExp(`\\b${name.replace(/[^\w]/g, "\\$&")}\\b`);
    const users = sources.filter((s) => word.test(s.text)).map((s) => s.path);
    if (users.length > 0) removals.push({ key, users });
  }
  return removals;
}

/** The source files under `roots` (relative to `rootDir`), leaving out the files named in `exclude`. */
export function readSourceTexts(rootDir: string, roots: readonly string[], exclude: ReadonlySet<string>): SourceText[] {
  const files: SourceText[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (SOURCE.test(entry)) {
        const rel = relative(rootDir, path);
        if (!exclude.has(rel)) files.push({ path: rel, text: readFileSync(path, "utf8") });
      }
    }
  };
  for (const root of roots) if (existsSync(join(rootDir, root))) walk(join(rootDir, root));
  return files;
}
