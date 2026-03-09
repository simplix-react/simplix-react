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

// Load extension plugins dynamically (optional — no hard dependency).
// Resolve from the project root so linked CLI packages can find plugins
// installed in the consumer project.
try {
  const root = await findProjectRoot(process.cwd());
  const pluginEntry = join(root, "node_modules/@simplix-react-ext/simplix-boot-cli-plugin/dist/index.js");
  if (await pathExists(pluginEntry)) {
    await import(pathToFileURL(pluginEntry).href);
  }
} catch {
  // Plugin not installed — boot profile won't be available
}

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
