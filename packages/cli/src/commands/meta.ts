// `simplix meta` — generate a domain package from SimpliX Meta alone.
//
// The `openapi` command runs both halves side by side, which is what a project migrating off
// OpenAPI needs. This one runs the SimpliX Meta half by itself: no spec argument, no Orval, and no
// `src/generated/`. A project that has finished migrating uses it and can drop Orval entirely;
// `openapi` stays exactly as it was for one that has not.

import { join } from "node:path";
import { Command } from "commander";
import { loadConfig } from "../config/config-loader.js";
import { reportConfigError } from "../config/report-config-error.js";
import {
  crudRolesFromHooks,
  generateCrudConfigContent,
  generateLocaleFiles,
  overlayServerTranslations,
  prepareMetaContext,
  type MetaContext,
  writeMetaSnapshot,
} from "./openapi.js";
import { serverEntityOf, writeEntityLabels } from "../meta/entity-labels.js";
import { ignoredTagMatcher, unclaimedTagMessage } from "../meta/resolve.js";
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
  strict?: boolean;
}

export const metaCommand = new Command("meta")
  .description("Generate domain packages from SimpliX Meta, without Orval")
  .option("-d, --domain <name>", "Domain to generate (defaults to every configured domain)")
  .option("--offline", "Read SimpliX Meta from meta.snapshot instead of the server")
  .option("-f, --force", "Rewrite crud.config.ts even where one already exists")
  .option("--strict", "Exit non-zero, generating nothing, when a tag in SimpliX Meta is claimed by no domain")
  .action(reportConfigError(async (flags: MetaFlags) => {
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

    // A tag no domain claims generates nothing, so a new controller is invisible to the frontend
    // until its tag is listed. Every one is named with the domain it most likely belongs to, except
    // the tags `meta.ignoreTags` leaves unclaimed on purpose.
    const ignored = ignoredTagMatcher(specConfig.meta.ignoreTags ?? []);
    const unclaimed = meta.resolved.unmatched.filter((one) => !ignored(one.tag));
    const skipped = meta.resolved.unmatched.length - unclaimed.length;
    if (skipped > 0) log.info(`${skipped} unclaimed tag(s) skipped by meta.ignoreTags.`);
    for (const one of unclaimed) {
      log.warn(unclaimedTagMessage(one));
    }
    for (const one of meta.resolved.deadPatterns) {
      log.warn(`Domain "${one.domain}" pattern "${one.pattern}" matches no tag.`);
    }
    if (flags.strict === true && unclaimed.length > 0) {
      // Refused before anything is written, so a failed run leaves the packages as they were.
      log.error(
        `--strict: ${unclaimed.length} tag(s) are claimed by no domain (${unclaimed.map((one) => one.tag).join(", ")}). ` +
          "Nothing was generated; list each tag under a domain in simplix.config.ts, or under meta.ignoreTags.",
      );
      process.exit(1);
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
          // The server keys its translations by entity class, so a second surface over an entity
          // asks for that entity's labels under its own domain name.
          const known = new Set(Object.keys(meta.document.entities ?? {}));
          const byServerName = entities.map((one, index) => {
            const source = domain.entities[index] ? serverEntityOf(domain.entities[index], known) : undefined;
            return source ? { ...one, pascalName: source } : one;
          });
          await overlayServerTranslations(targetDir, byServerName, locales, origin, downloader);
        }
        // Last, so a server overlay that carries no entity names cannot drop the ones SimpliX Meta states.
        await writeEntityLabels(targetDir, domain, meta.document, locales);
      }

      log.success(`${prefix ? `${prefix}/` : ""}${dirName}: wrote ${written.written.length} file(s) to ${META_DIR}/.`);
      generated += 1;
    }

    // Written once every domain has been generated, as `simplix openapi` does, so `--offline` and
    // the next run's change gate read what this run read.
    if (await writeMetaSnapshot(meta, flags.offline === true)) {
      log.info(`SimpliX Meta snapshot written: ${meta.snapshotPath}`);
    } else if (meta.snapshotPath) {
      log.info(`SimpliX Meta snapshot read: ${meta.snapshotPath}`);
    }
    log.info(`Generated ${generated} domain package(s) from SimpliX Meta.`);
  }));
