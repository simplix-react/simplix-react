import { resolve } from "node:path";

import {
  detectI18nFieldPairs,
  getDefaultValue,
  SYSTEM_FIELDS,
  type EntityOperations,
  type FieldInfo,
  type FilterFieldInfo,
} from "../commands/scaffold-crud.js";
import { loadConfig } from "../config/config-loader.js";
import type { CrudEntityConfig, OpenAPISpecConfig } from "../config/types.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import { resolveSpecConfig } from "../openapi/orchestration/resolve-spec-config.js";
import { isSpecUrl } from "../openapi/pipeline/parser.js";
import { getSpecProfile } from "../openapi/plugin-registry.js";
import { pathExists } from "../utils/fs.js";
import { fetchMeta } from "./fetch.js";
import { deriveFilterFields, readSearchFields } from "./filter-source.js";
import { innermostRef, payloadOf, refNameOf } from "./generation/emit.js";
import {
  entityNameOf,
  resolveEndpoints,
  type EndpointTarget,
} from "./generation/endpoint-gen.js";
import type { DtoMeta, FieldMeta, TypeRef } from "./types.js";
import { resolveMeta, type ResolvedDomain, type ResolvedType } from "./resolve.js";

/**
 * Which DTO a screen's fields were read from, and which side of the wire it is on.
 *
 * An entity that is written owns a request body and is scaffolded from it; one that is only read
 * owns none, and the record its detail route answers with is the whole of what a screen can show.
 */
export interface FieldSource {
  type: string;
  origin: "request" | "response";
}

/**
 * Everything the CRUD scaffolder reads out of one entity's slice of SimpliX Meta.
 *
 * The OpenAPI path learns the same things by matching regular expressions against orval's emitted
 * zod text and by reading its model files. Neither exists in a domain generated from SimpliX Meta, and
 * the text would not carry the answers anyway: an inherited DTO is emitted as
 * `Child = Parent.extend({ … })`, whose own fields are the only ones a `z.object(` pattern can
 * see, so every field a parent contributes disappears from the form without a word.
 */
export interface MetaScaffoldSource {
  domain: string;
  tag: string;
  entity: string;
  /** The DTO the fields were read from, or absent when SimpliX Meta states none for this entity. */
  fieldSource?: FieldSource;
  /** Inherited fields first, own fields last — the order a generated column list follows. */
  fields: FieldInfo[];
  operations: EntityOperations;
  /** Role → the hook's name without its `use` prefix, the shape `crud.config.ts` records. */
  roles: CrudEntityConfig;
  /** The DTO one row of the list is, or absent when no route returns a list of them. */
  listRowType?: string;
  treeRowType?: string;
  /**
   * Row property → its declared TypeScript type. A column may only render what the projection
   * returns, and an enum column names its enum from the type declared here.
   */
  rowProperties?: Map<string, string>;
  /** The field a row is addressed by, as the routes that address one name it. */
  rowIdField: string;
  /** The collection the entity's routes hang off, which is what a cache invalidation names. */
  entityPath: string;
  /** The field a record is named by on a screen. */
  displayNameField?: string;
  /** The field a reorder writes, as the reorder's own body declares it. */
  orderField?: string;
  updatePathParam?: string;
  deletePathParam?: string;
  filters: FilterFieldInfo[];
  /** Roles SimpliX Meta states that no generated screen reaches, reported rather than generated. */
  unreachableRoles: string[];
}

/** Roles the UI templates offer no affordance for: nothing generated sends these requests. */
const UNREACHABLE_ROLES = ["batchUpdate", "multiUpdate", "batchDelete"];

/** Field names a screen names a record by, tried before anything is inferred. */
const COMMON_NAME_FIELDS = ["name", "title", "label", "displayName"];

/** How long a `@Size(min = …)` has to be before a text field becomes a text area. */
const TEXTAREA_MIN_LENGTH = 100;

/**
 * Read one entity out of the committed SimpliX Meta, or `null` when nothing states it.
 *
 * Only a domain the spec lists under `meta.export` is read from SimpliX Meta: that list is what decides
 * whether the domain package's barrel carries the meta output or orval's, so it is also what
 * decides which of the two the scaffolded screen is written against.
 *
 * SimpliX Meta is read from disk and never from the network — a scaffold run has no backend to ask, and
 * the committed snapshot is what the domain package was generated from.
 */
export async function loadMetaScaffoldSource(
  rootDir: string,
  entity: string,
): Promise<MetaScaffoldSource | null> {
  const config = await loadConfig(rootDir);

  for (const spec of config.openapi ?? []) {
    const exported = new Set(spec.meta?.export ?? []);
    if (exported.size === 0) continue;

    const naming = resolveSpecConfig(spec).naming;
    if (!naming) continue;

    const document = await readCommittedMeta(rootDir, spec);
    if (!document) continue;

    const containerTypes = spec.profile ? getSpecProfile(spec.profile)?.containerTypes : undefined;
    const resolved = resolveMeta(document, {
      domains: spec.domains,
      containerTypes: containerTypes ?? {},
    });

    for (const domain of resolved.domains.values()) {
      if (!exported.has(domain.name)) continue;
      const tag = domain.entities.find((one) => entityNameOf(one.tag) === entity)?.tag;
      if (tag === undefined) continue;
      return buildMetaScaffoldSource({ domain, tag, naming });
    }
  }

  return null;
}

/**
 * SimpliX Meta a spec was last generated from, read from the snapshot it is committed as.
 *
 * A `source` that is a URL is left alone: the endpoint answers only while the backend is running,
 * and a scaffold that reached for it would generate one thing on a developer's machine and
 * another in a checkout.
 */
async function readCommittedMeta(
  rootDir: string,
  spec: OpenAPISpecConfig,
): Promise<DtoMeta | null> {
  const stated = spec.meta?.snapshot ?? spec.meta?.source;
  if (stated === undefined || isSpecUrl(stated)) return null;

  const path = resolve(rootDir, stated);
  if (!(await pathExists(path))) return null;
  return fetchMeta({ source: path });
}

export interface BuildMetaScaffoldSourceOptions {
  domain: ResolvedDomain;
  /** The tag the entity is, which is the whole of its identity in SimpliX Meta. */
  tag: string;
  /** Contributed by the spec profile, and the same one the domain package was generated with. */
  naming: OpenApiNamingStrategy;
}

/**
 * Resolve one tag's operations into everything the scaffolder's templates are rendered from.
 *
 * Nothing here reads the filesystem: the fields, the row type, the identifier and the filters are
 * all stated by SimpliX Meta, so a screen scaffolded before a package has ever been generated carries
 * the same columns as one scaffolded after.
 */
export function buildMetaScaffoldSource(
  options: BuildMetaScaffoldSourceOptions,
): MetaScaffoldSource {
  const { domain, tag, naming } = options;
  const entity = entityNameOf(tag);
  const targets =
    resolveEndpoints(domain, naming).find((one) => one.tag === tag)?.targets ?? [];

  const roles: CrudEntityConfig = {};
  for (const target of targets) {
    if (roles[target.role] === undefined) roles[target.role] = target.name;
  }

  const searchDto = searchDtoOf(domain, targets);
  const chosen = chooseFieldType(domain, targets);
  const fields = chosen ? fieldInfos(domain, chosen.type, searchDto) : [];

  const rowIdField = identifierOf(targets, fields);
  const listRow = rowTypeOf(domain, targets, ["list", "search", "getAll"]);
  const treeRow = rowTypeOf(domain, targets, ["tree", "subtree"]) ?? listRow;

  const source: MetaScaffoldSource = {
    domain: domain.name,
    tag,
    entity,
    fields,
    operations: {
      hasList: roles.list !== undefined,
      hasGet: roles.get !== undefined,
      hasCreate: roles.create !== undefined,
      hasUpdate: roles.update !== undefined,
      hasDelete: roles.delete !== undefined,
      hasTree: roles.tree !== undefined,
    },
    roles,
    rowIdField,
    entityPath: basePathOf(targets),
    filters: searchDto ? filtersOf(domain, searchDto) : [],
    unreachableRoles: UNREACHABLE_ROLES.filter((role) => roles[role] !== undefined),
  };

  if (chosen) source.fieldSource = { type: chosen.type.name, origin: chosen.origin };
  if (listRow) source.listRowType = listRow.name;
  if (treeRow) source.treeRowType = treeRow.name;
  if (listRow) source.rowProperties = propertiesOf(listRow);

  const display = displayNameOf(fields, rowIdField);
  if (display !== undefined) source.displayNameField = display;

  const order = orderFieldOf(domain, targets);
  if (order !== undefined) source.orderField = order;

  const update = lastPathParamOf(targets, "update");
  if (update !== undefined) source.updatePathParam = update;
  const remove = lastPathParamOf(targets, "delete");
  if (remove !== undefined) source.deletePathParam = remove;

  return source;
}

/**
 * The DTO an entity's screens are built from.
 *
 * A request body states what may be written, so it is the form, and the widest one is the record:
 * an entity's create and update bodies differ by the identifier the update addresses, and its
 * custom actions carry narrower bodies still. The comparison counts inherited fields, because the
 * SimpliX Meta's `fields` are a type's own and a child that adds one field to a parent's twenty is the
 * widest body an entity has while declaring the fewest.
 *
 * An entity with no body at all is read-only, and the record its routes answer with is the whole
 * of what a screen can show. That is the same DTO the mock store is typed with, resolved the same
 * way, so a scaffolded screen and the handlers it is developed against agree about the shape.
 *
 * A search DTO is never a body: SimpliX Meta carries it on `request.searchDto`, which is what makes the
 * filters of a route rather than the fields of a record.
 */
function chooseFieldType(
  domain: ResolvedDomain,
  targets: EndpointTarget[],
): { type: ResolvedType; origin: "request" | "response" } | undefined {
  let widest: ResolvedType | undefined;
  for (const target of targets) {
    const declared = typeOf(domain, innermostRef(target.operation.request.body));
    if (!declared) continue;
    if (!widest || scalarCount(declared) > scalarCount(widest)) widest = declared;
  }
  if (widest && scalarCount(widest) > 0) return { type: widest, origin: "request" };

  const record = recordTypeOf(domain, targets);
  return record && scalarCount(record) > 0 ? { type: record, origin: "response" } : undefined;
}

/**
 * The record an entity holds, taken from what it answers with.
 *
 * This is the mock generator's own rule, so the type a read-only screen renders is the type its
 * store carries: the payload of a GET that returns one object, preferring the route addressed by
 * an identifier, then the element of whatever a GET returns, then anything the entity answers
 * with. An owned singleton has no `get` role at all and still returns the record its screen reads,
 * which is why the response decides this rather than the role.
 */
function recordTypeOf(
  domain: ResolvedDomain,
  targets: EndpointTarget[],
): ResolvedType | undefined {
  const gets = targets.filter((one) => one.operation.method === "GET");
  const singles = gets.filter(
    (one) => refNameOf(payloadOf(one.operation.response, domain)) !== undefined,
  );
  const identified = singles.find((one) => /\{\w+\}$/.test(one.operation.path));
  const chosen = identified ?? singles[0];
  if (chosen) return typeOf(domain, payloadOf(chosen.operation.response, domain));

  return (
    firstDeclared(domain, gets.map((one) => one.operation.response)) ??
    firstDeclared(domain, targets.map((one) => one.operation.response))
  );
}

/** The row a list renders, which is the element of what the listing routes answer with. */
function rowTypeOf(
  domain: ResolvedDomain,
  targets: EndpointTarget[],
  roles: string[],
): ResolvedType | undefined {
  for (const role of roles) {
    const target = targets.find((one) => one.role === role);
    if (!target) continue;
    const found = typeOf(domain, innermostRef(target.operation.response));
    if (found) return found;
  }
  return undefined;
}

function firstDeclared(
  domain: ResolvedDomain,
  refs: (TypeRef | undefined)[],
): ResolvedType | undefined {
  for (const ref of refs) {
    const found = typeOf(domain, innermostRef(ref));
    if (found) return found;
  }
  return undefined;
}

function typeOf(domain: ResolvedDomain, ref: TypeRef | undefined): ResolvedType | undefined {
  const name = refNameOf(ref);
  return name === undefined ? undefined : domain.types.get(name);
}

/** A count of what a screen can render does not depend on what an enum's values are. */
const NO_ENUM_VALUES = (): undefined => undefined;

/** How many of a type's fields a screen can render, which is what makes one DTO wider. */
function scalarCount(type: ResolvedType): number {
  return type.allFields.filter((field) => shapeOf(field, NO_ENUM_VALUES) !== undefined).length;
}

/**
 * One DTO's fields as the scaffolder's templates read them, inherited ones first.
 *
 * The order is load-bearing: the column ordering pass sorts by category and keeps the arrival
 * order inside each one, so a closure written own-fields-first would reorder every column of
 * every entity whose DTO extends another.
 */
function fieldInfos(
  domain: ResolvedDomain,
  type: ResolvedType,
  searchDto: string | undefined,
): FieldInfo[] {
  const sortable = sortabilityOf(domain, searchDto);
  const fields: FieldInfo[] = [];

  for (const field of type.allFields) {
    const shape = shapeOf(field, (name) => enumValuesOf(domain, name));
    if (!shape) continue;

    const capitalizedName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    const isForeignKey =
      shape.tsType === "string" && field.name.endsWith("Id") && field.name !== "id";
    const one: FieldInfo = {
      name: field.name,
      capitalizedName,
      label: field.label ?? capitalizedName.replace(/_/g, " "),
      tsType: shape.tsType,
      formComponent: shape.formComponent,
      inputType: shape.inputType,
      component: shape.component,
      options: shape.options,
      defaultValue:
        shape.options.length > 0 ? `"${shape.options[0]}"` : getDefaultValue(shape.tsType),
      isForeignKey,
      fkEntityField: isForeignKey ? field.name.slice(0, -2) : null,
      isSystemField: SYSTEM_FIELDS.includes(field.name),
      isI18nPair: false,
      baseFieldName: null,
    };
    if (shape.enumTypeName !== undefined) one.enumTypeName = shape.enumTypeName;
    if (shape.columnFormat !== undefined) one.columnFormat = shape.columnFormat;
    if (shape.columnDisplay !== undefined) one.columnDisplay = shape.columnDisplay;
    if (sortable) one.sortable = sortable.get(field.name) ?? false;
    fields.push(one);
  }

  detectI18nFieldPairs(fields);
  return fields;
}

/** What a field is rendered with, or `undefined` for one no scalar control can carry. */
interface FieldShape {
  tsType: string;
  formComponent: string;
  inputType: string;
  component: string;
  options: string[];
  enumTypeName?: string;
  columnFormat?: "date" | "datetime" | "time";
  columnDisplay?: "boolean";
}

/** Plain text, which is what a field SimpliX Meta says nothing more specific about is written in. */
function textShape(): FieldShape {
  return {
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Text",
    options: [],
  };
}

/**
 * The control a field's declared type asks for.
 *
 * A field SimpliX Meta types as another DTO is left out: a nested record is not a scalar the form has a
 * control for, which is the same decision the OpenAPI path makes by skipping a `z.object(`.
 */
function shapeOf(
  field: FieldMeta,
  enumValues: (name: string) => string[] | undefined,
): FieldShape | undefined {
  return shapeOfRef(field.type, field, enumValues);
}

function shapeOfRef(
  ref: TypeRef,
  field: FieldMeta,
  enumValues: (name: string) => string[] | undefined,
): FieldShape | undefined {
  switch (ref.kind) {
    case "enum": {
      const options = enumValues(ref.name) ?? [];
      if (options.length === 0) return textShape();
      return {
        tsType: options.map((one) => `"${one}"`).join(" | "),
        formComponent: "SelectField",
        inputType: "text",
        component: "Select",
        options,
        enumTypeName: ref.name,
      };
    }
    case "boolean":
      return {
        tsType: "boolean",
        formComponent: "SwitchField",
        inputType: "checkbox",
        component: "Boolean",
        options: [],
        columnDisplay: "boolean",
      };
    case "instant":
    case "date":
    case "time":
      // A moment, a day and a clock time all arrive as their ISO text, and the column says which
      // of the three it is showing rather than printing the text back at the operator.
      return {
        tsType: "string",
        formComponent: "DateField",
        inputType: "date",
        component: "Date",
        options: [],
        columnFormat: ref.kind === "instant" ? "datetime" : ref.kind,
      };
    case "number":
      return {
        tsType: "number",
        formComponent: "NumberField",
        inputType: "number",
        component: "Number",
        options: [],
      };
    case "string":
      return stringShape(field);
    case "container": {
      // A `Map<String, String>` is how the backend carries a field's translations, and the pair
      // of it and the plain field beside it is what the i18n controls are rendered from.
      if (ref.name === "Map" && ref.args[0]?.kind === "string") {
        return {
          tsType: "Record<string, string>",
          formComponent: "I18nTextField",
          inputType: "text",
          component: "I18nText",
          options: [],
        };
      }
      // A collection is edited and shown as its element: `List<String>` is text and
      // `List<SomeEnum>` is a choice, while a list of records is not a scalar field at all.
      if (ref.args.length === 1) return shapeOfRef(ref.args[0], field, enumValues);
      return textShape();
    }
    case "file":
    case "binary":
    case "unknown":
      return textShape();
    default:
      // `ref` is a nested record, `pick` a subset of one, and `param` a type variable the
      // enclosing generic never bound. None of the three is a control.
      return undefined;
  }
}

/** A string long enough to be written in is written in a text area. */
function stringShape(field: FieldMeta): FieldShape {
  for (const constraint of field.constraints ?? []) {
    if (constraint.kind === "email") return { ...textShape(), inputType: "email" };
    if (
      constraint.kind === "minLength" &&
      typeof constraint.value === "number" &&
      constraint.value >= TEXTAREA_MIN_LENGTH
    ) {
      return { ...textShape(), formComponent: "TextareaField" };
    }
  }
  return textShape();
}

function enumValuesOf(domain: ResolvedDomain, name: string): string[] | undefined {
  return domain.enums.get(name)?.meta.values.map((value) => value.name);
}

/**
 * Which fields the backend can order a list by, from the search DTO that defines the listing.
 *
 * A column offering a sort the backend does not implement sends `sort=field.asc`, the server
 * ignores it, and the arrow moves while the rows stay where they were — so a field the search DTO
 * does not declare is not sortable either, rather than unknown.
 */
function sortabilityOf(
  domain: ResolvedDomain,
  searchDto: string | undefined,
): Map<string, boolean> | undefined {
  if (searchDto === undefined) return undefined;
  const type = domain.types.get(searchDto);
  if (!type) return undefined;

  const sortable = new Map<string, boolean>();
  for (const field of type.allFields) {
    if (field.searchable) sortable.set(field.name, field.searchable.sortable);
  }
  return sortable;
}

/** The DTO whose searchable fields define the listing's filters. */
function searchDtoOf(domain: ResolvedDomain, targets: EndpointTarget[]): string | undefined {
  for (const role of ["list", "search"]) {
    const stated = targets.find((one) => one.role === role)?.operation.request.searchDto;
    if (stated !== undefined && domain.types.has(stated)) return stated;
  }
  return targets.find((one) => one.operation.request.searchDto !== undefined)?.operation.request
    .searchDto;
}

function filtersOf(domain: ResolvedDomain, searchDto: string): FilterFieldInfo[] {
  const declared = (domain.types.get(searchDto)?.allFields ?? []).filter(
    (field) => field.searchable,
  );
  const read = readSearchFields(declared, (name) => enumValuesOf(domain, name));
  return deriveFilterFields(read.fields).filters;
}

/** Row property → its declared TypeScript type, which is where an enum column names its enum. */
function propertiesOf(type: ResolvedType): Map<string, string> {
  return new Map(type.allFields.map((field) => [field.name, declaredType(field.type)]));
}

function declaredType(ref: TypeRef): string {
  switch (ref.kind) {
    case "enum":
    case "ref":
      return ref.name;
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "container":
      if (ref.name === "Map") {
        return `Record<string, ${ref.args[0] ? declaredType(ref.args[0]) : "unknown"}>`;
      }
      return ref.args.length === 1 ? `${declaredType(ref.args[0])}[]` : "unknown";
    default:
      return "string";
  }
}

/**
 * The field a record is named by on a screen.
 *
 * A field with an `…I18n` sibling is the human-facing text by construction — nothing else on the
 * record is translated — so it is asked before the first string field is guessed at. The guess is
 * what puts a foreign key in a delete confirmation: an identifier is a string and is usually
 * declared first, and it reads the same on every row.
 */
function displayNameOf(fields: FieldInfo[], rowIdField: string): string | undefined {
  const parentField = fields.find(
    (one) => one.name.toLowerCase().includes("parent") && one.name.toLowerCase().endsWith("id"),
  )?.name;

  return (
    fields.find((one) => COMMON_NAME_FIELDS.includes(one.name) && one.tsType === "string")?.name ??
    fields.find((one) => one.isI18nPair)?.name ??
    fields.find(
      (one) => one.tsType === "string" && one.name !== rowIdField && one.name !== parentField,
    )?.name
  );
}

/**
 * The field a row is addressed by, taken from the routes that address one: a delete and a read of
 * one record both name the identifier in their path, and the record declares it under that name.
 */
function identifierOf(targets: EndpointTarget[], fields: FieldInfo[]): string {
  for (const role of ["get", "delete", "update", "getForEdit", "subtree"]) {
    const named = lastPathParamOf(targets, role);
    if (named !== undefined) return named;
  }

  // No route addresses a single record. A census or a singleton is read and written whole, and
  // the record's own key is all that is left to identify a row by.
  return (
    fields.find((one) => one.name.toLowerCase() === "id")?.name ??
    fields.find((one) => /[A-Za-z]Id$/.test(one.name))?.name ??
    "id"
  );
}

function lastPathParamOf(targets: EndpointTarget[], role: string): string | undefined {
  return targets.find((one) => one.role === role)?.operation.request.path.at(-1)?.name;
}

/**
 * The field a reorder writes, read from the reorder's own body rather than guessed from the
 * record: a guess that falls back to a literal writes a property the DTO does not declare.
 */
function orderFieldOf(domain: ResolvedDomain, targets: EndpointTarget[]): string | undefined {
  const body = targets.find((one) => one.role === "order")?.operation.request.body;
  const dto = typeOf(domain, innermostRef(body));
  // A reorder body is a pair: the row's key and the position written to it. The key is whichever
  // member is named for one, and the other member is the position.
  return dto?.allFields.find((field) => !field.name.toLowerCase().endsWith("id"))?.name;
}

/**
 * The collection an entity's routes hang off, which a cache invalidation names.
 *
 * It is the segments every one of the entity's routes shares, stopping where a path parameter
 * begins — the actions are spelled differently per route and the collection is not.
 */
function basePathOf(targets: EndpointTarget[]): string {
  const paths = targets.map((one) => one.operation.path.split("/").filter(Boolean));
  if (paths.length === 0) return "/";

  const base: string[] = [];
  for (let at = 0; at < paths[0].length; at += 1) {
    const segment = paths[0][at];
    if (segment.startsWith("{")) break;
    if (!paths.every((path) => path[at] === segment)) break;
    base.push(segment);
  }
  return `/${base.join("/")}`;
}
