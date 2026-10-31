import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import { join } from "node:path";
import { writeFileWithDir, pathExists, readJsonFile, findProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { toPascalCase } from "../utils/case.js";
import { renderTemplate } from "../utils/template.js";
import { loadConfig } from "../config/config-loader.js";
import { reportConfigError } from "../config/report-config-error.js";
import { withVersions } from "../versions.js";
import { ModulePathError, parseModulePath, type ModulePath } from "../utils/module-path.js";
import {
  modulePackageJson,
  moduleTsupConfig,
  moduleTsconfigJson,
  moduleIndexTs,
  moduleManifestTs,
  moduleFeaturesIndexTs,
  moduleWidgetsIndexTs,
  moduleSharedLibGitkeep,
  moduleSharedUiGitkeep,
  moduleSharedConfigGitkeep,
  moduleLocalesIndexTs,
} from "../templates/module/index.js";

interface ModuleDependency {
  name: string;
  range: string;
}

class ModuleDependencyError extends Error {}

/** An npm package name, scoped or not; nothing that would break out of the JSON string it is written into. */
const PACKAGE_NAME = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/;

/**
 * The configured `modules.dependencies` as the sorted rows the `package.json` template writes.
 * A name or range that is not a plain string is refused before any file is written, because a
 * module whose manifest does not parse stops every install in the workspace.
 */
function moduleDependenciesOf(configured: Readonly<Record<string, string>> | undefined): ModuleDependency[] {
  const rows: ModuleDependency[] = [];
  for (const [name, range] of Object.entries(configured ?? {})) {
    if (!PACKAGE_NAME.test(name)) {
      throw new ModuleDependencyError(`modules.dependencies: "${name}" is not a package name.`);
    }
    if (typeof range !== "string" || range.trim() === "" || /["\\\s]/.test(range)) {
      throw new ModuleDependencyError(
        `modules.dependencies: "${name}" needs a version range written as a plain string (for example "workspace:*").`,
      );
    }
    rows.push({ name, range });
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export const addModuleCommand = new Command("add-module")
  .description("Add a new FSD module")
  .argument("<name>", "Module name (e.g., editor, maps, monitoring)")
  .option("--no-i18n", "Skip i18n locales setup")
  .option("-y, --yes", "Accept all defaults (non-interactive)")
  .action(reportConfigError(async (name: string, flags: Record<string, unknown>) => {
    const rootDir = await findProjectRoot(process.cwd());
    const rootPkg = await readJsonFile<{ name: string }>(
      join(rootDir, "package.json"),
    ).catch(() => null);

    if (!rootPkg) {
      log.error(
        "No package.json found. Run this command from a simplix project root.",
      );
      process.exit(1);
    }

    const pkgName = rootPkg.name;
    const scopeMatch = pkgName.match(/^(@[^/]+)\//);
    const scope = scopeMatch ? scopeMatch[1] : "";
    const baseName = pkgName
      .replace(/^@[^/]+\//, "")
      .replace(/-monorepo$/, "");

    let enableI18n: boolean;
    if (flags.yes || flags.i18n === false) {
      enableI18n = flags.i18n !== false;
    } else {
      const response = await prompts([
        {
          type: "confirm",
          name: "enableI18n",
          message: "Enable i18n for this module?",
          initial: true,
        },
      ]);
      enableI18n = response.enableI18n ?? true;
    }

    // Load config for i18n locales
    const config = await loadConfig(rootDir);
    const locales = config.i18n?.locales ?? ["en", "ko", "ja"];
    const prefix = config.packages?.prefix ?? baseName;

    // A grouped name (`admin/user`) lands in `modules/admin/user`, and its package name and i18n
    // namespace carry the group (`admin-user`) so two groups may each hold a module of one name.
    let module: ModulePath;
    try {
      module = parseModulePath(name, config.modules?.groups);
    } catch (error) {
      if (!(error instanceof ModulePathError)) throw error;
      log.error(error.message);
      process.exit(1);
    }
    let moduleDependencies: ModuleDependency[];
    try {
      moduleDependencies = moduleDependenciesOf(config.modules?.dependencies);
    } catch (error) {
      if (!(error instanceof ModuleDependencyError)) throw error;
      log.error(error.message);
      process.exit(1);
    }
    const leafName = prefix ? `${prefix}-${module.leaf}` : module.leaf;
    const dirName = module.group ? `${module.group}/${leafName}` : leafName;
    const baseModuleName = module.group ? `${module.group}-${module.leaf}` : module.leaf;
    const qualifiedName = prefix ? `${prefix}-${baseModuleName}` : baseModuleName;
    const modulePkgName = scope ? `${scope}/${qualifiedName}` : qualifiedName;
    const targetDir = join(rootDir, "modules", ...dirName.split("/"));

    if (await pathExists(targetDir)) {
      log.error(`Module "${dirName}" already exists.`);
      process.exit(1);
    }

    const spinner = ora(`Creating module: ${modulePkgName}`).start();

    try {
      const ctx = withVersions({
        moduleName: baseModuleName,
        modulePkgName,
        projectName: baseName,
        scope,
        enableI18n,
        locales,
        PascalName: toPascalCase(baseModuleName),
        namespace: qualifiedName,
        rootRelative: dirName.split("/").map(() => "..").concat("..").join("/"),
        moduleDependencies,
      });

      const files: Record<string, string> = {
        "package.json": renderTemplate(modulePackageJson, ctx),
        "tsup.config.ts": renderTemplate(moduleTsupConfig, ctx),
        "tsconfig.json": renderTemplate(moduleTsconfigJson, ctx),
        "src/index.ts": renderTemplate(moduleIndexTs, ctx),
        "src/manifest.ts": renderTemplate(moduleManifestTs, ctx),
        "src/features/index.ts": moduleFeaturesIndexTs,
        "src/widgets/index.ts": moduleWidgetsIndexTs,
        "src/shared/lib/.gitkeep": moduleSharedLibGitkeep,
        "src/shared/ui/.gitkeep": moduleSharedUiGitkeep,
        "src/shared/config/.gitkeep": moduleSharedConfigGitkeep,
      };

      if (enableI18n) {
        files["src/locales/index.ts"] = renderTemplate(
          moduleLocalesIndexTs,
          ctx,
        );
        const emptyJson = "{}\n";
        for (const locale of locales) {
          files[`src/locales/features/${locale}.json`] = emptyJson;
          files[`src/locales/widgets/${locale}.json`] = emptyJson;
        }
      }

      for (const [relativePath, content] of Object.entries(files)) {
        await writeFileWithDir(join(targetDir, relativePath), content);
      }

      spinner.succeed(`Module created: ${modulePkgName}`);
      log.info("");
      log.step(`Location: modules/${dirName}/`);
      log.step(`FSD layers: features/ widgets/ shared/`);
      if (enableI18n) {
        log.step(`i18n: locales/ with ${locales.join(", ")}`);
      }
      log.info("");
      log.info("Next steps:");
      log.step("pnpm install");
      log.step("pnpm build");
      log.step(
        `Add "${modulePkgName}": "workspace:*" to your app's dependencies`,
      );
    } catch (err) {
      spinner.fail("Failed to create module");
      log.error(String(err));
      process.exit(1);
    }
  }));
