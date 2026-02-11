import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addDomainCommand } from "./commands/add-domain.js";
import { addModuleCommand } from "./commands/add-module.js";
import { validateCommand } from "./commands/validate.js";
import { i18nCodegenCommand } from "./commands/i18n-codegen.js";
import { migrationCommand } from "./commands/migration.js";
import { openapiCommand } from "./commands/openapi.js";
import { frameworkVersion } from "./versions.js";

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
program.addCommand(migrationCommand);
program.addCommand(openapiCommand);

program.parse();
