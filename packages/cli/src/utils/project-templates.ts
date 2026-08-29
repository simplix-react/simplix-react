import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { pathExists } from "./fs.js";

/** Where a project keeps the templates it wants used instead of the CLI's own. */
export const PROJECT_TEMPLATE_DIR = ".simplix/templates";

/**
 * The templates a project has taken over, keyed by the name of the bundled template each replaces.
 *
 * <p>A generated page is the one artifact a project rewrites the moment it is emitted: the CLI
 * knows the entity's operations and nothing about the chrome this console puts around them — its
 * status tiles, its notice cards, its tab strip. Shipping that chrome in the CLI would put one
 * product's decisions in every product's generator, so the project states them here and the CLI
 * renders what it finds.
 *
 * <p>A name with no file falls through to the bundled template, so a project overrides the one
 * page shape it cares about without carrying copies of the rest.
 */
export type ProjectTemplates = ReadonlyMap<string, string>;

/**
 * Read `<root>/.simplix/templates/*.hbs`.
 *
 * <p>Returns an empty map where the directory is absent, which is every project that has not
 * taken a template over.
 */
export async function loadProjectTemplates(root: string): Promise<ProjectTemplates> {
  const dir = join(root, PROJECT_TEMPLATE_DIR);
  if (!(await pathExists(dir))) return new Map();

  const found = new Map<string, string>();
  for (const name of (await readdir(dir)).sort()) {
    if (!name.endsWith(".hbs")) continue;
    found.set(name.slice(0, -".hbs".length), await readFile(join(dir, name), "utf-8"));
  }
  return found;
}

/**
 * The template to render for `name` — the project's where it has one, the bundled one otherwise.
 *
 * @param name the bundled template's file name without its extension, e.g. `crud-page`
 * @param bundled the template the CLI ships under that name
 */
export function templateFor(
  templates: ProjectTemplates,
  name: string,
  bundled: string,
): string {
  return templates.get(name) ?? bundled;
}

/**
 * The name of the template a project supplies for a page's hand-written parts.
 *
 * <p>Rendered to `page.blocks.tsx` beside the generated page, and only where that file is already
 * there — it is the author's file, and its existence is what lets the generated page be rewritten
 * on every run rather than skipped once it is on disk. A page that departs from nothing gets no
 * such file: an empty hook per page states a difference that is not there, and a reader counting
 * departures then has to open every one to learn they are all the same.
 */
export const PAGE_BLOCKS_TEMPLATE = "page.blocks";

/**
 * What a generated page says about itself on its first line.
 *
 * <p><b>It records where the file came from, not what may be done to it.</b> A page is scaffolded
 * and then written on — that is the intended life of one — so the marker outliving the first
 * render is the normal case and says only that the generator laid the file down. What decides
 * whether a re-run may overwrite it is {@link GENERATED_HASH_MARKER}, never this.
 */
export const GENERATED_PAGE_MARKER = "@simplix-generated";

/**
 * The fingerprint of the render a generated file was laid down as.
 *
 * <p>Stamped on the line under the marker and checked before any re-run rewrites the file: the
 * hash of what is on disk now, taken the same way, either matches — nobody has touched it since —
 * or it does not, and the file is somebody's work. Without it the generator has no way to tell
 * an untouched scaffold from a screen a person spent a week on, and the two look identical from
 * the outside: both carry the marker, both compile, and only one may be discarded.
 *
 * <p>A file carrying the marker and no hash is treated as touched. It predates the stamp, so
 * nothing about it can be proved, and the safe reading of an unprovable file is that it is not
 * the generator's to take back.
 */
export const GENERATED_HASH_MARKER = "@simplix-render";

/**
 * The fingerprint of one rendered page, over everything but the fingerprint line itself.
 *
 * @param source the file's content, rendered or read back from disk
 * @returns twelve hex characters — enough to separate renders, short enough to read
 */
export function renderFingerprint(source: string): string {
  const withoutStamp = source
    .split("\n")
    .filter((line) => !line.includes(GENERATED_HASH_MARKER))
    .join("\n");
  return createHash("sha256").update(withoutStamp).digest("hex").slice(0, 12);
}

/**
 * Writes the fingerprint of a freshly rendered page into its own header.
 *
 * @param source the rendered page, carrying the marker
 * @returns the same page with the fingerprint line under the marker
 */
export function stampFingerprint(source: string): string {
  const lines = source.split("\n");
  const at = lines.findIndex((line) => line.includes(GENERATED_PAGE_MARKER));
  if (at < 0) return source;
  const indent = /^(\s*\*?\s*)/.exec(lines[at])?.[1] ?? " * ";
  const stamped = [
    ...lines.slice(0, at + 1),
    `${indent}${GENERATED_HASH_MARKER} ${renderFingerprint(source)}`,
    ...lines.slice(at + 1),
  ].join("\n");
  return stamped;
}

/**
 * Whether a file on disk is still exactly what the generator laid down.
 *
 * @param held what the file holds now
 * @returns true only where the file carries a fingerprint and still matches it
 */
export function isUntouchedRender(held: string): boolean {
  const line = held.split("\n").find((one) => one.includes(GENERATED_HASH_MARKER));
  if (line === undefined) return false;
  const recorded = new RegExp(`${GENERATED_HASH_MARKER}\\s+([0-9a-f]{12})`).exec(line)?.[1];
  return recorded !== undefined && recorded === renderFingerprint(held);
}
