import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import { join, resolve } from "node:path";
import { writeFileWithDir, pathExists, readJsonFile } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { renderTemplate } from "../utils/template.js";
import { withVersions } from "../versions.js";
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
  moduleLocaleEnJson,
  moduleLocaleKoJson,
  moduleLocaleJaJson,
} from "../templates/module/module-files.js";

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
    if (flags.yes) {
      enableI18n = flags.i18n !== false;
    } else {
      const response = await prompts([
        {
          type: flags.i18n !== false ? null : "confirm",
          name: "enableI18n",
          message: "Enable i18n for this module?",
          initial: true,
        },
      ]);
      enableI18n = response.enableI18n ?? flags.i18n !== false;
    }

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
        PascalName: name.charAt(0).toUpperCase() + name.slice(1),
        namespace: `${baseName}-${name}`,
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
        files["src/locales/widgets/.gitkeep"] = "";
        files["src/locales/features/.gitkeep"] = "";
        // Default locale files
        files["src/locales/en.json"] = moduleLocaleEnJson;
        files["src/locales/ko.json"] = moduleLocaleKoJson;
        files["src/locales/ja.json"] = moduleLocaleJaJson;
      }

      for (const [relativePath, content] of Object.entries(files)) {
        await writeFileWithDir(join(targetDir, relativePath), content);
      }

      spinner.succeed(`Module created: ${modulePkgName}`);
      log.info("");
      log.step(`Location: modules/${dirName}/`);
      log.step(`FSD layers: features/ widgets/ shared/`);
      if (enableI18n) {
        log.step("i18n: locales/ with en, ko, ja");
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
