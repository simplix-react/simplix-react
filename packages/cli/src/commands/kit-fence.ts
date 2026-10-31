import { Command } from "commander";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { loadConfig } from "../config/config-loader.js";
import { findProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { resolveKitPackageDir } from "../utils/project-templates.js";

/** One restricted import, in the shape oxlint's and ESLint's `no-restricted-imports` take. */
export interface FencedImport {
  readonly name: string;
  readonly importNames?: readonly string[];
  readonly message?: string;
}

/** Where a kit's manifest lists the framework parts a screen must not import. */
export const KIT_FENCE_FIELD = "fence";

const RULE = "no-restricted-imports";

/** The fence a kit declares under `simplix.fence` in its package.json. */
export async function readKitFence(rootDir: string, kit: string): Promise<FencedImport[]> {
  const dir = await resolveKitPackageDir(rootDir, kit);
  if (!dir) throw new Error(`templates.from names "${kit}", which is not installed at ${rootDir}`);
  const manifest = JSON.parse(await readFile(join(dir, "package.json"), "utf-8")) as { simplix?: { fence?: FencedImport[] } };
  const fence = manifest.simplix?.[KIT_FENCE_FIELD];
  if (!Array.isArray(fence)) throw new Error(`${kit} declares no simplix.${KIT_FENCE_FIELD} in its package.json`);
  return fence;
}

type Override = { files?: string[]; rules?: Record<string, unknown> };

/** The override in a lint config that holds the fence, found by its rule. */
function fenceOverride(config: { overrides?: Override[] }): Override | undefined {
  return config.overrides?.find((o) => o.rules !== undefined && RULE in o.rules);
}

function pathsOf(override: Override | undefined): FencedImport[] {
  const rule = override?.rules?.[RULE];
  if (!Array.isArray(rule)) return [];
  const options = rule[1] as { paths?: FencedImport[] } | undefined;
  return options?.paths ?? [];
}

/** A fence in a form two lists can be compared in, ignoring the order of names. */
function canonical(fence: readonly FencedImport[]): string {
  return JSON.stringify(
    [...fence]
      .map((f) => ({ name: f.name, importNames: [...(f.importNames ?? [])].sort(), message: f.message ?? "" }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
}

/**
 * Whether the lint config's fence is the kit's, and the differences when it is not.
 *
 * @returns the names each side has that the other lacks; both empty when they agree
 */
export function compareFence(kit: readonly FencedImport[], lint: readonly FencedImport[]): string[] {
  if (canonical(kit) === canonical(lint)) return [];
  const flat = (fence: readonly FencedImport[]) =>
    new Set(fence.flatMap((f) => (f.importNames && f.importNames.length > 0 ? f.importNames.map((n) => `${f.name}#${n}`) : [f.name])));
  const k = flat(kit);
  const l = flat(lint);
  const missing = [...k].filter((x) => !l.has(x)).map((x) => `lint lacks ${x}`);
  const extra = [...l].filter((x) => !k.has(x)).map((x) => `lint adds ${x}, which the kit does not fence`);
  return missing.length + extra.length > 0 ? [...missing, ...extra] : ["the messages differ"];
}

export const kitFenceCommand = new Command("kit-fence")
  .description("Check that the lint config refuses exactly the framework imports the UI kit fences (simplix.fence)")
  .option("--lint <file>", "The lint config holding the fence", ".oxlintrc.json")
  .option("--write", "Write the kit's fence into the lint config instead of checking it")
  .action(async (flags: { lint: string; write?: boolean }) => {
    const rootDir = await findProjectRoot(process.cwd());
    const config = await loadConfig(rootDir);
    const kit = config.templates?.from;
    if (!kit) {
      log.error("simplix.config.ts names no templates.from, so there is no kit whose fence to read");
      process.exitCode = 1;
      return;
    }
    const fence = await readKitFence(rootDir, kit);
    const lintPath = join(rootDir, flags.lint);
    const lint = JSON.parse(await readFile(lintPath, "utf-8")) as { overrides?: Override[] };
    const override = fenceOverride(lint);
    if (flags.write) {
      if (!override?.rules) throw new Error(`${flags.lint} has no override holding ${RULE}; add one naming the screen files first`);
      override.rules[RULE] = ["error", { paths: fence }];
      await writeFile(lintPath, JSON.stringify(lint, null, 2) + "\n", "utf-8");
      log.success(`${flags.lint}: fence written from ${kit}`);
      return;
    }
    const differences = compareFence(fence, pathsOf(override));
    if (differences.length === 0) {
      log.success(`kit fence: ${flags.lint} refuses what ${kit} fences`);
      return;
    }
    for (const d of differences) log.error(d);
    log.error(`${flags.lint} disagrees with ${kit}'s simplix.fence; run \`simplix kit-fence --write\``);
    process.exitCode = 1;
  });
