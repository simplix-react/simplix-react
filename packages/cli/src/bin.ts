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

// ── Load extension plugins ──
// Plugins register spec profiles and schema adapters needed for correct code generation.
// If a profile is declared in simplix.config but its plugin cannot be loaded, the openapi
// command will warn and exit rather than silently generating incorrect code.

const PLUGIN_MODULE = "@simplix-react-ext/simplix-boot-cli-plugin";

async function loadPlugin(): Promise<boolean> {
  // Resolve from the consumer project root (not from CLI package location).
  // pnpm link: packages live in the .pnpm store and are only resolvable
  // from the project that declares the dependency.
  const root = await findProjectRoot(process.cwd()).catch(() => process.cwd());
  const projectRequire = createRequire(join(root, "package.json"));

  // Try resolving the main entry, then fall back to dist/index.js
  for (const target of [PLUGIN_MODULE, `${PLUGIN_MODULE}/dist/index.js`]) {
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
    const pluginEntry = join(root, "node_modules", ...PLUGIN_MODULE.split("/"), "dist/index.js");
    if (await pathExists(pluginEntry)) {
      await import(pathToFileURL(pluginEntry).href);
      return true;
    }
  } catch {
    // continue
  }

  return false;
}

await loadPlugin();

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
