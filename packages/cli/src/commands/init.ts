import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import { join, resolve } from "node:path";
import { writeFileWithDir, pathExists } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { renderTemplate } from "../utils/template.js";
import {
  rootPackageJson,
  pnpmWorkspaceYaml,
  turboJson,
  rootTsconfigJson,
  npmrc,
  gitignore,
} from "../templates/project/root-files.js";
import { withVersions } from "../versions.js";
import {
  appEslintConfig,
  appPackageJson,
  appTsconfigJson,
  viteConfig,
  indexHtml,
  indexCss,
  mainTsx,
  appIndexTsx,
  appProvidersTsx,
  errorFallbacksTsx,
  pageLoadingFallbackTsx,
  appFeaturesIndexTs,
  appWidgetsIndexTs,
} from "../templates/project/app-files.js";
import {
  i18nConfigTs,
  i18nConstantsTs,
  getCommonTranslationJson,
} from "../templates/project/i18n-files.js";
import { accessConfigTs } from "../templates/project/access-files.js";

export interface InitOptions {
  name: string;
  scope: string;
  includeDemo: boolean;
  enableI18n: boolean;
  enableAuth: boolean;
  enableAccess: boolean;
  locales: string[];
}

const simplixConfigTs = `import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  // ── API ────────────────────────────────────────────────────
  api: {
    /** API base path — used for basePath in code generation */
    baseUrl: "/api",
  },

  // ── Packages ───────────────────────────────────────────────
  // packages: {
  //   /** Short prefix for generated package names (default: derived from root package.json name) */
  //   prefix: "{{projectName}}",
  // },

  // ── HTTP Environments ──────────────────────────────────────
  http: {
    /** .http file environment settings */
    environments: {
      development: { baseUrl: "http://localhost:3000" },
      // staging: { baseUrl: "https://staging.example.com" },
      // production: { baseUrl: "https://api.example.com" },
    },
  },

{{#if enableI18n}}
  // ── i18n ─────────────────────────────────────────────────────
  i18n: {
    /** Supported locale codes */
    locales: {{{json locales}}},
    /** Default locale */
    defaultLocale: "{{defaultLocale}}",
  },

{{/if}}
  // ── Code Generation ────────────────────────────────────────
  codegen: {
    /** Prepend auto-generated header comment to generated files */
    header: true,
  },

  // ── OpenAPI ────────────────────────────────────────────────
  // openapi: {
  //   /** Tag-based domain splitting: domainName → tagPatterns (exact string or /regex/) */
  //   domains: {
  //     // example: ["example-tag", "/regex-pattern/"],
  //   },
  // },
});
`;

export const initCommand = new Command("init")
  .description("Initialize a new simplix-react project")
  .argument("<project-name>", "Name of the project to create")
  .option("-s, --scope <scope>", "npm scope for packages", "")
  .option("--no-demo", "Skip demo app creation")
  .option("--no-i18n", "Skip i18n setup")
  .option("--no-auth", "Skip auth setup")
  .option("--no-access", "Skip access control setup")
  .option("-y, --yes", "Accept all defaults (non-interactive)")
  .action(async (projectName: string, flags: Record<string, unknown>) => {
    const targetDir = resolve(process.cwd(), projectName);

    if (await pathExists(targetDir)) {
      log.error(`Directory "${projectName}" already exists.`);
      process.exit(1);
    }

    let options: InitOptions;

    if (flags.yes) {
      // Non-interactive mode: use defaults
      options = {
        name: projectName,
        scope: (flags.scope as string) || `@${projectName}`,
        includeDemo: flags.demo !== false,
        enableI18n: flags.i18n !== false,
        enableAuth: flags.auth !== false,
        enableAccess: flags.access !== false,
        locales: ["en", "ko", "ja"],
      };
    } else {
      // Interactive prompts
      const response = await prompts([
        {
          type: flags.scope ? null : "text",
          name: "scope",
          message: "npm scope for packages (e.g., @mycompany):",
          initial: `@${projectName}`,
        },
        {
          type: "confirm",
          name: "includeDemo",
          message: "Include demo app?",
          initial: flags.demo !== false,
        },
        {
          type: "confirm",
          name: "enableI18n",
          message: "Enable i18n (internationalization)?",
          initial: flags.i18n !== false,
        },
        {
          type: "confirm",
          name: "enableAuth",
          message: "Enable auth (authentication)?",
          initial: flags.auth !== false,
        },
        {
          type: "confirm",
          name: "enableAccess",
          message: "Enable access control (authorization)?",
          initial: flags.access !== false,
        },
        {
          type: (_prev: unknown, values: Record<string, unknown>) =>
            values.enableI18n ? "multiselect" : null,
          name: "locales",
          message: "Select locales:",
          choices: [
            { title: "English (en)", value: "en", selected: true },
            { title: "Korean (ko)", value: "ko", selected: true },
            { title: "Japanese (ja)", value: "ja", selected: true },
          ],
          min: 1,
        },
      ]);

      options = {
        name: projectName,
        scope: (flags.scope as string) || response.scope || `@${projectName}`,
        includeDemo: response.includeDemo ?? true,
        enableI18n: response.enableI18n ?? true,
        enableAuth: response.enableAuth ?? true,
        enableAccess: response.enableAccess ?? true,
        locales: response.locales ?? ["en", "ko", "ja"],
      };
    }

    // Ensure scope starts with @
    if (!options.scope.startsWith("@")) {
      options.scope = `@${options.scope}`;
    }

    const spinner = ora("Creating project...").start();

    try {
      const ctx = withVersions({
        projectName: options.name,
        scope: options.scope,
        includeDemo: options.includeDemo,
        enableI18n: options.enableI18n,
        enableAuth: options.enableAuth,
        enableAccess: options.enableAccess,
        locales: options.locales,
        defaultLocale: options.locales[0] || "en",
      });

      // 1. Root files + simplix.config.ts
      spinner.text = "Creating root configuration...";
      await writeFiles(targetDir, {
        "package.json": renderTemplate(rootPackageJson, ctx),
        "pnpm-workspace.yaml": renderTemplate(pnpmWorkspaceYaml, ctx),
        "turbo.json": renderTemplate(turboJson, ctx),
        "tsconfig.json": renderTemplate(rootTsconfigJson, ctx),
        ".npmrc": npmrc,
        ".gitignore": gitignore,
        "simplix.config.ts": renderTemplate(simplixConfigTs, ctx),
      });

      // 2. Config packages (symlinked from @simplix)
      spinner.text = "Creating config packages...";
      await writeFiles(targetDir, {
        "config/typescript/base.json": JSON.stringify(
          {
            $schema: "https://json.schemastore.org/tsconfig",
            compilerOptions: {
              target: "ES2022",
              module: "ESNext",
              moduleResolution: "bundler",
              esModuleInterop: true,
              strict: true,
              skipLibCheck: true,
              declaration: true,
              declarationMap: true,
              sourceMap: true,
              isolatedModules: true,
              verbatimModuleSyntax: true,
              resolveJsonModule: true,
              forceConsistentCasingInFileNames: true,
              noEmit: true,
              lib: ["ES2022"],
            },
            exclude: ["node_modules", "dist"],
          },
          null,
          2,
        ),
        "config/typescript/react.json": JSON.stringify(
          {
            $schema: "https://json.schemastore.org/tsconfig",
            extends: "./base.json",
            compilerOptions: {
              jsx: "react-jsx",
              lib: ["ES2022", "DOM", "DOM.Iterable"],
            },
          },
          null,
          2,
        ),
      });

      // 3. Demo app (if requested)
      if (options.includeDemo) {
        spinner.text = "Creating demo app...";
        const appCtx = {
          ...ctx,
          appPkgName: `${ctx.scope}/${ctx.projectName}-demo`,
        };
        await writeFiles(targetDir, {
          [`apps/${ctx.projectName}-demo/package.json`]: renderTemplate(
            appPackageJson,
            appCtx,
          ),
          [`apps/${ctx.projectName}-demo/eslint.config.js`]: appEslintConfig,
          [`apps/${ctx.projectName}-demo/tsconfig.json`]: renderTemplate(
            appTsconfigJson,
            appCtx,
          ),
          [`apps/${ctx.projectName}-demo/vite.config.ts`]: viteConfig,
          [`apps/${ctx.projectName}-demo/index.html`]: renderTemplate(
            indexHtml,
            appCtx,
          ),
          [`apps/${ctx.projectName}-demo/src/index.css`]: indexCss,
          [`apps/${ctx.projectName}-demo/src/main.tsx`]: renderTemplate(
            mainTsx,
            appCtx,
          ),
          [`apps/${ctx.projectName}-demo/src/app/index.tsx`]: renderTemplate(
            appIndexTsx,
            appCtx,
          ),
          [`apps/${ctx.projectName}-demo/src/app/providers/app-providers.tsx`]:
            renderTemplate(appProvidersTsx, appCtx),
          [`apps/${ctx.projectName}-demo/src/app/providers/index.ts`]:
            'export { AppProviders } from "./app-providers.js";\n',
          // FSD layers
          [`apps/${ctx.projectName}-demo/src/features/index.ts`]:
            appFeaturesIndexTs,
          [`apps/${ctx.projectName}-demo/src/widgets/index.ts`]:
            appWidgetsIndexTs,
          [`apps/${ctx.projectName}-demo/src/shared/ui/error-fallbacks.tsx`]:
            errorFallbacksTsx,
          [`apps/${ctx.projectName}-demo/src/shared/ui/page-loading-fallback.tsx`]:
            pageLoadingFallbackTsx,
          [`apps/${ctx.projectName}-demo/public/.gitkeep`]: "",
          [`apps/${ctx.projectName}-demo/src/shared/lib/.gitkeep`]: "",
          [`apps/${ctx.projectName}-demo/src/shared/config/.gitkeep`]: "",
          [`apps/${ctx.projectName}-demo/src/routes/__root.tsx`]: renderTemplate(
            `import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
});
`,
            appCtx,
          ),
          [`apps/${ctx.projectName}-demo/src/routes/index.tsx`]: renderTemplate(
            `import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div style=\\{{ padding: "2rem" }}>
      <h1>Welcome to {{projectName}}</h1>
      <p>Your simplix-react project is ready.</p>
    </div>
  );
}
`,
            appCtx,
          ),
        });

        // i18n files for app
        if (options.enableI18n) {
          spinner.text = "Creating i18n files...";
          const i18nCtx = { ...appCtx };
          const i18nFiles: Record<string, string> = {
            [`apps/${ctx.projectName}-demo/src/app/i18n/index.ts`]:
              renderTemplate(i18nConfigTs, i18nCtx),
            [`apps/${ctx.projectName}-demo/src/app/i18n/constants.ts`]:
              renderTemplate(i18nConstantsTs, i18nCtx),
          };
          for (const locale of options.locales) {
            i18nFiles[
              `apps/${ctx.projectName}-demo/src/locales/common/${locale}.json`
            ] = getCommonTranslationJson(locale);
          }
          await writeFiles(targetDir, i18nFiles);
        }

        // access files for app
        if (options.enableAccess) {
          spinner.text = "Creating access control files...";
          await writeFiles(targetDir, {
            [`apps/${ctx.projectName}-demo/src/app/access/index.ts`]:
              renderTemplate(accessConfigTs, appCtx),
          });
        }
      }

      // 4. Empty directories for FSD
      spinner.text = "Creating directory structure...";
      await writeFiles(targetDir, {
        "modules/.gitkeep": "",
      });

      spinner.succeed("Project created successfully!");

      log.info("");
      log.info(`  cd ${projectName}`);
      log.info("  pnpm install");
      log.info("  pnpm build");
      if (options.includeDemo) {
        log.info(`  pnpm dev`);
      }
      log.info("");
      log.info("Next steps:");
      log.step("simplix add-domain <name>  — Add a domain package");
      log.step("simplix add-module <name>  — Add an FSD module");
      log.step("simplix validate           — Validate project structure");
    } catch (err) {
      spinner.fail("Failed to create project");
      log.error(String(err));
      process.exit(1);
    }
  });

async function writeFiles(
  root: string,
  files: Record<string, string>,
): Promise<void> {
  for (const [relativePath, content] of Object.entries(files)) {
    await writeFileWithDir(join(root, relativePath), content);
  }
}
