import { Command } from "commander";

import { loadConfig } from "../config/config-loader.js";
import { reportConfigError } from "../config/report-config-error.js";
import { describeEntity, formatEntityInfo } from "../meta/entity-info.js";
import { loadMetaScaffoldSource } from "../meta/scaffold-source.js";
import { findProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";

interface MetaInfoFlags {
  root?: string;
  json: boolean;
}

/** `EmailLog`, `email-log` and `emailLog` are one entity: the scaffolder names it in camel case. */
function camelEntity(name: string): string {
  const camel = name.replace(/[-_\s]+([a-zA-Z0-9])/g, (_, char: string) => char.toUpperCase());
  return camel.charAt(0).toLowerCase() + camel.slice(1);
}

export const metaInfoCommand = new Command("meta-info")
  .description(
    "Say what the backend offers a screen over an entity, from the committed SimpliX Meta: the list and its access, the default " +
      "sort, keyword search, status counts, aggregates, the time range counts, export, actions, filters, and fields drawn masked.",
  )
  .argument("<entity>", "Entity name in any case (EmailLog, email-log, emailLog)")
  .option("--root <dir>", "Project root (default: discovered from the working directory)")
  .option("--json", "Print the answer as JSON", false)
  .action(
    reportConfigError(async (entity: string, flags: MetaInfoFlags) => {
      const rootDir = flags.root ?? (await findProjectRoot(process.cwd()));
      const config = await loadConfig(rootDir);
      const source = await loadMetaScaffoldSource(rootDir, camelEntity(entity));
      if (!source) {
        log.error(`SimpliX Meta states no entity "${entity}" in a domain the config exports from meta`);
        process.exitCode = 1;
        return;
      }
      const info = describeEntity(source, config.scaffold?.maskedSuffix);
      console.log(flags.json ? JSON.stringify(info, null, 2) : formatEntityInfo(info));
    }),
  );
