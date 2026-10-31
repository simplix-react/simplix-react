import { Command } from "commander";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { findMetaRemovals, readSourceTexts, type MetaDocument } from "../checks/meta-removals.js";
import { loadConfig } from "../config/config-loader.js";
import { reportConfigError } from "../config/report-config-error.js";
import type { SimplixConfig } from "../config/types.js";
import { findProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";

interface MetaRemovalsFlags {
  root?: string;
  base: string;
}

/** The snapshot the check compares: `checks.metaRemovals.snapshot`, else the one `meta.snapshot` declared. */
export function resolveMetaSnapshot(config: SimplixConfig): string | undefined {
  const named = config.checks?.metaRemovals?.snapshot;
  if (named) return named;
  const declared = [...new Set((config.openapi ?? []).map((spec) => spec.meta?.snapshot).filter((s): s is string => !!s))];
  return declared.length === 1 ? declared[0] : undefined;
}

/** The snapshot as committed at `base`, or undefined when that revision has none. */
function readAtRevision(rootDir: string, base: string, path: string): string | undefined {
  try {
    return execFileSync("git", ["show", `${base}:./${path}`], { cwd: rootDir, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });
  } catch (error) {
    if (error instanceof Error) return undefined;
    throw error;
  }
}

export const metaRemovalsCommand = new Command("meta-removals")
  .description(
    "Fail when the SimpliX Meta snapshot loses a type, field, operation or enum value that code under the roots " +
      "still names, unless the acknowledged file lists it. Roots default to checks.metaRemovals.roots.",
  )
  .argument("[roots...]", "Directories relative to the project root")
  .option("--root <dir>", "Project root (default: discovered from the working directory)")
  .option("--base <ref>", "Git revision whose snapshot is the before side", "HEAD")
  .action(
    reportConfigError(async (args: string[], flags: MetaRemovalsFlags) => {
      const rootDir = flags.root ?? (await findProjectRoot(process.cwd()));
      const config = await loadConfig(rootDir);
      const settings = config.checks?.metaRemovals;
      const roots = args.length > 0 ? args : (settings?.roots ?? []);
      if (roots.length === 0) {
        log.error("No roots: pass them as arguments or set checks.metaRemovals.roots in simplix.config.ts");
        process.exitCode = 2;
        return;
      }
      const snapshot = resolveMetaSnapshot(config);
      if (!snapshot) {
        log.error("No snapshot: set checks.metaRemovals.snapshot, or declare exactly one openapi[].meta.snapshot");
        process.exitCode = 2;
        return;
      }
      const beforeText = readAtRevision(rootDir, flags.base, snapshot);
      if (beforeText === undefined) {
        log.info(`meta-removals: no ${snapshot} at ${flags.base}, nothing to compare`);
        return;
      }
      const ackPath = settings?.acknowledged;
      const acknowledged = new Set<string>(
        ackPath && existsSync(join(rootDir, ackPath))
          ? ((JSON.parse(readFileSync(join(rootDir, ackPath), "utf8")) as { acknowledged?: string[] }).acknowledged ?? [])
          : [],
      );
      const removals = findMetaRemovals(
        JSON.parse(beforeText) as MetaDocument,
        JSON.parse(readFileSync(join(rootDir, snapshot), "utf8")) as MetaDocument,
        readSourceTexts(rootDir, roots, new Set([snapshot])),
        acknowledged,
      );
      if (removals.length === 0) {
        log.success(`meta-removals: no referenced surface removed since ${flags.base}`);
        return;
      }
      for (const { key, users } of removals) {
        const more = users.length > 3 ? ` (+${users.length - 3})` : "";
        log.error(`meta-removals: ${key} left ${snapshot} but is still named in ${users.slice(0, 3).join(", ")}${more}`);
      }
      log.error(
        ackPath
          ? `Restore it at the source, or list the key under "acknowledged" in ${ackPath} when the removal is intended.`
          : "Restore it at the source, or set checks.metaRemovals.acknowledged to a file listing the intended removals.",
      );
      process.exitCode = 1;
    }),
  );
