import { Command } from "commander";
import { existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { checkCycles, edgeKind, type CycleReport } from "../checks/import-cycles.js";
import { describeRing, packageCycles, readPackageGraph, type PackageGraph } from "../checks/package-cycles.js";
import { loadConfig } from "../config/config-loader.js";
import { reportConfigError } from "../config/report-config-error.js";
import { requireProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";

interface CyclesFlags {
  root?: string;
}

/** The report lines for one run, errors first; `failed` says whether the run fails. */
export function describeCycles(rootDir: string, result: CycleReport): { errors: string[]; summary: string; failed: boolean } {
  const show = (file: string): string => relative(rootDir, file);
  const errors: string[] = [];
  for (const { file, specifier } of result.unresolved) {
    errors.push(`${show(file)}: cannot resolve "${specifier}", so its edge is not checked`);
  }
  for (const cycle of result.cycles) {
    const ring = [...cycle, cycle[0]!];
    const line = ring
      .map((file, i) => (i === 0 ? show(file) : `${show(file)}${edgeKind(result.edges, ring[i - 1]!, file)}`))
      .join("\n    -> ");
    errors.push(`import cycle\n    ${line}`);
  }
  const summary = `${result.files.length} files, ${result.components.length} cyclic group(s), ${result.cycles.length} cycle(s), ${result.unresolved.length} unresolved`;
  return { errors, summary, failed: result.cycles.length > 0 || result.unresolved.length > 0 };
}

/** The report lines for the workspace packages' dependency rings; `failed` says whether there is one. */
export function describePackageCycles(rootDir: string, graph: PackageGraph): { errors: string[]; summary: string; failed: boolean } {
  const rings = packageCycles(graph);
  return {
    errors: rings.map((ring) => `package dependency cycle\n    ${describeRing(rootDir, graph, ring)}`),
    summary: `${graph.size} workspace package(s), ${rings.length} dependency cycle(s)`,
    failed: rings.length > 0,
  };
}

export const cyclesCommand = new Command("cycles")
  .description(
    "Report every import cycle among the source files under the given roots, with the edges the bundler keeps " +
      "(a cycle makes Vite's hot update reload the whole page), and every dependency cycle between the workspace " +
      "packages' package.json files. Roots default to checks.cycles.roots.",
  )
  .argument("[roots...]", "Directories relative to the project root")
  .option("--root <dir>", "Project root (default: discovered from the working directory)")
  .action(
    reportConfigError(async (args: string[], flags: CyclesFlags) => {
    const rootDir = flags.root ?? (await requireProjectRoot(process.cwd()));
    const roots = args.length > 0 ? args : ((await loadConfig(rootDir)).checks?.cycles?.roots ?? []);
    if (roots.length === 0) {
      log.error("No roots: pass them as arguments or set checks.cycles.roots in simplix.config.ts");
      process.exitCode = 2;
      return;
    }
    const missing = roots.filter((r) => !existsSync(join(rootDir, r)) || !statSync(join(rootDir, r)).isDirectory());
    if (missing.length > 0) {
      log.error(`Not a directory under ${rootDir}: ${missing.join(", ")}`);
      process.exitCode = 2;
      return;
    }
    const { errors, summary, failed } = describeCycles(rootDir, checkCycles(rootDir, roots));
    for (const line of errors) log.error(line);
    if (failed) {
      log.error(summary);
      process.exitCode = 1;
    } else {
      log.success(`no import cycles (${summary})`);
    }
    // The packages' own declarations can close a ring the files never do (a dependency a
    // generator added that no file imports yet), and a build that orders the packages refuses it.
    const packages = describePackageCycles(rootDir, readPackageGraph(rootDir));
    for (const line of packages.errors) log.error(line);
    if (packages.failed) {
      log.error(packages.summary);
      process.exitCode = 1;
    } else {
      log.success(`no package dependency cycles (${packages.summary})`);
    }
    }),
  );
