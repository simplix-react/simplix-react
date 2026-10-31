import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { pathExists, writeFileWithDir } from "../utils/fs.js";
import { entityNameOf } from "./generation/endpoint-gen.js";
import type { ResolvedDomain } from "./resolve.js";
import type { DtoMeta } from "./types.js";

/** The key a domain catalog holds an entity's singular name under, beside its `fields`. */
export const ENTITY_LABEL_KEY = "_label";
/** The key a domain catalog holds an entity's plural name under, beside its `fields`. */
export const ENTITY_PLURAL_KEY = "_plural";
/** The key a domain catalog holds an entity's description under: the sentence a screen's header carries. */
export const ENTITY_DESCRIPTION_KEY = "_description";

type Catalog = Record<string, unknown>;

/**
 * Writes what SimpliX Meta calls each entity of a domain into the domain's locale catalogs, as
 * `<entity>._label`, `<entity>._plural` and `<entity>._description` beside the field labels, so a
 * screen titles and describes itself from the same `entity/<entity>` namespace as its field labels.
 *
 * <p>Only those keys are written; every other key of the catalog is kept as it is. A locale
 * SimpliX Meta names no label for is left without one, so the reader sees the missing key rather
 * than another language's word.
 */
/**
 * The server entity whose labels a Meta entity carries: the one its tag names, or, for a second
 * surface over an entity that already has one (a tag `portal.order.MyOrder` whose operations all
 * name `Order`), the one its operations name. Undefined when neither names a single entity.
 *
 * @param entity the domain entity, its tag and operations
 * @param known the entity names the document declares
 * @returns the server entity's simple name
 */
export function serverEntityOf(
  entity: Pick<ResolvedDomain["entities"][number], "tag" | "operations">,
  known: ReadonlySet<string>,
): string | undefined {
  const simpleName = entity.tag.split(".").pop() ?? entity.tag;
  if (known.has(simpleName)) return simpleName;
  // Every operation the server documents names the entity class it serves; the type declares only
  // what the generators read, so the field is read through a widened view here.
  const operations = entity.operations as ReadonlyArray<{ readonly entity?: string }>;
  const named = [...new Set(operations.map((one) => one.entity).filter((one): one is string => Boolean(one)))];
  return named.length === 1 && known.has(named[0]!) ? named[0] : undefined;
}

export async function writeEntityLabels(
  targetDir: string,
  domain: ResolvedDomain,
  document: DtoMeta,
  locales: readonly string[],
): Promise<number> {
  const entities = document.entities ?? {};
  let written = 0;
  for (const locale of locales) {
    const path = join(targetDir, "src/locales", `${locale}.json`);
    if (!(await pathExists(path))) continue;
    const catalog = JSON.parse(await readFile(path, "utf-8")) as Catalog;
    let changed = false;
    for (const entity of domain.entities) {
      const source = serverEntityOf(entity, new Set(Object.keys(entities)));
      const meta = source === undefined ? undefined : entities[source];
      if (!meta) continue;
      const key = entityNameOf(entity.tag);
      const node = (typeof catalog[key] === "object" && catalog[key] !== null ? catalog[key] : {}) as Catalog;
      const names: ReadonlyArray<readonly [string, string | undefined]> = [
        [ENTITY_LABEL_KEY, meta.label?.[locale]],
        [ENTITY_PLURAL_KEY, meta.plural?.[locale]],
        [ENTITY_DESCRIPTION_KEY, meta.description?.[locale]],
      ];
      for (const [catalogKey, value] of names) {
        if (value !== undefined && node[catalogKey] !== value) {
          node[catalogKey] = value;
          changed = true;
        }
      }
      catalog[key] = node;
    }
    if (changed) {
      await writeFileWithDir(path, JSON.stringify(catalog, null, 2) + "\n");
      written += 1;
    }
  }
  return written;
}
