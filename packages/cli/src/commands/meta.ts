// `simplix meta` — generate a domain package from SimpliX Meta alone.
//
// The `openapi` command runs both halves side by side, which is what a project migrating off
// OpenAPI needs. This one runs the SimpliX Meta half by itself: no spec argument, no Orval, and no
// `src/generated/`. A project that has finished migrating uses it and can drop Orval entirely;
// `openapi` stays exactly as it was for one that has not.

import { join } from "node:path";
import { Command } from "commander";
import { loadConfig } from "../config/config-loader.js";
import {
  crudRolesFromHooks,
  generateCrudConfigContent,
  generateLocaleFiles,
  overlayServerTranslations,
  prepareMetaContext,
  type MetaContext,
} from "./openapi.js";
import { metaEntities, META_DIR, writeMetaOutput } from "../meta/write.js";
import { resolveSpecConfig } from "../openapi/orchestration/resolve-spec-config.js";
import { findProjectRoot, pathExists, writeFileWithDir } from "../utils/fs.js";
import { log } from "../utils/logger.js";

/** The server the i18n download talks to, taken from a URL spec. A file path names none. */
function metaOrigin(from: string | undefined): string | undefined {
  return from && /^https?:\/\//i.test(from) ? new URL(from).origin : undefined;
}

interface MetaFlags {
  domain?: string;
  offline?: boolean;
  force?: boolean;
}

export const metaCommand = new Command("meta")
  .description("Generate domain packages from SimpliX Meta, without Orval")
  .option("-d, --domain <name>", "Domain to generate (defaults to every configured domain)")
  .option("--offline", "Read SimpliX Meta from meta.snapshot instead of the server")
  .option("-f, --force", "Rewrite crud.config.ts even where one already exists")
  .action(async (flags: MetaFlags) => {
    const rootDir = await findProjectRoot(process.cwd());
    if (!rootDir) {
      log.error("No simplix.config.ts found. Run this from inside a SimpliX project.");
      process.exit(1);
    }

    const config = await loadConfig(rootDir);
    const specConfig = config.openapi?.[0];
    if (!specConfig) {
      log.error("simplix.config.ts declares no `openapi` entry, so there is nothing to generate.");
      process.exit(1);
    }
    if (!specConfig.meta) {
      log.error(
        "simplix.config.ts declares no `openapi[].meta` block. `simplix meta` reads SimpliX Meta " +
          "and nothing else; add the block, or use `simplix openapi` for the Orval path.",
      );
      process.exit(1);
    }

    // The profile contributes the naming strategy, the response adapter and the i18n download.
    const resolved = resolveSpecConfig(specConfig);

    let meta: MetaContext | undefined;
    try {
      meta = await prepareMetaContext({
        specConfig,
        // A migrated project states `meta.source`; one still carrying a document
        // resolves the endpoint from its origin.
        specSource: specConfig.spec ?? specConfig.meta.source ?? "",
        rootDir,
        offline: flags.offline === true,
        naming: resolved.naming,
        responseAdapter: resolved.responseAdapter,
      });
    } catch (err) {
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
    if (!meta) {
      log.error("SimpliX Meta could not be read.");
      process.exit(1);
    }

    for (const one of meta.resolved.unmatched) {
      log.warn(`${one.operations.length} operation(s) under '${one.tag}' match no domain.`);
    }
    for (const one of meta.resolved.deadPatterns) {
      log.warn(`Domain "${one.domain}" pattern "${one.pattern}" matches no tag.`);
    }

    const wanted = flags.domain ? [flags.domain] : [...meta.resolved.domains.keys()];
    const locales = config.i18n?.locales ?? ["en", "ko", "ja"];
    let generated = 0;

    for (const domainName of wanted) {
      const domain = meta.resolved.domains.get(domainName);
      if (!domain) {
        log.warn(`Domain "${domainName}" is not configured; skipping.`);
        continue;
      }

      const prefix = config.packages?.prefix ?? "";
      const dirName = `domain-${domainName}`;
      const targetDir = join(rootDir, "packages", dirName);
      if (!(await pathExists(targetDir))) {
        log.warn(`packages/${dirName} does not exist. Run \`simplix add-domain ${domainName}\` first.`);
        continue;
      }

      const written = await writeMetaOutput({
        targetDir,
        domain,
        naming: meta.naming,
        envelope: meta.envelope,
        labeledEnum: meta.labeledEnum,
      });
      for (const warning of written.warnings) log.warn(`${domainName}: ${warning}`);

      // `crud.config.ts` drives the scaffolder, which resolves no hook name without it.
      const crudConfigPath = join(targetDir, "crud.config.ts");
      if (flags.force === true || !(await pathExists(crudConfigPath))) {
        await writeFileWithDir(
          crudConfigPath,
          generateCrudConfigContent(crudRolesFromHooks(written.entities)),
        );
      }

      // The locale overlay and the i18n download read a name and a field list, both of which
      // SimpliX Meta states, so neither needs an OpenAPI document behind it.
      const entities = metaEntities(domain);
      if (await pathExists(join(targetDir, "src/translations.ts"))) {
        await generateLocaleFiles(targetDir, entities, locales);
        // A URL spec carries its own origin, which is all the download needs.
        const origin = metaOrigin(specConfig.spec ?? specConfig.meta?.source);
        const downloader = resolved.i18nDownloader;
        if (origin && downloader) {
          await overlayServerTranslations(targetDir, entities, locales, origin, downloader);
        }
      }

      log.success(`${prefix ? `${prefix}/` : ""}${dirName}: wrote ${written.written.length} file(s) to ${META_DIR}/.`);
      generated += 1;
    }

    if (meta.snapshotPath) log.info(`SimpliX Meta snapshot: ${meta.snapshotPath}`);
    log.info(`Generated ${generated} domain package(s) from SimpliX Meta.`);
  });
