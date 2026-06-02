import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { initUiCommand } from "./commands/init-ui.js";
import { addDomainCommand } from "./commands/add-domain.js";
import { addModuleCommand } from "./commands/add-module.js";
import { validateCommand } from "./commands/validate.js";
import { i18nCodegenCommand } from "./commands/i18n-codegen.js";
import { openapiCommand } from "./commands/openapi.js";
import { scaffoldCrudCommand } from "./commands/scaffold-crud.js";
import { frameworkVersion } from "./versions.js";
import { findProjectRoot, pathExists } from "./utils/fs.js";
import { loadConfig } from "./config/config-loader.js";

// ── Load extension plugins ──
// Plugins register spec profiles and schema adapters needed for correct code generation.
// The core CLI is backend-agnostic: which plugins to load is declared by the project
// via the `plugins` field in simplix.config.ts — no extension name is hardcoded here.
// If a profile is declared but its plugin cannot be resolved, the openapi command warns
// and exits rather than silently generating incorrect code.

async function loadPluginModule(root: string, moduleId: string): Promise<boolean> {
  // Resolve from the consumer project root (not from CLI package location).
  // pnpm link: packages live in the .pnpm store and are only resolvable
  // from the project that declares the dependency.
  const projectRequire = createRequire(join(root, "package.json"));

  // Try resolving the main entry, then fall back to dist/index.js
  for (const target of [moduleId, `${moduleId}/dist/index.js`]) {
    try {
      const pluginPath = projectRequire.resolve(target);
      await import(pathToFileURL(pluginPath).href);
      return true;
    } catch {
      // continue
    }
  }

  // Fallback: direct path lookup
  try {
    const pluginEntry = join(root, "node_modules", ...moduleId.split("/"), "dist/index.js");
    if (await pathExists(pluginEntry)) {
      await import(pathToFileURL(pluginEntry).href);
      return true;
    }
  } catch {
    // continue
  }

  return false;
}

async function loadConfiguredPlugins(): Promise<void> {
  const root = await findProjectRoot(process.cwd()).catch(() => process.cwd());
  const config = await loadConfig(root);
  for (const moduleId of config.plugins ?? []) {
    await loadPluginModule(root, moduleId);
  }
}

await loadConfiguredPlugins();

const program = new Command();

program
  .name("simplix")
  .description("CLI for scaffolding and validating simplix-react projects")
  .version(frameworkVersion("@simplix-react/cli"));

program.addCommand(initCommand);
program.addCommand(addDomainCommand);
program.addCommand(addModuleCommand);
program.addCommand(validateCommand);
program.addCommand(i18nCodegenCommand);
program.addCommand(openapiCommand);
program.addCommand(initUiCommand);
program.addCommand(scaffoldCrudCommand);

program.parse();
