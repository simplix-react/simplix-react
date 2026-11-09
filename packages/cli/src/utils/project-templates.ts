import { createHash } from "node:crypto";
import { writeStampedGenerated, type GeneratedOutcome } from "./generated-merge.js";
import { readdir, readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";

import { pathExists } from "./fs.js";

/** Where a project keeps the templates it wants used instead of the CLI's own. */
export const PROJECT_TEMPLATE_DIR = ".simplix/templates";

/**
 * The templates a project has taken over, keyed by the name of the bundled template each replaces.
 *
 * <p>A generated page is the one artifact a project rewrites the moment it is emitted: the CLI
 * knows the entity's operations and nothing about the chrome this console puts around them - its
 * status tiles, its notice cards, its tab strip. Shipping that chrome in the CLI would put one
 * product's decisions in every product's generator, so the project states them here and the CLI
 * renders what it finds.
 *
 * <p>A name with no file falls through to the bundled template, so a project overrides the one
 * page shape it cares about without carrying copies of the rest.
 */
export type ProjectTemplates = ReadonlyMap<string, string>;

/** The `package.json` field a UI kit names its template directory in, relative to the package. */
export const KIT_TEMPLATES_FIELD = "templates";

async function readTemplateDir(dir: string): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  if (!(await pathExists(dir))) return found;
  for (const name of (await readdir(dir)).sort()) {
    if (!name.endsWith(".hbs")) continue;
    found.set(name.slice(0, -".hbs".length), await readFile(join(dir, name), "utf-8"));
  }
  return found;
}

interface PackageManifest {
  readonly name?: string;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly workspaces?: readonly string[] | { readonly packages?: readonly string[] };
  readonly simplix?: KitManifestFields;
}

/** What a UI kit states about its templates in the `simplix` field of its `package.json`. */
interface KitManifestFields {
  /** The kit's template directory, relative to the package. */
  readonly templates?: string;
  /** The kit whose templates this kit starts from; its own templates replace those name by name. */
  readonly extends?: string;
  /** The short name generated files carry for this kit (`{{@kit.id}}`), e.g. `clarity`. */
  readonly id?: string;
}

async function readManifest(dir: string): Promise<PackageManifest | undefined> {
  const file = join(dir, "package.json");
  if (!(await pathExists(file))) return undefined;
  try {
    return JSON.parse(await readFile(file, "utf-8")) as PackageManifest;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`${file} is not valid JSON: ${error.message}`);
    throw error;
  }
}

/** The workspace's package globs, from `pnpm-workspace.yaml` or the root manifest's `workspaces`. */
async function workspaceGlobs(root: string, manifest: PackageManifest | undefined): Promise<string[]> {
  const yaml = join(root, "pnpm-workspace.yaml");
  if (await pathExists(yaml)) {
    const globs: string[] = [];
    let inPackages = false;
    for (const line of (await readFile(yaml, "utf-8")).split("\n")) {
      if (/^packages\s*:/.test(line)) { inPackages = true; continue; }
      if (inPackages && /^\S/.test(line)) break;
      const entry = inPackages ? /^\s*-\s*['"]?([^'"#\s]+)/.exec(line) : null;
      if (entry?.[1]) globs.push(entry[1]);
    }
    return globs;
  }
  const declared = manifest?.workspaces;
  return [...(Array.isArray(declared) ? declared : (declared as { packages?: string[] } | undefined)?.packages ?? [])];
}

/** The directories a workspace glob names; only a trailing `/*` or an exact directory is expanded. */
async function expandGlob(root: string, glob: string): Promise<string[]> {
  if (glob.startsWith("!")) return [];
  if (!glob.endsWith("/*")) return [join(root, glob)];
  const parent = join(root, glob.slice(0, -2));
  if (!(await pathExists(parent))) return [];
  const entries = await readdir(parent, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => join(parent, entry.name)).sort();
}

/** Finds the directory of package `name`: under the root's `node_modules`, then among the workspace's packages. */
export async function resolveKitPackageDir(root: string, name: string): Promise<string | undefined> {
  return packageDir(root, name);
}

async function packageDir(root: string, name: string): Promise<string | undefined> {
  const installed = join(root, "node_modules", name);
  if (await readManifest(installed)) return installed;
  for (const glob of await workspaceGlobs(root, await readManifest(root))) {
    for (const dir of await expandGlob(root, glob)) {
      if ((await readManifest(dir))?.name === name) return dir;
    }
  }
  return undefined;
}

/** The template directory a kit package declares, or undefined where it declares none. */
async function kitTemplateDir(dir: string): Promise<string | undefined> {
  const declared = (await readManifest(dir))?.simplix?.[KIT_TEMPLATES_FIELD];
  return declared ? join(dir, declared) : undefined;
}

/** Whether a package manifest makes it a UI kit: it ships templates or starts from a kit that does. */
function isKit(manifest: PackageManifest | undefined): boolean {
  return manifest?.simplix?.[KIT_TEMPLATES_FIELD] !== undefined || manifest?.simplix?.extends !== undefined;
}

/** One kit in the chain a project draws with: the package and the template directory it declares. */
export interface KitLayer {
  /** The package name, from its manifest. */
  readonly name: string;
  /** The package directory. */
  readonly dir: string;
  /** The template directory the package declares, undefined where it declares none. */
  readonly templates?: string;
  /** The `simplix.id` the package declares. */
  readonly id?: string;
}

/**
 * The kit a project draws with and every kit it extends, base first.
 *
 * <p>Empty where the project names no kit and depends on none. A `templates.from` path that holds no
 * manifest is one template directory with no kit around it.
 */
export interface KitChain {
  readonly layers: readonly KitLayer[];
  /** The kit `templates.from` names (the last layer), which `{{@kit.*}}` describes. */
  readonly kit?: KitLayer;
}

/**
 * Finds package `name` the way Node resolves it from `fromDir`: `node_modules/<name>` in that
 * directory and each one above it. A kit's own dependency is reached from the kit, since a strict
 * installer gives the project root no copy of it.
 */
async function packageDirFrom(fromDir: string, name: string): Promise<string | undefined> {
  let dir = resolve(fromDir);
  for (;;) {
    const candidate = join(dir, "node_modules", name);
    if (await readManifest(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

async function kitLayer(dir: string): Promise<KitLayer> {
  const manifest = await readManifest(dir);
  return { name: manifest?.name ?? dir, dir, templates: await kitTemplateDir(dir), id: manifest?.simplix?.id };
}

/** `kit` and every kit its `simplix.extends` names, base first. */
async function chainFrom(root: string, kit: KitLayer): Promise<KitLayer[]> {
  const layers = [kit];
  const seen = new Set([kit.name]);
  let current = kit;
  for (;;) {
    const parent = (await readManifest(current.dir))?.simplix?.extends;
    if (parent === undefined) return layers;
    if (seen.has(parent)) throw new Error(`simplix.extends of ${current.name} cycles back to "${parent}"`);
    const dir = (await packageDirFrom(current.dir, parent)) ?? (await packageDir(root, parent));
    if (!dir) throw new Error(`${current.name} extends "${parent}", which is not installed where ${current.name} can reach it`);
    current = await kitLayer(dir);
    seen.add(parent);
    layers.unshift(current);
  }
}

/**
 * The kit chain a project draws with.
 *
 * <p>`from` is a package name or a path. Without it, the dependencies of the project root that are
 * kits are taken, less any that another of them extends; two left over are refused, since nothing
 * says which one the project means.
 *
 * @param option how the config spells `from`, for the error a kit that cannot be found raises
 */
export async function resolveKitChain(root: string, from?: string, option = "templates.from"): Promise<KitChain> {
  if (from !== undefined) {
    if (from.startsWith(".") || isAbsolute(from)) {
      const dir = resolve(root, from);
      if (!isKit(await readManifest(dir))) return { layers: [{ name: from, dir, templates: dir }] };
      const kit = await kitLayer(dir);
      return { layers: await chainFrom(root, kit), kit };
    }
    const dir = await packageDir(root, from);
    if (!dir) throw new Error(`${option} names "${from}", which is neither installed at ${root} nor a workspace package`);
    if (!isKit(await readManifest(dir))) {
      throw new Error(`${option} names "${from}", whose package.json declares neither simplix.${KIT_TEMPLATES_FIELD} nor simplix.extends`);
    }
    const kit = await kitLayer(dir);
    return { layers: await chainFrom(root, kit), kit };
  }
  const manifest = await readManifest(root);
  const names = Object.keys({ ...manifest?.dependencies, ...manifest?.devDependencies }).sort();
  const chains: KitLayer[][] = [];
  for (const name of names) {
    const dir = join(root, "node_modules", name);
    if (isKit(await readManifest(dir))) chains.push(await chainFrom(root, await kitLayer(dir)));
  }
  const extended = new Set(chains.flatMap((chain) => chain.slice(0, -1).map((layer) => layer.name)));
  const leaves = chains.filter((chain) => !extended.has(chain[chain.length - 1].name));
  if (leaves.length > 1) throw new Error(`More than one dependency is a UI kit; set templates.from in simplix.config.ts`);
  const layers = leaves[0] ?? [];
  return { layers, kit: layers[layers.length - 1] };
}

/**
 * The template directory of the UI kit a project draws with, the kit `from` names itself and none
 * it extends. {@link loadProjectTemplates} reads the whole chain.
 *
 * @returns the directory, or undefined where the project names no kit or the kit declares none
 */
export async function resolveKitTemplateDir(root: string, from?: string, option = "templates.from"): Promise<string | undefined> {
  const chain = await resolveKitChain(root, from, option);
  return chain.layers[chain.layers.length - 1]?.templates;
}

/** A kit value a template names as `{{@kit.<key>}}`. */
const KIT_TOKEN = /\{\{@kit\.([A-Za-z]+)\}\}/g;

/**
 * The values `{{@kit.*}}` stands for, from the kit `templates.from` names.
 *
 * <p>`package` is its package name, `label` the name without its scope, `id` its `simplix.id`.
 */
function kitValues(kit: KitLayer): Record<string, string | undefined> {
  return { package: kit.name, label: kit.name.replace(/^@[^/]+\//, ""), id: kit.id };
}

/**
 * Writes the kit's values into every template that names one.
 *
 * <p>Done once, where the templates are read, so every render receives the same text whatever
 * context it builds. A token with no value is refused: the engine would render it as nothing, and
 * an import from `"/page"` compiles nowhere and says nothing about why.
 */
function bindKit(templates: Map<string, string>, kit: KitLayer | undefined): Map<string, string> {
  const values = kit ? kitValues(kit) : {};
  for (const [name, source] of templates) {
    if (!source.includes("{{@kit.")) continue;
    templates.set(name, source.replace(KIT_TOKEN, (token, key: string) => {
      const value = values[key];
      if (value !== undefined) return value;
      if (!kit) throw new Error(`${name}.hbs names ${token}, and the project draws with no UI kit`);
      if (key === "id") throw new Error(`${name}.hbs names ${token}, and ${kit.name} declares no simplix.id`);
      throw new Error(`${name}.hbs names ${token}; a kit value is one of {{@kit.package}}, {{@kit.label}}, {{@kit.id}}`);
    }));
  }
  return templates;
}

/**
 * The directory holding one app's own templates: `.simplix/templates/<app>/`.
 *
 * @throws Error when the app's name is not a single directory name
 */
export function appTemplateDir(root: string, app: string): string {
  if (app === "" || app === "." || app === ".." || /[\\/]/.test(app)) {
    throw new Error(`"${app}" is not an app name: an app is one directory under apps/`);
  }
  return join(root, PROJECT_TEMPLATE_DIR, app);
}

/**
 * The templates in force for a page, name by name: the app's own `.simplix/templates/<app>/*.hbs`,
 * then the project's `.simplix/templates/*.hbs`, then the UI kit's templates, then those of each kit
 * it extends, each name falling through to the next layer and finally to the CLI's bundled one.
 *
 * <p>`{{@kit.package}}`, `{{@kit.label}}` and `{{@kit.id}}` are written into every layer's templates
 * as the kit `from` names, so a base kit's template imports from whichever kit the project draws with.
 *
 * <p>Returns an empty map where no layer has a template, which is every project that has not
 * taken one over and draws with no kit that ships any.
 *
 * @param from the `templates.from` setting in force for the page (the app's, else the top-level one)
 * @param app the app the page is generated for; undefined reads no app layer
 * @param option how the config spells `from`, for the error a kit that cannot be found raises
 */
export async function loadProjectTemplates(root: string, from?: string, app?: string, option?: string): Promise<ProjectTemplates> {
  const chain = await resolveKitChain(root, from, option);
  const found = new Map<string, string>();
  for (const layer of chain.layers) {
    if (layer.templates) for (const [name, source] of await readTemplateDir(layer.templates)) found.set(name, source);
  }
  for (const [name, source] of await readTemplateDir(join(root, PROJECT_TEMPLATE_DIR))) found.set(name, source);
  if (app !== undefined) for (const [name, source] of await readTemplateDir(appTemplateDir(root, app))) found.set(name, source);
  return bindKit(found, chain.kit);
}

/**
 * The template to render for `name` - the project's where it has one, the bundled one otherwise.
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
 * The name of the template a page's blocks are rendered from.
 *
 * <p>Rendered to `page.blocks.tsx` beside the generated page wherever the page imports it, and
 * tracked as the page is: a screen writes inside the keys the template lays down, and a template
 * change is merged into every screen three ways.
 */
export const PAGE_BLOCKS_TEMPLATE = "page.blocks";

/**
 * The template a UI kit ships beside its CRUD page template for the design reference's frame.
 *
 * <p>Rendered with the same context as the page, into `templates.storiesDir`, so a board frame
 * and the screen are generated from one description of the entity.
 */
export const STORY_TEMPLATE = "crud-page.stories";

/**
 * What a generated page says about itself on its first line.
 *
 * <p><b>It records where the file came from, not what may be done to it.</b> A page is scaffolded
 * and then written on - that is the intended life of one - so the marker outliving the first
 * render is the normal case and says only that the generator laid the file down. What decides
 * whether a re-run may overwrite it is {@link GENERATED_HASH_MARKER}, never this.
 */
export const GENERATED_PAGE_MARKER = "@simplix-generated";

/**
 * The fingerprint of the render a generated file was laid down as.
 *
 * <p>Stamped on the line under the marker and checked before any re-run rewrites the file: the
 * hash of what is on disk now, taken the same way, either matches - nobody has touched it since  - 
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
 * @returns twelve hex characters - enough to separate renders, short enough to read
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
export function stampFingerprint(source: string, origin?: string): string {
  const lines = source.split("\n");
  const at = lines.findIndex((line) => line.includes(GENERATED_PAGE_MARKER));
  if (at < 0) return source;
  const indent = /^(\s*\*?\s*)/.exec(lines[at])?.[1] ?? " * ";
  const tail = origin ? ` ${origin}` : "";
  const stamped = [
    ...lines.slice(0, at + 1),
    `${indent}${GENERATED_HASH_MARKER} ${renderFingerprint(source)}${tail}`,
    ...lines.slice(at + 1),
  ].join("\n");
  return stamped;
}

/**
 * Gives an edited file the stamp line of a render, so the file reads as laid down from that render.
 *
 * <p>The line replaces the fingerprint line the file holds, or goes under the marker when the file
 * holds none. The rest of the file is returned as it is: an edited file keeps its edits and only
 * learns which render they are read against.
 *
 * @param held what the edited file holds now
 * @param render the stamped render the file is adopted against
 * @returns the file with the render's stamp line, or `held` unchanged when either side has no marker
 */
export function carryStamp(held: string, render: string): string {
  const stamp = render.split("\n").find((one) => one.includes(GENERATED_HASH_MARKER));
  if (stamp === undefined) return held;
  const lines = held.split("\n");
  const at = lines.findIndex((one) => one.includes(GENERATED_HASH_MARKER));
  if (at >= 0) {
    lines[at] = stamp;
    return lines.join("\n");
  }
  const marker = lines.findIndex((one) => one.includes(GENERATED_PAGE_MARKER));
  if (marker < 0) return held;
  return [...lines.slice(0, marker + 1), stamp, ...lines.slice(marker + 1)].join("\n");
}

/**
 * The command that laid a generated file down, as recorded after its fingerprint.
 *
 * <p>Written as the CLI arguments that reproduce the render (`scaffold user --module admin`), so
 * the generated-state report can run that command again in capture mode and compare.
 *
 * @param held what the file holds now
 * @returns the recorded arguments, or undefined for a file stamped before origins were recorded
 */
export function renderOrigin(held: string): string[] | undefined {
  const line = held.split("\n").find((one) => one.includes(GENERATED_HASH_MARKER));
  if (line === undefined) return undefined;
  const rest = new RegExp(`${GENERATED_HASH_MARKER}\\s+[0-9a-f]{12}\\s+(.+)$`).exec(line)?.[1]?.trim();
  return rest ? rest.split(/\s+/) : undefined;
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

/**
 * Writes one generated file under the rule every generated file follows: laid down when absent,
 * rewritten while its fingerprint matches, merged three-way into the edits once somebody has
 * edited it (see {@link writeStampedGenerated}).
 *
 * @param filePath where the file goes
 * @param rendered the fresh render, carrying {@link GENERATED_PAGE_MARKER}
 * @param origin the arguments that reproduce the render
 * @returns what writing the file came to
 */
export async function writeGenerated(filePath: string, rendered: string, origin?: string): Promise<GeneratedOutcome> {
  return (await writeStampedGenerated(filePath, stampFingerprint(rendered, origin))).outcome;
}
