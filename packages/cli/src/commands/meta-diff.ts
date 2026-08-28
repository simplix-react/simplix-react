import { readdir } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { collectSurface, type Surface } from "../meta/diff-surface.js";
import {
  compareSurfaces,
  emptyExpectations,
  SAME_RUN_NOTE,
  type Expectations,
  type Finding,
} from "../meta/diff.js";
import { META_DIR } from "../meta/write.js";
import { findProjectRoot, pathExists, readJsonFile } from "../utils/fs.js";
import { log } from "../utils/logger.js";

/** The directory the orval pipeline owns, relative to a domain package root. */
const ORVAL_DIR = "src/generated";

interface MetaDiffFlags {
  root?: string;
  package?: string;
  expect?: string;
  json: boolean;
}

export const metaDiffCommand = new Command("meta-diff")
  .description(
    "Compare a domain's orval output with its DTO meta output and report where they disagree. " +
      SAME_RUN_NOTE,
  )
  .argument("<domain>", "Domain name, as it is spelled in the openapi config")
  .option("--root <dir>", "Project root (default: discovered from the working directory)")
  .option("--package <dir>", "The domain package directory, when it is not under packages/")
  .option("--expect <file>", "JSON file of renames, required-ness grounds and one-sided names")
  .option("--json", "Print the findings as JSON", false)
  .action(async (domain: string, flags: MetaDiffFlags) => {
    const rootDir = flags.root ?? (await findProjectRoot(process.cwd()));
    const packageDir = flags.package
      ? join(rootDir, flags.package)
      : await findDomainPackage(rootDir, domain);

    if (packageDir === undefined) {
      log.error(`No package found for the domain "${domain}" under ${join(rootDir, "packages")}.`);
      process.exit(1);
    }

    const orvalRoot = join(packageDir, ORVAL_DIR);
    const metaRoot = join(packageDir, META_DIR);
    for (const [label, dir] of [
      ["orval", orvalRoot],
      ["meta", metaRoot],
    ] as const) {
      if (!(await pathExists(dir))) {
        log.error(`The ${label} output is missing: ${dir}`);
        process.exit(1);
      }
    }

    const expectations = await loadExpectations(flags.expect ? join(rootDir, flags.expect) : "");
    const orval = await collectSurface(orvalRoot);
    const meta = await collectSurface(metaRoot);
    const findings = compareSurfaces(orval, meta, expectations);
    const errors = findings.filter((one) => one.level === "error");

    if (flags.json) {
      console.log(JSON.stringify({ domain, findings, note: SAME_RUN_NOTE }, null, 2));
    } else {
      report(domain, rootDir, orvalRoot, metaRoot, orval, meta, findings);
    }

    if (errors.length > 0) process.exit(1);
  });

/** Read the expectation file, or run with none when the project declared none. */
async function loadExpectations(path: string): Promise<Expectations> {
  if (path === "") return emptyExpectations();
  const loaded = await readJsonFile<Partial<Expectations>>(path);
  return {
    renames: loaded.renames ?? [],
    requiredFields: loaded.requiredFields ?? [],
    ignore: loaded.ignore ?? [],
  };
}

/**
 * The package a domain's two outputs live in.
 *
 * The directory carries the project's package prefix — `<prefix>-domain-<name>` — which is
 * configurable, so the name is matched rather than rebuilt.
 */
async function findDomainPackage(rootDir: string, domain: string): Promise<string | undefined> {
  const packagesDir = join(rootDir, "packages");
  if (!(await pathExists(packagesDir))) return undefined;
  const entries = await readdir(packagesDir, { withFileTypes: true });
  const suffix = `domain-${domain}`;
  const match = entries.find(
    (entry) =>
      entry.isDirectory() && (entry.name === suffix || entry.name.endsWith(`-${suffix}`)),
  );
  return match ? join(packagesDir, match.name) : undefined;
}

function report(
  domain: string,
  rootDir: string,
  orvalRoot: string,
  metaRoot: string,
  orval: Surface,
  meta: Surface,
  findings: Finding[],
): void {
  console.log("");
  console.log(pc.bold(`simplix meta-diff ${domain}`));
  console.log("");
  console.log(`  ${pc.dim("orval")}  ${describe(rootDir, orvalRoot, orval)}`);
  console.log(`  ${pc.dim("meta")}   ${describe(rootDir, metaRoot, meta)}`);
  console.log("");

  const errors = findings.filter((one) => one.level === "error");
  const notes = findings.filter((one) => one.level === "info");

  for (const finding of errors) {
    console.log(`  ${pc.red("✖")} ${pc.bold(finding.subject)} ${finding.message}`);
  }
  if (errors.length > 0 && notes.length > 0) console.log("");
  for (const finding of notes) {
    console.log(`  ${pc.cyan("ℹ")} ${pc.bold(finding.subject)} ${finding.message}`);
  }
  if (findings.length > 0) console.log("");

  console.log(`  ${pc.dim("※")} ${SAME_RUN_NOTE}`);
  console.log("");

  const summary = `${plural(errors.length, "error")}, ${plural(notes.length, "note")}`;
  console.log(pc.bold(`  Summary: ${errors.length > 0 ? pc.red(summary) : pc.green(summary)}`));
  console.log("");
}

function describe(rootDir: string, dir: string, surface: Surface): string {
  const where = relative(rootDir, dir) || basename(dir);
  const excluded = surface.excluded > 0 ? `, ${surface.excluded} excluded as plumbing` : "";
  const files = plural(surface.files, "file");
  return `${where} (${files}, ${plural(surface.declarations.size, "name")}${excluded})`;
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
