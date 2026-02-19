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
  domainEslintConfig,
  domainPackageJson,
  domainTsupConfig,
  domainTsconfigJson,
  domainIndexTs,
  domainContractTs,
  domainHooksTs,
  domainMockIndexTs,
  domainMockHandlersTs,
  domainMockSeedTs,
  domainTranslationsTs,
} from "../templates/domain/index.js";

export const addDomainCommand = new Command("add-domain")
  .description("Add a new domain package")
  .argument("<name>", "Domain name (e.g., inventory, topology)")
  .option("-e, --entities <entities>", "Comma-separated entity names", "")
  .option("--no-i18n", "Skip i18n translations setup")
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

    // Extract project name and scope from root package.json
    const pkgName = rootPkg.name; // e.g., "@myapp/myapp-monorepo"
    const scopeMatch = pkgName.match(/^(@[^/]+)\//);
    const scope = scopeMatch ? scopeMatch[1] : "";

    // Extract base project name
    const baseName = pkgName
      .replace(/^@[^/]+\//, "")
      .replace(/-monorepo$/, "");

    let entitiesInput: string;
    if (flags.entities || flags.yes) {
      entitiesInput = (flags.entities as string) || name;
    } else {
      const response = await prompts([
        {
          type: "text",
          name: "entities",
          message: "Entity names (comma-separated, e.g., product,category):",
          initial: name,
        },
      ]);
      entitiesInput = response.entities || name;
    }

    const entities = entitiesInput
      .split(",")
      .map((e: string) => e.trim())
      .filter(Boolean);

    let enableI18n: boolean;
    if (flags.yes || flags.i18n === false) {
      enableI18n = flags.i18n !== false;
    } else {
      const response = await prompts([
        {
          type: "confirm",
          name: "enableI18n",
          message: "Enable i18n for this domain?",
          initial: true,
        },
      ]);
      enableI18n = response.enableI18n ?? true;
    }

    // Load config
    const config = await loadConfig(rootDir);
    const apiBaseUrl = config.api?.baseUrl ?? "/api";
    const locales = config.i18n?.locales ?? ["en", "ko", "ja"];

    const domainPkgName = `${scope}/${baseName}-domain-${name}`;
    const dirName = `${baseName}-domain-${name}`;
    const targetDir = join(rootDir, "packages", dirName);

    if (await pathExists(targetDir)) {
      log.error(`Domain package "${dirName}" already exists.`);
      process.exit(1);
    }

    const spinner = ora(`Creating domain package: ${domainPkgName}`).start();

    try {
      const ctx = withVersions({
        domainName: name,
        domainPkgName,
        projectName: baseName,
        scope,
        enableI18n,
        locales,
        apiBasePath: `${apiBaseUrl}/${name}`,
        entities: entities.map((e: string) => ({
          entityName: e,
          EntityPascal: toPascalCase(e),
        })),
        PascalName: toPascalCase(name),
      });

      const files: Record<string, string> = {
        "package.json": renderTemplate(domainPackageJson, ctx),
        "eslint.config.js": domainEslintConfig,
        "tsup.config.ts": domainTsupConfig,
        "tsconfig.json": renderTemplate(domainTsconfigJson, ctx),
        "src/index.ts": renderTemplate(domainIndexTs, ctx),
        "src/contract.ts": renderTemplate(domainContractTs, ctx),
        "src/hooks.ts": renderTemplate(domainHooksTs, ctx),
        "src/mock/index.ts": renderTemplate(domainMockIndexTs, ctx),
        "src/mock/handlers.ts": renderTemplate(domainMockHandlersTs, ctx),
        "src/mock/seed.ts": renderTemplate(domainMockSeedTs, ctx),
      };

      if (enableI18n) {
        files["src/translations.ts"] = renderTemplate(
          domainTranslationsTs,
          ctx,
        );
        const emptyJson = "{}\n";
        for (const locale of locales) {
          files[`src/locales/${locale}.json`] = emptyJson;
        }
      }

      for (const [relativePath, content] of Object.entries(files)) {
        await writeFileWithDir(join(targetDir, relativePath), content);
      }

      spinner.succeed(`Domain package created: ${domainPkgName}`);
      log.info("");
      log.step(`Location: packages/${dirName}/`);
      log.step(`Entities: ${entities.join(", ")}`);
      if (enableI18n) {
        log.step(`i18n: locales/ with ${locales.join(", ")}`);
      }
      log.info("");
      log.info("Next steps:");
      log.step("pnpm install");
      log.step("pnpm build");
      log.step(
        `Add "${domainPkgName}": "workspace:*" to your app's dependencies`,
      );
    } catch (err) {
      spinner.fail("Failed to create domain package");
      log.error(String(err));
      process.exit(1);
    }
  });
