import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parse as parseYaml } from "yaml";

/*
 * The dependency graph between the packages of one workspace, as their package.json files declare
 * it. A cycle in it (module A declares B and B declares A) is refused by a build that orders the
 * packages, and an edge a generator adds without looking is how one appears: a detail screen's
 * holder tab imports the holder's module, and the holder's module may already depend on the
 * screen's own one through a slot it fills.
 */

/** One workspace package: where it lives and the workspace packages it declares. */
export interface WorkspacePackage {
  readonly name: string;
  readonly dir: string;
  readonly dependsOn: readonly string[];
}

export type PackageGraph = ReadonlyMap<string, WorkspacePackage>;

const SKIPPED = new Set(["node_modules", "dist", ".git", ".turbo"]);

/** The workspace member globs: `pnpm-workspace.yaml` `packages`, else `package.json` `workspaces`. */
export function workspaceGlobs(rootDir: string): string[] {
  const pnpm = join(rootDir, "pnpm-workspace.yaml");
  if (existsSync(pnpm)) {
    const parsed = parseYaml(readFileSync(pnpm, "utf-8")) as { packages?: unknown } | null;
    const listed = parsed?.packages;
    return Array.isArray(listed) ? listed.filter((one): one is string => typeof one === "string") : [];
  }
  const manifest = join(rootDir, "package.json");
  if (!existsSync(manifest)) return [];
  const workspaces = (JSON.parse(readFileSync(manifest, "utf-8")) as { workspaces?: unknown }).workspaces;
  const listed = Array.isArray(workspaces) ? workspaces : (workspaces as { packages?: unknown } | undefined)?.packages;
  return Array.isArray(listed) ? listed.filter((one): one is string => typeof one === "string") : [];
}

/** Directories a glob names, one path segment at a time: `*` is one directory, `**` any depth. */
function expandGlob(rootDir: string, glob: string): string[] {
  let current = [""];
  for (const segment of glob.replace(/^\.\//, "").split("/").filter((one) => one !== "")) {
    const next: string[] = [];
    for (const base of current) {
      if (segment === "**") {
        const walk = (dir: string): void => {
          next.push(dir);
          for (const child of childDirs(rootDir, dir)) walk(join(dir, child));
        };
        walk(base);
      } else if (segment.includes("*")) {
        const pattern = new RegExp(`^${segment.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")}$`);
        for (const child of childDirs(rootDir, base)) if (pattern.test(child)) next.push(join(base, child));
      } else {
        next.push(join(base, segment));
      }
    }
    current = next;
  }
  return current;
}

function childDirs(rootDir: string, dir: string): string[] {
  const at = join(rootDir, dir);
  if (!existsSync(at)) return [];
  return readdirSync(at, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !SKIPPED.has(entry.name))
    .map((entry) => entry.name);
}

/**
 * Reads every workspace package and the workspace packages each declares, in `dependencies`,
 * `devDependencies` and `peerDependencies` alike: each is an edge a build orders by.
 *
 * @param rootDir the workspace root
 * @returns the packages by name; an exclusion glob (`!path`) drops what it names
 */
export function readPackageGraph(rootDir: string): PackageGraph {
  const globs = workspaceGlobs(rootDir);
  const excluded = new Set(globs.filter((one) => one.startsWith("!")).flatMap((one) => expandGlob(rootDir, one.slice(1))));
  const declared = new Map<string, { dir: string; names: string[] }>();
  for (const glob of globs.filter((one) => !one.startsWith("!"))) {
    for (const dir of expandGlob(rootDir, glob)) {
      if (excluded.has(dir)) continue;
      const manifest = join(rootDir, dir, "package.json");
      if (!existsSync(manifest)) continue;
      const pkg = JSON.parse(readFileSync(manifest, "utf-8")) as { name?: string; dependencies?: object; devDependencies?: object; peerDependencies?: object };
      if (!pkg.name) continue;
      declared.set(pkg.name, { dir: join(rootDir, dir), names: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }) });
    }
  }
  const graph = new Map<string, WorkspacePackage>();
  for (const [name, { dir, names }] of declared) {
    graph.set(name, { name, dir, dependsOn: names.filter((one) => one !== name && declared.has(one)).sort() });
  }
  return graph;
}

/**
 * The packages a dependency of `from` on `to` would pass through to come back to `from`: the path
 * from `to` to `from` already in the graph, or `undefined` when the edge closes no cycle.
 *
 * @example
 * ```ts
 * // admin-billing declares admin-user; admin-user declaring admin-billing would close the ring.
 * cycleThrough(graph, "@app/admin-user", "@app/admin-billing"); // ["@app/admin-billing", "@app/admin-user"]
 * ```
 */
export function cycleThrough(graph: PackageGraph, from: string, to: string): string[] | undefined {
  if (from === to) return [to];
  const cameFrom = new Map<string, string>();
  const queue = [to];
  const seen = new Set([to]);
  while (queue.length > 0) {
    const at = queue.shift() as string;
    for (const next of graph.get(at)?.dependsOn ?? []) {
      if (seen.has(next)) continue;
      cameFrom.set(next, at);
      if (next === from) {
        const path = [from];
        for (let step = at; step !== to; step = cameFrom.get(step) as string) path.unshift(step);
        return [to, ...path];
      }
      seen.add(next);
      queue.push(next);
    }
  }
  return undefined;
}

/**
 * Every ring of the graph once, each starting from its alphabetically first package.
 *
 * @param graph the workspace graph
 * @returns the rings, as package names with the first not repeated at the end
 */
export function packageCycles(graph: PackageGraph): string[][] {
  const rings = new Map<string, string[]>();
  for (const [name, pkg] of graph) {
    for (const dependency of pkg.dependsOn) {
      const back = cycleThrough(graph, name, dependency);
      if (!back) continue;
      // `back` runs dependency -> ... -> name; the ring is name -> dependency -> ... -> name.
      const ring = [name, ...back.slice(0, -1)];
      const start = ring.indexOf([...ring].sort()[0] as string);
      const canonical = [...ring.slice(start), ...ring.slice(0, start)];
      rings.set(canonical.join(" "), canonical);
    }
  }
  return [...rings.values()];
}

/** A ring as one line, with each package's directory relative to the root. */
export function describeRing(rootDir: string, graph: PackageGraph, ring: readonly string[]): string {
  const show = (name: string) => {
    const dir = graph.get(name)?.dir;
    return dir ? `${name} (${relative(rootDir, dir).split(sep).join("/")})` : name;
  };
  return [...ring, ring[0] as string].map(show).join(" -> ");
}
