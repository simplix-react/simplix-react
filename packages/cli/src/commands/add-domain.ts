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
import { isSpecUrl } from "../openapi/pipeline/parser.js";
import { findSpecForDomain } from "../config/types.js";
import {
  generateDomainMutatorContent,
} from "../openapi/orchestration/orval-runner.js";
import { getSpecProfile } from "../openapi/plugin-registry.js";
import {
  domainEslintConfig,
  domainPackageJson,
  domainTsupConfig,
  domainTsconfigJson,
  domainIndexTs,
  domainSchemasTs,
  domainContractTs,
  domainHooksTs,
  domainMockIndexTs,
  domainMockHandlersTs,
  domainMockSeedTs,
  domainTranslationsTs,
} from "../templates/domain/index.js";

export const addDomainCommand = new Command("add-domain")
  .description("Add a new domain package (skeleton only)")
  .argument("<name>", "Domain name (e.g., inventory, topology)")
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
    const pkgName = rootPkg.name;
    const scopeMatch = pkgName.match(/^(@[^/]+)\//);
    const scope = scopeMatch ? scopeMatch[1] : "";
    const baseName = pkgName
      .replace(/^@[^/]+\//, "")
      .replace(/-monorepo$/, "");

    // Load config
    const config = await loadConfig(rootDir);
    const apiBaseUrl = config.api?.baseUrl ?? "/api";
    const locales = config.i18n?.locales ?? ["en", "ko", "ja"];
    const prefix = config.packages?.prefix ?? baseName;

    const dirName = prefix ? `${prefix}-domain-${name}` : `domain-${name}`;
    const domainPkgName = scope ? `${scope}/${dirName}` : dirName;
    const targetDir = join(rootDir, "packages", dirName);

    // Detect OpenAPI configuration
    const specConfig = findSpecForDomain(config.openapi, name);
    const openapiSpec = specConfig?.spec;
    const domainTags = specConfig?.domains[name];
    let useOrval = !!(openapiSpec && domainTags);

    if (useOrval && !isSpecUrl(openapiSpec!)) {
      const absSpecPath = resolve(rootDir, openapiSpec!);
      if (!(await pathExists(absSpecPath))) {
        log.warn(
          `OpenAPI spec not found: ${openapiSpec} — skipping OpenAPI generation.`,
        );
        useOrval = false;
      }
    }

    // If package already exists, reject — updates go through `simplix openapi`
    if (await pathExists(targetDir)) {
      log.error(`Domain package "${dirName}" already exists.`);
      if (useOrval) {
        log.step(`To regenerate code: simplix openapi ${openapiSpec}`);
      }
      process.exit(1);
    }

    // Prompt for entities only in non-OpenAPI mode
    let entities: Array<{ entityName: string; EntityPascal: string }> = [];
    if (!useOrval) {
      let entitiesInput: string;
      if (flags.yes) {
        entitiesInput = name;
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

      entities = entitiesInput
        .split(",")
        .map((e: string) => e.trim())
        .filter(Boolean)
        .map((e: string) => ({
          entityName: e,
          EntityPascal: toPascalCase(e),
        }));
    }

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

    const spinner = ora(`Creating domain package: ${domainPkgName}`).start();

    try {
      const ctx = withVersions({
        domainName: name,
        domainPkgName,
        projectName: baseName,
        scope,
        enableI18n,
        enableOrval: useOrval,
        locales,
        apiBasePath: `${apiBaseUrl}/${name}`,
        entities,
        PascalName: toPascalCase(name),
      });

      // Scaffolding files (common to both modes)
      const files: Record<string, string> = {
        "package.json": renderTemplate(domainPackageJson, ctx),
        "eslint.config.js": domainEslintConfig,
        "tsup.config.ts": domainTsupConfig,
        "tsconfig.json": renderTemplate(domainTsconfigJson, ctx),
        "src/index.ts": renderTemplate(domainIndexTs, ctx),
      };

      if (useOrval) {
        // OpenAPI mode: skeleton with mutator + orval config
        files["src/mutator.ts"] = generateDomainMutatorContent(name);

        // Inject OpenAPI-specific dependencies + codegen script
        const pkgJson = JSON.parse(files["package.json"]);
        if (!pkgJson.dependencies) pkgJson.dependencies = {};
        pkgJson.dependencies["@simplix-react/api"] = "workspace:*";
        pkgJson.devDependencies["orval"] = "^8.4.1";
        pkgJson.devDependencies["@faker-js/faker"] = "^9.0.0";
        pkgJson.scripts["codegen"] = `simplix openapi ${openapiSpec}`;

        // Add profile-specific dependencies (data-driven from SpecProfile)
        if (specConfig?.profile) {
          const profile = getSpecProfile(specConfig.profile);
          if (profile?.dependencies) {
            Object.assign(pkgJson.dependencies, profile.dependencies);
          }
        }

        files["package.json"] = JSON.stringify(pkgJson, null, 2) + "\n";
      } else {
        // Non-OpenAPI mode: template-based generation
        files["src/schemas.ts"] = renderTemplate(domainSchemasTs, ctx);
        files["src/contract.ts"] = renderTemplate(domainContractTs, ctx);
        files["src/hooks.ts"] = renderTemplate(domainHooksTs, ctx);
        files["src/mock/index.ts"] = renderTemplate(domainMockIndexTs, ctx);
        files["src/mock/handlers.ts"] = renderTemplate(
          domainMockHandlersTs,
          ctx,
        );
        files["src/mock/seed.ts"] = renderTemplate(domainMockSeedTs, ctx);

        // Inject non-OpenAPI-specific dependencies
        const pkgJson = JSON.parse(files["package.json"]);
        if (!pkgJson.dependencies) pkgJson.dependencies = {};
        pkgJson.dependencies["@simplix-react/contract"] = "workspace:*";
        pkgJson.dependencies["@simplix-react/react"] = "workspace:*";
        files["package.json"] = JSON.stringify(pkgJson, null, 2) + "\n";
      }

      // i18n files (common to both modes)
      if (enableI18n) {
        files["src/translations.ts"] = renderTemplate(
          domainTranslationsTs,
          ctx,
        );
        for (const locale of locales) {
          files[`src/locales/${locale}.json`] = "{}\n";
        }

        // Add @simplix-react/i18n dependency
        const pkgJson = JSON.parse(files["package.json"]);
        if (!pkgJson.dependencies) pkgJson.dependencies = {};
        pkgJson.dependencies["@simplix-react/i18n"] = "workspace:*";
        files["package.json"] = JSON.stringify(pkgJson, null, 2) + "\n";
      }

      // Write all files
      for (const [relativePath, content] of Object.entries(files)) {
        await writeFileWithDir(join(targetDir, relativePath), content);
      }

      spinner.succeed(`Domain package created: ${domainPkgName}`);
      log.info("");
      log.step(`Location: packages/${dirName}/`);
      if (!useOrval) {
        log.step(
          `Entities: ${entities.map((e) => e.entityName).join(", ")}`,
        );
      }
      if (enableI18n) {
        log.step(`i18n: locales/ with ${locales.join(", ")}`);
      }
      log.info("");
      log.info("Next steps:");
      log.step("pnpm install");
      if (useOrval) {
        log.step(`simplix openapi ${openapiSpec}    ← Orval code generation`);
      } else {
        log.step("pnpm build");
        log.step(
          `Add "${domainPkgName}": "workspace:*" to your app's dependencies`,
        );
      }
    } catch (err) {
      spinner.fail("Failed to create domain package");
      log.error(String(err));
      process.exit(1);
    }
  });
