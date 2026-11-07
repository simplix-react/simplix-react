import { Command } from "commander";
import { moduleDirOf } from "../utils/module-path.js";
import { ensurePageEntrypoints, resolveModuleNamespace, resolveModuleOption } from "./scaffold-crud.js";
import { join, relative, resolve } from "node:path";

import { loadConfig } from "../config/config-loader.js";
import { assertOutputDirs } from "../config/output-dirs.js";
import { reportConfigError } from "../config/report-config-error.js";
import {
  dashboardPageTemplate,
  errorPageTemplate,
  pageKindBlocksTemplate,
  recordPageTemplate,
  staticPageTemplate,
} from "../templates/page-kinds/index.js";
import { toCamelCase, toKebabCase, toPascalCase } from "../utils/case.js";
import { appFor, templatesFor, templatesOption } from "../utils/app-config.js";
import { captureWrites, requireProjectRoot, noteKeptRender, pathExists, writeFileWithDir } from "../utils/fs.js";
import { log, withSilentLog } from "../utils/logger.js";
import { GENERATED_PAGE_MARKER, loadProjectTemplates, stampFingerprint, templateFor, writeGenerated, type ProjectTemplates } from "../utils/project-templates.js";
import { renderTemplate } from "../utils/template.js";
import { storyFileFor } from "../utils/story-file.js";
import { runAfterGenerate } from "../utils/generated-after.js";
import { writeStampedGenerated } from "../utils/generated-merge.js";

/** The page kinds `add-page` generates, each the name of the template that draws it. */
export const PAGE_KINDS = ["record-page", "dashboard-page", "static-page", "error-page", "auth-page", "app-shell"] as const;
export type PageKind = (typeof PAGE_KINDS)[number];

const BUNDLED: Readonly<Record<PageKind, string | undefined>> = {
  "record-page": recordPageTemplate,
  "dashboard-page": dashboardPageTemplate,
  "static-page": staticPageTemplate,
  "error-page": errorPageTemplate,
  // A page reached before there is a session draws the kit's sign-in panel, which the CLI cannot
  // know, so the kind needs a kit or project template like the shell does.
  "auth-page": undefined,
  // A shell is the kit's to draw; the CLI ships none, so the kind needs a kit or project template.
  "app-shell": undefined,
};

/** Accepts the kind with or without its `-page` suffix: `record` and `record-page` are one kind. */
export function parsePageKind(raw: string): PageKind {
  const kind = (raw.endsWith("-page") || raw === "app-shell" ? raw : `${raw}-page`) as PageKind;
  if (!PAGE_KINDS.includes(kind)) throw new Error(`Unknown page kind "${raw}"; expected one of ${PAGE_KINDS.join(", ")}`);
  return kind;
}

/**
 * The template name a kind draws from: `<kind>` itself, or `<kind>.<variant>` where the kit or the
 * project ships another shape of the same kind (a shell with no menu column beside the console's).
 */
export function pageTemplateName(kind: PageKind, variant?: string): string {
  return variant ? `${kind}.${toKebabCase(variant)}` : kind;
}

/** Whether a rendered page imports its sibling departure file (`./page.blocks`). */
export function importsPageBlocks(content: string): boolean {
  return /from\s+["']\.\/page\.blocks(?:\.tsx?)?["']/.test(content);
}

/** The files one page of `kind` renders to, keyed by their name inside the page's directory. */
export function renderPageKind(kind: PageKind, name: string, namespace: string, templates: ProjectTemplates, origin?: string, variant?: string, withBlocks = false): Record<string, string> {
  const template = pageTemplateName(kind, variant);
  // A variant is only ever the kit's or the project's, so it never falls back to the bundled shape.
  const source = templates.get(template) ?? (variant ? undefined : BUNDLED[kind]);
  if (source === undefined) throw new Error(`No template draws "${template}": the UI kit or .simplix/templates must supply ${template}.hbs`);
  const ctx = { NamePascal: toPascalCase(name), nameCamel: toCamelCase(name), nameKebab: toKebabCase(name), namespace, kind };
  const page = { "page.tsx": stampFingerprint(renderTemplate(source, ctx), origin) };
  // The page is laid down whole; a departure file beside it is written when the author asks, or
  // when the page itself imports one, since a page importing a file nobody laid down fails the app.
  if (!withBlocks && !importsPageBlocks(page["page.tsx"])) return page;
  const blocks = templateFor(templates, `${template}.blocks`, templateFor(templates, "page-kind.blocks", pageKindBlocksTemplate));
  return { ...page, "page.blocks.tsx": renderTemplate(blocks, ctx) };
}

/**
 * The board frame for one page of `kind`, from the `<kind>.stories` template the kit ships beside
 * the page template, or undefined when no template draws one.
 *
 * <p>Rendered with the page's own context, so the frame and the page start from one description.
 */
export function renderPageKindStory(kind: PageKind, name: string, namespace: string, templates: ProjectTemplates, app?: string, variant?: string): string | undefined {
  const source = templates.get(`${pageTemplateName(kind, variant)}.stories`);
  if (source === undefined) return undefined;
  // `storyTitle` carries the owning app for the same reason the file name does: two apps' pages of
  // one name would otherwise be one story id on the board.
  const storyTitle = app ? `${toPascalCase(app)}/${toPascalCase(name)}` : toPascalCase(name);
  return renderTemplate(source, { NamePascal: toPascalCase(name), nameCamel: toCamelCase(name), nameKebab: toKebabCase(name), namespace, kind, storyTitle });
}

/**
 * The file a page's board frame is written to. A page an app owns is named after the app too,
 * because two apps may each own a page of one name (both sign in) and the board holds one
 * directory of frames.
 */
export function pageStoryFile(name: string, flags: { module?: string; app?: string }): string {
  return `${flags.app ? `${toKebabCase(flags.app)}-` : ""}${toKebabCase(name)}.stories.tsx`;
}

/**
 * The kind, name and flags an `add-page` origin records (`<kind> <name> --module|--app <owner>
 * [--variant <shape>]`), read back so a regeneration reproduces the same render.
 */
export function addPageArgs(args: readonly string[]): { kind: string; name: string; flags: { module?: string; app?: string; variant?: string } } {
  const [kind = "", name = "", ownerFlag, owner] = args;
  const at = args.indexOf("--variant");
  const variant = at >= 0 ? args[at + 1] : undefined;
  const flags = ownerFlag === "--module" ? { module: owner } : { app: owner };
  return { kind, name, flags: variant ? { ...flags, variant } : flags };
}

export const addPageCommand = new Command("add-page")
  .description(
    "Generate a page of one kind from the templates of the app that owns it: .simplix/templates/<app>/, then .simplix/templates/, " +
      "then the UI kit the app's templates.from names (apps.<app>.templates in simplix.config.ts, else the top-level templates), then the bundled template",
  )
  .argument("<kind>", `Page kind: ${PAGE_KINDS.join(", ")}`)
  .argument("<name>", "Page name (e.g. my-profile, home, not-found)")
  .option(
    "--module <name>",
    "Module that owns the page (modules/<name>/src/pages/<page>); a grouped module is <group>/<name>, drawn for the app whose apps.<app>.moduleGroups holds <group>",
  )
  .option("--app <name>", "App that owns the page (apps/<name>/src/pages/<page>), drawn from that app's templates and written to its storiesDir")
  .option("--variant <name>", "Another shape of the kind, drawn from <kind>.<variant>.hbs (e.g. app-shell --variant top-bar)")
  .option("--blocks", "Also lay down a page.blocks.tsx departure file beside the page, once, for the author to write")
  .option("--dry-run", "Print every file the page would write, with its content, and write nothing (the generated.after commands do not run)")
  .action(reportConfigError(addPageAction));

/**
 * `simplix add-page <kind> <name>`: generates the page, then runs the project's
 * `generated.after` commands. The commands belong here and not in {@link runAddPage}, which the
 * generated-state report runs in capture mode and a regeneration runs once per origin.
 */
async function addPageAction(rawKind: string, name: string, flags: { module?: string; app?: string; variant?: string; blocks?: boolean; dryRun?: boolean }): Promise<void> {
  const { dryRun, ...pageFlags } = flags;
  if (dryRun) {
    const rootDir = await requireProjectRoot(process.cwd());
    // The generator's own lines would name files as written; the captured files are the output.
    const written = await withSilentLog(() => captureWrites(() => runAddPage(rawKind, name, pageFlags)));
    for (const [path, content] of [...written].sort(([a], [b]) => a.localeCompare(b))) {
      process.stdout.write(`--- ${relative(rootDir, path)}\n${content}${content.endsWith("\n") ? "" : "\n"}`);
    }
    log.info(`dry run: ${written.size} file(s) would be written, none was`);
    return;
  }
  await runAddPage(rawKind, name, pageFlags);
  await runAfterGenerate(await requireProjectRoot(process.cwd()));
}

/**
 * Generates one page of a kind: the body of `simplix add-page <kind> <name>`.
 *
 * <p>Exported so the generated-state report can run the same render in capture mode.
 */
export async function runAddPage(rawKind: string, name: string, flags: { module?: string; app?: string; variant?: string; blocks?: boolean }): Promise<void> {
    const rootDir = await requireProjectRoot(process.cwd());
    const kind = parsePageKind(rawKind);
    if (Boolean(flags.module) === Boolean(flags.app)) {
      log.error("Name exactly one owner: --module <name> or --app <name>");
      process.exit(1);
    }
    const module = flags.module ? await resolveModuleOption(rootDir, flags.module) : undefined;
    const owner = module ? moduleDirOf(rootDir, module) : join(rootDir, "apps", flags.app ?? "");
    const config = await loadConfig(rootDir);
    await assertOutputDirs(rootDir, config);
    // The app the page is drawn for decides its templates and where its frame goes.
    const app = appFor(config, { app: flags.app, moduleGroup: module?.group });
    const settings = templatesFor(config, app);
    const templates = await loadProjectTemplates(rootDir, settings.from, app, templatesOption(config, "from", app));
    // The module's i18n namespace is its package name, which a grouped module spells with its group.
    const namespace = module ? `${await resolveModuleNamespace(owner)}/pages` : "common";
    const dir = kind === "app-shell" ? join(owner, "src", "app", "layouts") : join(owner, "src", "pages", toKebabCase(name));
    const variant = flags.variant ? toKebabCase(flags.variant) : undefined;
    const origin = `add-page ${kind} ${toKebabCase(name)} ${module ? `--module ${module.path}` : `--app ${flags.app}`}${variant ? ` --variant ${variant}` : ""}`;
    for (const [file, content] of Object.entries(renderPageKind(kind, name, namespace, templates, origin, variant, flags.blocks === true))) {
      const path = join(dir, kind === "app-shell" && file === "page.tsx" ? "root-layout.tsx" : kind === "app-shell" ? "root-layout.blocks.tsx" : file);
      // The page is tracked: rewritten while untouched, merged into once edited. A departure file or a
      // project template without the marker is laid down once and left to its author.
      if (!content.includes(GENERATED_PAGE_MARKER)) {
        if (await pathExists(path)) {
          noteKeptRender(path, content);
          log.warn(`Keeping ${path}`);
          continue;
        }
        await writeFileWithDir(path, content);
        log.step(path);
        continue;
      }
      const { outcome } = await writeStampedGenerated(path, content);
      log.step(`${outcome.padEnd(8)} ${path}`);
    }
    // A page in a module is mounted by an app's route, which imports it through the package.
    if (module && kind !== "app-shell") await ensurePageEntrypoints(owner, toKebabCase(name), `${toPascalCase(name)}Page`);
    // The design reference's frame, tracked like the page: rewritten while untouched, kept once
    // customised.
    const story = renderPageKindStory(kind, name, namespace, templates, flags.app, variant);
    const storiesDir = settings.storiesDir;
    if (story !== undefined && storiesDir) {
      const fallback = pageStoryFile(name, flags);
      const storyPath = resolve(rootDir, storiesDir, storyFileFor(settings.story, fallback.slice(0, -".stories.tsx".length), fallback));
      const outcome = await writeGenerated(storyPath, story, origin);
      log.info(`${outcome} story ${relative(rootDir, storyPath)}`);
    }
}
