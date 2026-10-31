import { Command } from "commander";
import { loadConfig } from "../config/config-loader.js";
import { reportConfigError } from "../config/report-config-error.js";
import { findModulePaths } from "../utils/module-path.js";
import { join, relative } from "node:path";
import { readdir } from "node:fs/promises";
import { log } from "../utils/logger.js";
import { pathExists, findProjectRoot } from "../utils/fs.js";
import {
  validateFsdRules,
  validateImportRules,
  validatePackageRules,
  validateI18nRules,
  validateContractRules,
  validateRootRules,
  validateTsconfigBaseUrl,
  validateExpoTypescript,
} from "../validators/index.js";
import type { PackageFixCheck } from "../validators/package-rules.js";
import pc from "picocolors";

export interface ValidationResult {
  path: string;
  errors: string[];
  warnings: string[];
  passes: string[];
}

/**
 * The checks `--fix` can repair, each touching only the files its own check reads: `exports`
 * (package entry `source` and `types`), `dependencies` (React as a peer, `"type": "module"`),
 * `tsup` (no `dts`), `i18n` (catalogue keys), `fsd` (layer folders), `root` (turbo.json, root
 * scripts, the TypeScript catalog pin), `tsconfig` (`baseUrl`) and `expo` (an Expo app's TypeScript).
 */
export const FIX_CHECKS = ["exports", "dependencies", "tsup", "i18n", "fsd", "root", "tsconfig", "expo"] as const;
export type FixCheck = (typeof FIX_CHECKS)[number];

/**
 * The checks a `--fix` value names. A bare `--fix` repairs package exports only, since that is
 * the fix the scaffolders ask for; anything that rewrites versions, scripts, tsconfig or
 * catalogues is repaired only when named (`--fix root,tsconfig`), or with `--fix all`.
 *
 * @throws {Error} naming the unknown check and the known ones
 */
export function parseFixChecks(value: boolean | string | undefined): ReadonlySet<FixCheck> {
  if (value === undefined || value === false) return new Set();
  if (value === true) return new Set(["exports"]);
  const names = value.split(",").map((one) => one.trim()).filter((one) => one.length > 0);
  if (names.includes("all")) return new Set(FIX_CHECKS);
  const unknown = names.filter((one) => !(FIX_CHECKS as readonly string[]).includes(one));
  if (unknown.length > 0) throw new Error(`Unknown --fix check ${unknown.join(", ")}; known: ${FIX_CHECKS.join(", ")}, all`);
  return new Set(names as FixCheck[]);
}

export const validateCommand = new Command("validate")
  .description("Validate project structure, FSD rules, imports, and i18n")
  .option("--fix [checks]", `Auto-fix the named checks (comma separated: ${FIX_CHECKS.join(", ")}, all); bare --fix repairs exports only`)
  .action(reportConfigError(async (flags: { fix?: boolean | string }) => {
    const rootDir = await findProjectRoot(process.cwd());
    let checks: ReadonlySet<FixCheck>;
    try {
      checks = parseFixChecks(flags.fix);
    } catch (err) {
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
    const fix = (check: FixCheck) => ({ fix: checks.has(check) });
    const packageFix = { fix: checks.size > 0, checks: checks as ReadonlySet<PackageFixCheck> };

    if (!(await pathExists(join(rootDir, "package.json")))) {
      log.error("No package.json found. Run from a simplix project root.");
      process.exit(1);
    }

    console.log("");
    console.log(pc.bold("simplix validate"));
    console.log("");

    const results: ValidationResult[] = [];

    // Discover packages, modules, and apps
    const packagesDir = join(rootDir, "packages");
    const modulesDir = join(rootDir, "modules");
    const appsDir = join(rootDir, "apps");

    const packages = await discoverDirs(packagesDir);
    const groups = (await loadConfig(rootDir)).modules?.groups ?? [];
    const modules = (await findModulePaths(rootDir, groups)).map((path) => join(modulesDir, ...path.split("/")));
    const apps = await discoverDirs(appsDir);

    // Validate the workspace root (turbo.json, scripts, catalog, tsconfig)
    const rootResult: ValidationResult = {
      path: ".",
      errors: [],
      warnings: [],
      passes: [],
    };
    await validateRootRules(rootDir, rootResult, fix("root"));
    await validateTsconfigBaseUrl(rootDir, rootResult, fix("tsconfig"));
    results.push(rootResult);

    // Validate each package
    for (const pkg of packages) {
      const result: ValidationResult = {
        path: relative(rootDir, pkg),
        errors: [],
        warnings: [],
        passes: [],
      };

      await validatePackageRules(pkg, result, packageFix);
      await validateContractRules(pkg, result);
      await validateTsconfigBaseUrl(pkg, result, fix("tsconfig"));
      results.push(result);
    }

    // Validate each module (FSD + imports + i18n)
    for (const mod of modules) {
      const result: ValidationResult = {
        path: relative(rootDir, mod),
        errors: [],
        warnings: [],
        passes: [],
      };

      await validateFsdRules(mod, result, fix("fsd"));
      await validateImportRules(mod, result, rootDir);
      await validateI18nRules(mod, result, fix("i18n"));
      await validatePackageRules(mod, result, packageFix);
      await validateTsconfigBaseUrl(mod, result, fix("tsconfig"));
      results.push(result);
    }

    // Validate each app (FSD layer rules apply to apps too)
    for (const app of apps) {
      const result: ValidationResult = {
        path: relative(rootDir, app),
        errors: [],
        warnings: [],
        passes: [],
      };

      await validateFsdRules(app, result, { ...fix("fsd"), type: "app" });
      await validateImportRules(app, result, rootDir);
      await validateTsconfigBaseUrl(app, result, fix("tsconfig"));
      await validateExpoTypescript(app, result, fix("expo"));
      results.push(result);
    }

    // Print results
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalPasses = 0;

    for (const result of results) {
      console.log(pc.bold(`  ${result.path}`));

      for (const pass of result.passes) {
        console.log(pc.green(`    ${pc.green("✔")} ${pass}`));
      }
      for (const warning of result.warnings) {
        console.log(pc.yellow(`    ${pc.yellow("⚠")} ${warning}`));
      }
      for (const error of result.errors) {
        console.log(pc.red(`    ${pc.red("✖")} ${error}`));
      }
      console.log("");

      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
      totalPasses += result.passes.length;
    }

    // Summary
    const summary = [
      `${totalErrors} error${totalErrors !== 1 ? "s" : ""}`,
      `${totalWarnings} warning${totalWarnings !== 1 ? "s" : ""}`,
      `${totalPasses} check${totalPasses !== 1 ? "s" : ""} passed`,
    ].join(", ");

    console.log(
      pc.bold(
        `  Summary: ${totalErrors > 0 ? pc.red(summary) : pc.green(summary)}`,
      ),
    );
    console.log("");

    if (totalErrors > 0) {
      process.exit(1);
    }
  }));

async function discoverDirs(parentDir: string): Promise<string[]> {
  if (!(await pathExists(parentDir))) return [];

  const entries = await readdir(parentDir, { withFileTypes: true });
  const dirs: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      const pkgJsonPath = join(parentDir, entry.name, "package.json");
      if (await pathExists(pkgJsonPath)) {
        dirs.push(join(parentDir, entry.name));
      }
    }
  }

  return dirs;
}
