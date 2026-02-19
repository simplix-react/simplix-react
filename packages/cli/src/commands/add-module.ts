import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import { join, resolve } from "node:path";
import { writeFileWithDir, pathExists, readJsonFile } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { toPascalCase } from "../utils/case.js";
import { renderTemplate } from "../utils/template.js";
import { loadConfig } from "../config/config-loader.js";
import { withVersions } from "../versions.js";
import {
  moduleEslintConfig,
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

export const addModuleCommand = new Command("add-module")
  .description("Add a new FSD module")
  .argument("<name>", "Module name (e.g., editor, maps, monitoring)")
  .option("--no-i18n", "Skip i18n locales setup")
  .option("-y, --yes", "Accept all defaults (non-interactive)")
  .action(async (name: string, flags: Record<string, unknown>) => {
    const rootDir = resolve(process.cwd());
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

    const modulePkgName = `${scope}/${baseName}-${name}`;
    const dirName = `${baseName}-${name}`;
    const targetDir = join(rootDir, "modules", dirName);

    if (await pathExists(targetDir)) {
      log.error(`Module "${dirName}" already exists.`);
      process.exit(1);
    }

    const spinner = ora(`Creating module: ${modulePkgName}`).start();

    try {
      const ctx = withVersions({
        moduleName: name,
        modulePkgName,
        projectName: baseName,
        scope,
        enableI18n,
        locales,
        PascalName: toPascalCase(name),
        namespace: `${baseName}-${name}`,
      });

      const files: Record<string, string> = {
        "package.json": renderTemplate(modulePackageJson, ctx),
        "eslint.config.js": moduleEslintConfig,
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
  });
