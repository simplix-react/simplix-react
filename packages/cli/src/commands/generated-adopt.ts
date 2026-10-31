import { execFile } from "node:child_process";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import prompts from "prompts";

import { toKebabCase, toPascalCase } from "../utils/case.js";
import { pathExists, writeFileWithDir } from "../utils/fs.js";
import { readBase, recordBase } from "../utils/generated-merge.js";
import { GENERATED_PAGE_MARKER, carryStamp, isUntouchedRender, renderOrigin } from "../utils/project-templates.js";
import { log } from "../utils/logger.js";
import { pageStoryFile } from "./add-page.js";
import { collectGenerated, renderOriginNow } from "./generated.js";

const run = promisify(execFile);

/** One generated file, as another file's origin can be matched against it. */
export interface OriginSource {
  /** Absolute path of a generated file that carries an origin. */
  readonly file: string;
  /** The recorded origin, e.g. `scaffold user --module admin`. */
  readonly origin: string;
}

/** What {@link inferStoryOrigin} needs to know about a story and the files around it. */
export interface StoryOriginInput {
  /** Absolute path of the story. */
  readonly file: string;
  /** What the story holds. */
  readonly text: string;
  /** The generated files that do carry an origin. */
  readonly sources: readonly OriginSource[];
  /** `templates.story` from the project's config: the id and title patterns over `{entity}` and `{Entity}`. */
  readonly pattern?: { readonly id?: string; readonly title?: string };
}

/** The origin a story was laid down by, or why it cannot be told. */
export type InferredOrigin = { readonly origin: string } | { readonly manual: string };

const KEBAB = "([a-z0-9]+(?:-[a-z0-9]+)*)";
const PASCAL = "([A-Z][A-Za-z0-9]*)";

/** A pattern over `{entity}` and `{Entity}` as an anchored expression, with the entity's captured kebab form. */
function patternMatcher(pattern: string): (value: string) => string | undefined {
  const parts = pattern.split(/(\{entity\}|\{Entity\})/);
  const kinds: ("kebab" | "pascal")[] = [];
  const source = parts
    .map((part) => {
      if (part === "{entity}") {
        kinds.push("kebab");
        return KEBAB;
      }
      if (part === "{Entity}") {
        kinds.push("pascal");
        return PASCAL;
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
  const expression = new RegExp(`^${source}$`);
  return (value) => {
    const found = expression.exec(value);
    if (!found || kinds.length === 0) return undefined;
    const captured = found[1];
    return kinds[0] === "pascal" ? toKebabCase(captured) : captured;
  };
}

/** The first double-quoted value of a `key:` line in a story's `Meta` object. */
function metaValue(text: string, key: "id" | "title"): string | undefined {
  return new RegExp(`(?:^|[\\s{,])${key}:\\s*"([^"]+)"`).exec(text)?.[1];
}

/** The origins of `add-page <kind> <name> --module|--app <owner>`, split into the parts the story name uses. */
function pageOrigin(origin: string): { name: string; owner: { module?: string; app?: string } } | undefined {
  const [command, , name, flag, owner] = origin.split(/\s+/);
  if (command !== "add-page" || !name || !owner) return undefined;
  if (flag === "--module") return { name, owner: { module: owner } };
  if (flag === "--app") return { name, owner: { app: owner } };
  return undefined;
}

/**
 * Works out which command laid a story down, for a story stamped without one.
 *
 * <p>Two shapes are recognised, and nothing else is guessed:
 * <ul>
 *   <li>a `scaffold` story, whose `id` or `title` matches the project's `templates.story` patterns
 *       and whose file is named after the entity the pattern yields; the origin is the one
 *       `scaffold <entity> --module <module>` the entity's generated widgets carry</li>
 *   <li>an `add-page` story, whose file is the one `add-page` names for a page that carries an
 *       origin and whose title ends with the story title that command computes for it</li>
 * </ul>
 * Anything ambiguous (two entities, two modules, two pages) is reported as manual.
 */
export function inferStoryOrigin(input: StoryOriginInput): InferredOrigin {
  const file = basename(input.file);
  const found = new Set<string>();

  const id = metaValue(input.text, "id");
  const title = metaValue(input.text, "title");
  const entities = new Set<string>();
  if (input.pattern?.id && id) {
    const entity = patternMatcher(input.pattern.id)(id);
    if (entity) entities.add(entity);
  }
  if (input.pattern?.title && title) {
    const entity = patternMatcher(input.pattern.title)(title);
    if (entity) entities.add(entity);
  }
  if (entities.size > 1) return { manual: `the story id and title name different entities (${[...entities].join(", ")})` };
  if (entities.size === 1) {
    const [entity] = entities;
    if (file !== `${entity}.stories.tsx`) return { manual: `its id or title names "${entity}", but scaffold writes that entity's story to ${entity}.stories.tsx` };
    for (const source of input.sources) {
      if (source.origin.split(/\s+/).slice(0, 2).join(" ") === `scaffold ${entity}`) found.add(source.origin);
    }
    if (found.size === 0) return { manual: `no generated file carries a "scaffold ${entity}" origin` };
  } else if (title) {
    for (const source of input.sources) {
      const page = pageOrigin(source.origin);
      if (!page) continue;
      const storyTitle = page.owner.app ? `${toPascalCase(page.owner.app)}/${toPascalCase(page.name)}` : toPascalCase(page.name);
      if (file === pageStoryFile(page.name, page.owner) && (title === storyTitle || title.endsWith(`/${storyTitle}`))) found.add(source.origin);
    }
  }

  if (found.size === 1) return { origin: [...found][0] };
  if (found.size > 1) return { manual: `more than one origin fits (${[...found].join("; ")})` };
  return { manual: "its id and title match no templates.story pattern, and no page's story has this file name and title" };
}

/** One file's adoption: ready to record, or the reason it was refused. */
export interface AdoptItem {
  /** Path relative to the project root. */
  readonly path: string;
  readonly file: string;
  /** Why the file cannot be adopted; absent when it can. */
  readonly refusal?: string;
  readonly origin?: string;
  /** Whether the origin was inferred and will be written into the file. */
  readonly inferred?: boolean;
  /** The diff from the current render to the file, hunks only; empty when they are identical. */
  readonly diff?: string;
  /** The stamped render that becomes the merge base. */
  readonly render?: string;
  /** What the file holds once adopted: its own text carrying the render's stamp line. */
  readonly adopted?: string;
}

/** A unified diff from `from` to `to`, hunks only, through `git diff --no-index`. */
async function hunksBetween(from: string, to: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "simplix-adopt-"));
  try {
    const [a, b] = ["render", "edited"].map((name) => join(dir, name));
    await Promise.all([writeFile(a, from), writeFile(b, to)]);
    let text: string;
    try {
      ({ stdout: text } = await run("git", ["diff", "--no-index", "--no-color", "--unified=3", a, b], { maxBuffer: 64 * 1024 * 1024 }));
    } catch (err) {
      // Exit status 1 means the files differ, and stdout still holds the diff.
      const failed = err as { code?: unknown; stdout?: string };
      if (failed.code !== 1 || failed.stdout === undefined) throw err;
      text = failed.stdout;
    }
    const at = text.indexOf("\n@@");
    return at < 0 ? "" : text.slice(at + 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Works out, per path, what adopting it would record, without writing anything.
 *
 * @param projectRoot the project root, which must also be the working directory
 * @param files absolute paths of the generated files to adopt
 */
export async function planAdopt(projectRoot: string, files: readonly string[]): Promise<AdoptItem[]> {
  const { rootDir, config, held } = await collectGenerated(projectRoot);
  const storiesAt = config.templates?.storiesDir ? resolve(rootDir, config.templates.storiesDir) : undefined;
  const storiesDir = storiesAt !== undefined && (await pathExists(storiesAt)) ? await realpath(storiesAt) : storiesAt;
  const sources: OriginSource[] = [];
  for (const [file, text] of held) {
    const origin = renderOrigin(text)?.join(" ");
    if (origin !== undefined) sources.push({ file, origin });
  }
  const renders = new Map<string, Awaited<ReturnType<typeof renderOriginNow>>>();

  const items: AdoptItem[] = [];
  for (const requested of files) {
    const file = (await pathExists(requested)) ? await realpath(requested) : resolve(requested);
    const path = relative(rootDir, file);
    const refuse = (refusal: string, more: Partial<AdoptItem> = {}) => items.push({ path, file, refusal, ...more });
    if (!(await pathExists(file))) {
      refuse("no such file");
      continue;
    }
    const text = held.get(file) ?? (await readFile(file, "utf-8"));
    if (!text.includes(GENERATED_PAGE_MARKER)) {
      refuse(`not a generated file: it carries no ${GENERATED_PAGE_MARKER} marker`);
      continue;
    }
    if (isUntouchedRender(text)) {
      refuse("untouched: it is still what the generator wrote, so there is nothing to adopt");
      continue;
    }
    if ((await readBase(file)) !== undefined) {
      refuse("it already has a base: `simplix generated --all` merges the template change into it");
      continue;
    }

    let origin = renderOrigin(text)?.join(" ");
    let inferred = false;
    if (origin === undefined) {
      const found = storiesDir && dirname(file) === storiesDir ? inferStoryOrigin({ file, text, sources, pattern: config.templates?.story }) : undefined;
      if (found === undefined || "manual" in found) {
        refuse(`manual: it records no origin to render from, and ${found === undefined ? "only a story in templates.storiesDir can be traced to one" : found.manual}`);
        continue;
      }
      origin = found.origin;
      inferred = true;
    }

    let rendered = renders.get(origin);
    if (!rendered) {
      try {
        rendered = await renderOriginNow(origin.split(/\s+/));
      } catch (err) {
        refuse(`"${origin}" cannot be rendered: ${err instanceof Error ? err.message : String(err)}`, { origin });
        continue;
      }
      renders.set(origin, rendered);
    }
    const render = rendered.kept.get(file);
    if (render === undefined) {
      refuse(`"${origin}" does not render this file`, { origin });
      continue;
    }
    const adopted = carryStamp(text, render);
    items.push({ path, file, origin, inferred, render, adopted, diff: await hunksBetween(render, adopted) });
  }
  return items;
}

/** Records each ready item's render as its file's merge base, and gives the file that render's stamp line. */
export async function applyAdopt(items: readonly AdoptItem[]): Promise<void> {
  for (const item of items) {
    if (item.refusal !== undefined || item.render === undefined || item.adopted === undefined) continue;
    await recordBase(item.file, item.render);
    if (item.adopted !== (await readFile(item.file, "utf-8"))) await writeFileWithDir(item.file, item.adopted);
  }
}

/** Asks whether the printed differences are all deliberate; the default answer is no. */
async function askConfirmation(count: number): Promise<boolean> {
  const { ok } = await prompts({
    type: "confirm",
    name: "ok",
    message: `Is every difference above a deliberate customisation? Record the render as the base of ${count} file(s)`,
    initial: false,
  });
  return ok === true;
}

/**
 * The body of `simplix generated --adopt`: prints the diff between each file and its current render,
 * then records those renders as the files' merge bases once a person has confirmed them.
 *
 * <p>Confirmation is the prompt on a terminal and `--yes` without one; with neither the diffs are
 * printed and nothing is recorded.
 *
 * @returns the process exit code: 0 when every path was adopted, 1 when any was refused or declined
 */
export async function runAdopt(
  projectRoot: string,
  files: readonly string[],
  options: { readonly yes: boolean; readonly confirm?: (count: number) => Promise<boolean> },
): Promise<number> {
  const items = await planAdopt(projectRoot, files);
  for (const item of items) {
    if (item.refusal !== undefined) {
      log.error(`refused ${item.path}: ${item.refusal}`);
      continue;
    }
    log.step(`adopt ${item.path}  (${item.origin}${item.inferred ? ", origin inferred and written into the file" : ""})`);
    const diff = item.diff ?? "";
    if (diff === "") log.info("it matches its render apart from the stamp line");
    else process.stdout.write(diff.endsWith("\n") ? diff : `${diff}\n`);
  }
  const ready = items.filter((item) => item.refusal === undefined);
  const refused = items.length - ready.length;
  if (ready.length === 0) return 1;

  let confirmed = options.yes;
  if (!confirmed) {
    const ask = options.confirm ?? (process.stdin.isTTY ? askConfirmation : undefined);
    if (ask === undefined) {
      log.error("Nothing recorded: read the diffs above, then run again with --yes if every difference is a deliberate customisation.");
      return 1;
    }
    confirmed = await ask(ready.length);
  }
  if (!confirmed) {
    log.warn("Nothing recorded.");
    return 1;
  }
  await applyAdopt(ready);
  log.info(`adopted ${ready.length} file(s): their renders are their merge bases now${refused > 0 ? `; ${refused} refused` : ""}`);
  return refused > 0 ? 1 : 0;
}
