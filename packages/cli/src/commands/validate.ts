import { Command } from "commander";
import { resolve, join, relative } from "node:path";
import { readdir } from "node:fs/promises";
import { log } from "../utils/logger.js";
import { pathExists, readJsonFile } from "../utils/fs.js";
import {
  validateFsdRules,
  validateImportRules,
  validatePackageRules,
  validateI18nRules,
  validateContractRules,
} from "../validators/index.js";
import pc from "picocolors";

export interface ValidationResult {
  path: string;
  errors: string[];
  warnings: string[];
  passes: string[];
}

export const validateCommand = new Command("validate")
  .description("Validate project structure, FSD rules, imports, and i18n")
  .option("--fix", "Auto-fix issues where possible", false)
  .action(async (flags: { fix: boolean }) => {
    const rootDir = resolve(process.cwd());

    if (!(await pathExists(join(rootDir, "package.json")))) {
      log.error("No package.json found. Run from a simplix project root.");
      process.exit(1);
    }

    console.log("");
    console.log(pc.bold("simplix validate"));
    console.log("");

    const results: ValidationResult[] = [];

    // Discover packages and modules
    const packagesDir = join(rootDir, "packages");
    const modulesDir = join(rootDir, "modules");

    const packages = await discoverDirs(packagesDir);
    const modules = await discoverDirs(modulesDir);

    // Validate each package
    for (const pkg of packages) {
      const result: ValidationResult = {
        path: relative(rootDir, pkg),
        errors: [],
        warnings: [],
        passes: [],
      };

      await validatePackageRules(pkg, result, { fix: flags.fix });
      await validateContractRules(pkg, result, { fix: flags.fix });
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

      await validateFsdRules(mod, result, { fix: flags.fix });
      await validateImportRules(mod, result, rootDir, { fix: flags.fix });
      await validateI18nRules(mod, result, { fix: flags.fix });
      await validatePackageRules(mod, result, { fix: flags.fix });
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
  });

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
