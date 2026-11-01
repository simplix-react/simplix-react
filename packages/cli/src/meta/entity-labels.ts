import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { pathExists, writeFileWithDir } from "../utils/fs.js";
import { entityNameOf } from "./generation/endpoint-gen.js";
import type { ResolvedDomain, ResolvedType } from "./resolve.js";
import type { DtoMeta } from "./types.js";

/** The key a domain catalog holds an entity's singular name under, beside its `fields`. */
export const ENTITY_LABEL_KEY = "_label";
/** The key a domain catalog holds an entity's plural name under, beside its `fields`. */
export const ENTITY_PLURAL_KEY = "_plural";
/** The key a domain catalog holds an entity's description under: the sentence a screen's header carries. */
export const ENTITY_DESCRIPTION_KEY = "_description";

type Catalog = Record<string, unknown>;

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

/**
 * The types an entity's catalog is written from: every type its operations reach, less another
 * entity class a DTO holds as a reference and the ancestors only that class brought along. The
 * parent's screens read the reference's own label from the parent DTO and draw the referenced
 * record through its own catalog, so those fields are not the parent's to label.
 *
 * @param domain the domain whose types are read
 * @param entity the domain entity
 * @param document the SimpliX Meta document, which declares the entity classes; without it every
 *   reached type counts
 * @returns the entity's own types, in the order the domain lists them
 */
export function ownedTypesOf(
  domain: ResolvedDomain,
  entity: Pick<ResolvedDomain["entities"][number], "tag" | "operations">,
  document: DtoMeta | undefined,
): ResolvedType[] {
  const declared = document?.entities ?? {};
  const own = serverEntityOf(entity, new Set(Object.keys(declared)));
  const entityClasses = new Map(Object.entries(declared).map(([key, one]) => [one.javaClass, key]));
  const mine = [...(domain.types?.values() ?? [])].filter((type) => type.owner === entity.tag);
  const isForeign = (type: (typeof mine)[number]) => {
    const declaredAs = entityClasses.get(type.meta.javaClass);
    return declaredAs !== undefined && declaredAs !== own;
  };
  const foreign = new Set(mine.filter(isForeign).map((type) => type.name));
  // An ancestor a DTO of the entity's own also extends is still reached for that DTO.
  const sharedAncestors = new Set(mine.filter((type) => !isForeign(type)).flatMap((type) => type.ancestors));
  for (const type of mine.filter(isForeign)) {
    for (const ancestor of type.ancestors) if (!sharedAncestors.has(ancestor)) foreign.add(ancestor);
  }
  return mine.filter((type) => !foreign.has(type.name));
}

/**
 * The label each field of an entity's DTOs declares through a keyed `@FieldLabel`, in one locale.
 * The first DTO to name a field decides it, in the order the domain lists its types.
 *
 * @param domain the domain whose types are read
 * @param entity the entity the types belong to
 * @param document the SimpliX Meta document, which declares the entity classes
 * @param locale the locale to read
 * @returns field name to label
 */
function fieldLabelsOf(
  domain: ResolvedDomain,
  entity: ResolvedDomain["entities"][number],
  document: DtoMeta,
  locale: string,
): Map<string, string> {
  const labels = new Map<string, string>();
  for (const type of ownedTypesOf(domain, entity, document)) {
    for (const field of type.allFields) {
      const label = field.labels?.[locale];
      if (label !== undefined && !labels.has(field.name)) labels.set(field.name, label);
    }
  }
  return labels;
}

/**
 * Writes what SimpliX Meta calls each entity of a domain into the domain's locale catalogs, as
 * `<entity>._label`, `<entity>._plural` and `<entity>._description` beside the field labels, so a
 * screen titles and describes itself from the same `entity/<entity>` namespace as its field labels.
 *
 * <p>A field whose `@FieldLabel` names a key also gets that key's text under `fields`, which
 * labels a field only a DTO declares (a count, a derived name) in every locale the server
 * translates it in. Only those keys are written; every other key of the catalog is kept as it is.
 * A locale SimpliX Meta names no label for is left without one, so the reader sees the missing key
 * rather than another language's word.
 */
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
      const labels = fieldLabelsOf(domain, entity, document, locale);
      if (!meta && labels.size === 0) continue;
      const key = entityNameOf(entity.tag);
      const node = (typeof catalog[key] === "object" && catalog[key] !== null ? catalog[key] : {}) as Catalog;
      const names: ReadonlyArray<readonly [string, string | undefined]> = meta
        ? [
            [ENTITY_LABEL_KEY, meta.label?.[locale]],
            [ENTITY_PLURAL_KEY, meta.plural?.[locale]],
            [ENTITY_DESCRIPTION_KEY, meta.description?.[locale]],
          ]
        : [];
      for (const [catalogKey, value] of names) {
        if (value !== undefined && node[catalogKey] !== value) {
          node[catalogKey] = value;
          changed = true;
        }
      }
      if (labels.size > 0) {
        const fields = (typeof node.fields === "object" && node.fields !== null ? node.fields : {}) as Catalog;
        for (const [field, value] of labels) {
          if (fields[field] !== value) {
            fields[field] = value;
            changed = true;
          }
        }
        node.fields = fields;
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
