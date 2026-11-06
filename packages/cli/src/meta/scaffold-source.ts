import { resolve } from "node:path";

import {
  detectI18nFieldPairs,
  getDefaultValue,
  SYSTEM_FIELDS,
  AUDIT_FIELDS,
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
import { deriveFilterFields, hasKeywordSearch, readSearchFields } from "./filter-source.js";
import { innermostRef, payloadOf, refNameOf } from "./generation/emit.js";
import {
  entityNameOf,
  resolveEndpoints,
  type EndpointTarget,
} from "./generation/endpoint-gen.js";
import type { AccessMeta, DtoMeta, FieldMeta, TypeRef } from "./types.js";
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
  /** The record a detail reads, from the DTO its get route answers with; absent when none is stated. */
  detailFields?: FieldInfo[];
  /** One list row, from the DTO the list route answers with, which holds what the server derives for a row; absent when none is stated. */
  rowFields?: FieldInfo[];
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
  /** The field a record is named by on a screen: the first its entity declares in `nameFields`, else inferred from the field names. */
  displayNameField?: string;
  /** Every field the record is named by, in order, when its entity declares them; a screen joins them with a space. */
  displayNameFields?: string[];
  /** The field a reorder writes, as the reorder's own body declares it. */
  orderField?: string;
  /** The order the entity declares its list opens in. */
  defaultSort?: { field: string; direction?: "asc" | "desc" };
  /** The fields the entity's status counts are read by, as its Meta states them. */
  statusCounts?: string[];
  /** The figures the entity's aggregates read answers with, in order. */
  aggregates?: { field: string; op: string }[];
  /**
   * The list's time range counts: the field its search operation's Meta names as its time axis,
   * and the request function of the `GET <base>/counts` beside it. Absent unless both exist.
   */
  timeBuckets?: { field: string; fetch: string };
  updatePathParam?: string;
  deletePathParam?: string;
  filters: FilterFieldInfo[];
  /** Whether the list route takes a keyword search, which is what the list's search box sends. */
  keywordSearch: boolean;
  /** Roles SimpliX Meta states that no generated screen reaches, reported rather than generated. */
  unreachableRoles: string[];
  /**
   * The entity's fields that hold another record's key, as the referenced entities' `holders`
   * state them, plus every key whose record arrives nested beside it.
   */
  relationFields?: string[];
  /** What the list (or search) operation requires of the caller, as SimpliX Meta states it. */
  listAccess?: AccessMeta;
  /** The reference name paths Meta does not declare and the scaffold guessed, as `key → path`. */
  inferredReferenceNames?: Record<string, string>;
  /** Declared references the scaffold paired with a name field beside them that Meta does not state, as `key → field`. */
  inferredReferenceNameFields?: Record<string, string>;
  /** Keys Meta declares no reference for and the scaffold still draws as one, by their `<stem>Name` sibling, as `key → field`. */
  undeclaredReferences?: Record<string, string>;
  /** The fields the create body requires, which the form must carry. */
  createRequired?: string[];
  /**
   * The fields the create body requires that no generated control draws: a list of records or a nested
   * record (`axes: { axisId, targetId }[]`). The scaffolded form has no entry for them, so the screen
   * must write them by hand.
   */
  createStructured?: string[];
  /** Locale → the entity's plural name, as SimpliX Meta states it. */
  plural?: Record<string, string>;
}

/** Roles the UI templates offer no affordance for: nothing generated sends these requests. */
const UNREACHABLE_ROLES = ["batchUpdate", "multiUpdate", "batchDelete"];

/** Field names a screen names a record by, tried before anything is inferred. */
const COMMON_NAME_FIELDS = ["name", "title", "label", "displayName"];

/** How long a `@Size(min = …)` has to be before a text field becomes a text area. */
const TEXTAREA_MIN_LENGTH = 100;

/** How long a `@Size(max = …)` has to allow before a text field becomes a text area: room for paragraphs. */
const TEXTAREA_MAX_LENGTH = 500;

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
    // A config that names a meta source and no OpenAPI `spec` puts every domain on SimpliX Meta;
    // `meta.export` narrows that only where the two halves are both declared.
    const metaOnly = spec.meta !== undefined && spec.spec === undefined;
    const exported = new Set(spec.meta?.export ?? (metaOnly ? Object.keys(spec.domains ?? {}) : []));
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
      const source = buildMetaScaffoldSource({ domain, tag, naming });
      const entityName = tag.split(".").pop() ?? tag;
      source.relationFields = relationFieldsOf(document, entityName, source);
      withReferenceKeys(document, source);
      source.inferredReferenceNames = withReferenceNames(document, source);
      const flat = withFlatReferenceNames(document, entityName, source);
      source.inferredReferenceNameFields = flat.inferred;
      source.undeclaredReferences = flat.undeclared;
      withNameField(document, entityName, source);
      const defaultSort = document.entities?.[entityName]?.defaultSort;
      if (defaultSort && !source.defaultSort) source.defaultSort = defaultSort;
      const figures = document.entities?.[entityName];
      if (figures?.statusCounts?.length) source.statusCounts = [...figures.statusCounts];
      if (figures?.aggregates?.length) source.aggregates = figures.aggregates.map((one) => ({ ...one }));
      const plural = document.entities?.[entityName]?.plural;
      if (plural) source.plural = plural;
      return source;
    }
  }

  return null;
}

/**
 * Names the record by the fields its entity declares, in order, ahead of the guess
 * `buildMetaScaffoldSource` makes from the field names. A declaration naming a field the list row
 * does not draw is not used: a delete confirmation reading it would name every record by a part
 * that is never there, and the guess still names them.
 */
export function withNameField(document: DtoMeta, entityName: string, source: MetaScaffoldSource): void {
  const declared = document.entities?.[entityName]?.nameFields;
  if (declared === undefined || declared.length === 0) return;
  const drawn = source.rowFields ?? source.fields;
  if (!declared.every((name) => drawn.some((one) => one.name === name))) return;
  source.displayNameField = declared[0];
  source.displayNameFields = [...declared];
}

/**
 * Gives each reference matched on another field of its target than the identifier that field as
 * `peekBy`; one matched on the identifier needs none.
 */
export function withReferenceKeys(document: DtoMeta, source: MetaScaffoldSource): void {
  for (const one of [...source.fields, ...(source.detailFields ?? []), ...(source.rowFields ?? [])]) {
    // A kind whose entity SimpliX Meta serves no surface for has no peek to open, so its records
    // are drawn by name alone.
    if (one.referenceKinds) {
      const served = one.referenceKinds.kinds.filter(
        (kind) => document.entities?.[kind.peekKind.charAt(0).toUpperCase() + kind.peekKind.slice(1)] !== undefined,
      );
      one.referenceKinds = { ...one.referenceKinds, kinds: served };
    }
    const match = one.referenceMatch;
    if (match === undefined || one.referencePeekKind === undefined) continue;
    const pascal = one.referencePeekKind.charAt(0).toUpperCase() + one.referencePeekKind.slice(1);
    const idField = document.entities?.[pascal]?.idField;
    if (idField !== undefined && match !== idField) one.peekBy = match;
  }
}

/**
 * Settles the name path of every reference against what SimpliX Meta declares.
 *
 * <p>A key whose record arrives nested is named by the field its referenced entity declares in
 * `nameFields`, ahead of the guess made from the nested type's field names: the nested type lists
 * every property of the entity, including ones the serializer leaves out of a nested record, so a
 * guessed path can resolve against the model and still draw nothing. A key the request body states
 * (a form's) has no nested record beside it, so it takes the path its record's row states for the
 * same key.
 *
 * @param document the committed SimpliX Meta
 * @param source the entity's scaffold source, changed in place
 * @returns the paths that stayed guesses, as `field → path`, for the scaffold to report
 */
export function withReferenceNames(document: DtoMeta, source: MetaScaffoldSource): Record<string, string> {
  const inferred: Record<string, string> = {};
  const record = [...(source.rowFields ?? []), ...(source.detailFields ?? [])];
  for (const one of [...source.fields, ...(source.detailFields ?? []), ...(source.rowFields ?? [])]) {
    if (one.referenceNamePath === undefined && one.isForeignKey && one.referencePeekKind !== undefined) {
      const nested = record.find((other) => other.name === one.name && other.referenceNamePath !== undefined);
      if (nested?.referenceNamePath !== undefined) {
        one.referenceNamePath = nested.referenceNamePath;
        one.referenceNameSource = nested.referenceNameSource;
      }
    }
    if (one.referenceNamePath === undefined || one.fkEntityField === null || one.referencePeekKind === undefined) continue;
    // A path the reference states starts at the holding row and is taken as it is.
    if (one.referenceNameSource === "declared" && (one.referenceDeclared || one.referenceNamePath.split(".")[0] === one.fkEntityField)) continue;
    const pascal = one.referencePeekKind.charAt(0).toUpperCase() + one.referencePeekKind.slice(1);
    const declared = document.entities?.[pascal]?.nameFields?.[0];
    if (declared !== undefined) {
      one.referenceNamePath = `${one.fkEntityField}.${declared}`;
      one.referenceNameSource = "declared";
    } else if (one.referenceNameSource !== "declared") {
      one.referenceNameSource = "inferred";
      inferred[one.name] = one.referenceNamePath;
    }
  }
  return inferred;
}

/** What {@link withFlatReferenceNames} paired by a guess, for the scaffold to report. */
export interface FlatReferenceNames {
  /**
   * Declared reference → the field beside it the scaffold paired as its name by the target entity's
   * name field, which neither the reference nor the `<stem>Name` convention states.
   */
  readonly inferred: Record<string, string>;
  /** Key Meta declares no reference for → the `<stem>Name` sibling it is still drawn by. */
  readonly undeclared: Record<string, string>;
}

/**
 * Names each reference that SimpliX Meta declares and names no record for by a field beside it on
 * the same record, where one can be paired without the reference stating it.
 *
 * <p>The pairing tries the key's stem (`creditAccountName` beside `creditAccountId`), then the
 * field the referenced entity declares its own name by (`ownerName` for an entity named by its
 * owner), only where the row carries it, no other reference of the row targets that entity, it is
 * not the holding record's own name and no other reference already draws it; only this second
 * pairing is reported, since the stem is the backend's convention. A reference neither
 * reaches keeps no name and is drawn by its id. A key that states no reference is left to the
 * scaffold's `<stem>Name` guess and reported here as undeclared.
 *
 * @param document the committed SimpliX Meta
 * @param entityName the holding entity (`CreditLedgerEntry`)
 * @param source the entity's scaffold source, changed in place
 */
export function withFlatReferenceNames(document: DtoMeta, entityName: string, source: MetaScaffoldSource): FlatReferenceNames {
  const inferred: Record<string, string> = {};
  const undeclared: Record<string, string> = {};
  const ownNames = new Set(document.entities?.[entityName]?.nameFields ?? []);
  // The request body is a record of its own where it carries a name beside a key.
  const records = [source.rowFields ?? [], source.detailFields ?? [], source.fields];
  const unnamed = (one: FieldInfo) =>
    one.isForeignKey && one.fkEntityField !== null && one.referenceNamePath === undefined && one.referenceNameField === undefined;
  const pair = (one: FieldInfo, name: string, reported: boolean) => {
    one.referenceNameField = name;
    one.referenceNameSource = "inferred";
    if (reported) inferred[one.name] = name;
  };
  for (const record of records) {
    const text = new Set(record.filter((one) => one.tsType === "string" && !one.isForeignKey).map((one) => one.name));
    for (const one of record) {
      if (!unnamed(one)) continue;
      const stem = [`${one.fkEntityField}Name`, `${one.fkEntityField}DisplayName`].find((name) => text.has(name));
      if (stem === undefined) continue;
      // `<stem>Name` beside `<stem>Id` is the backend's convention for a reference's name, which
      // a reference declares a `nameField` only to depart from, so the pairing is not reported.
      if (one.referenceDeclared) pair(one, stem, false);
      else undeclared[one.name] = stem;
    }
    const claimed = new Set(record.map((one) => one.referenceNameField).filter((one): one is string => one !== undefined));
    for (const one of record) {
      if (!unnamed(one) || !one.referenceDeclared || one.referencePeekKind === undefined) continue;
      const kind = one.referencePeekKind;
      const targetName = document.entities?.[kind.charAt(0).toUpperCase() + kind.slice(1)]?.nameFields?.[0];
      if (targetName === undefined || !text.has(targetName) || ownNames.has(targetName) || claimed.has(targetName)) continue;
      if (record.filter((other) => other.referenceDeclared && other.referencePeekKind === kind).length !== 1) continue;
      pair(one, targetName, true);
      claimed.add(targetName);
    }
  }
  // A request body carries no name beside its keys; its key takes the name the record settled.
  for (const one of source.fields) {
    if (!unnamed(one)) continue;
    const settled = [...(source.rowFields ?? []), ...(source.detailFields ?? [])].find((other) => other.name === one.name && other.referenceNameField !== undefined);
    if (settled === undefined) continue;
    one.referenceNameField = settled.referenceNameField;
    one.referenceNameSource = settled.referenceNameSource;
  }
  return { inferred, undeclared };
}

/**
 * The fields of `holderEntity` that hold another record's key: every `holders` entry naming it,
 * and every key the source already reads as a nested reference.
 */
export function relationFieldsOf(document: DtoMeta, holderEntity: string, source: MetaScaffoldSource): string[] {
  const out = new Set<string>();
  for (const entity of Object.values(document.entities ?? {})) {
    for (const holder of entity.holders ?? []) if (holder.entity === holderEntity) out.add(holder.field);
  }
  for (const one of [...source.fields, ...(source.detailFields ?? []), ...(source.rowFields ?? [])]) {
    if (one.referenceNamePath || one.referenceMatch !== undefined || one.referenceKinds !== undefined) out.add(one.name);
  }
  return [...out].sort();
}

/** One entity whose records point back at the scaffolded one, as SimpliX Meta's `holders` state it. */
export interface MetaHolderSource {
  /** The holding entity as the contract names it (`userAccount`). */
  entity: string;
  /** The holder's field that carries the scaffolded record's key (`positionId`). */
  field: string;
  /** The search operator the forced narrowing uses, lower-case (`equals`). */
  operator: string;
  source: MetaScaffoldSource;
}

/**
 * The entities that hold `entity`, each with the scaffold source its own list is drawn from.
 *
 * <p>A holder whose tag no exported domain carries, or whose search takes neither `EQUALS` nor
 * `IN`, is left out: the sub-list could not be asked for.
 */
export async function loadMetaHolders(rootDir: string, entity: string): Promise<MetaHolderSource[]> {
  const config = await loadConfig(rootDir);
  for (const spec of config.openapi ?? []) {
    const metaOnly = spec.meta !== undefined && spec.spec === undefined;
    const exported = new Set(spec.meta?.export ?? (metaOnly ? Object.keys(spec.domains ?? {}) : []));
    if (exported.size === 0) continue;
    const naming = resolveSpecConfig(spec).naming;
    if (!naming) continue;
    const document = await readCommittedMeta(rootDir, spec);
    if (!document) continue;
    const pascal = entity.charAt(0).toUpperCase() + entity.slice(1);
    const holders = document.entities?.[pascal]?.holders ?? [];
    if (holders.length === 0) continue;
    const containerTypes = spec.profile ? getSpecProfile(spec.profile)?.containerTypes : undefined;
    const resolved = resolveMeta(document, { domains: spec.domains, containerTypes: containerTypes ?? {} });
    const out: MetaHolderSource[] = [];
    for (const holder of holders) {
      const operator = holder.operators.includes("EQUALS") ? "equals" : holder.operators.includes("IN") ? "in" : undefined;
      if (!operator) continue;
      for (const domain of resolved.domains.values()) {
        if (!exported.has(domain.name)) continue;
        const tag = domain.entities.find((one) => one.tag.split(".").pop() === holder.entity)?.tag;
        if (tag === undefined) continue;
        const source = buildMetaScaffoldSource({ domain, tag, naming });
        withReferenceKeys(document, source);
        // A holder's sub-list draws its references as its own list does.
        withFlatReferenceNames(document, holder.entity, source);
        withNameField(document, holder.entity, source);
        const holderSort = document.entities?.[holder.entity]?.defaultSort;
        if (holderSort && !source.defaultSort) source.defaultSort = holderSort;
        source.relationFields = relationFieldsOf(document, holder.entity, source);
        out.push({ entity: entityNameOf(tag), field: holder.field, operator, source });
        break;
      }
    }
    return out;
  }
  return [];
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

  const listTarget = targets.find((one) => one.role === "list") ?? targets.find((one) => one.role === "search");
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
    keywordSearch: searchDto ? hasKeywordSearch(domain.types.get(searchDto)?.allFields ?? []) : false,
    unreachableRoles: UNREACHABLE_ROLES.filter((role) => roles[role] !== undefined),
    ...(listTarget ? { listAccess: listTarget.operation.access } : {}),
    // The list's own operation names its order first: two lists over one entity (an operator's and
    // a portal's) can open in different orders, and the entity holds only one.
    ...(listTarget?.operation.defaultSort ? { defaultSort: listTarget.operation.defaultSort } : {}),
  };
  const timeBuckets = timeBucketsOf(targets, listTarget);
  if (timeBuckets) source.timeBuckets = timeBuckets;

  if (chosen) source.fieldSource = { type: chosen.type.name, origin: chosen.origin };
  const record = recordTypeOf(domain, targets);
  if (record && scalarCount(record) > 0) source.detailFields = fieldInfos(domain, record, searchDto);
  if (listRow) source.listRowType = listRow.name;
  if (treeRow) source.treeRowType = treeRow.name;
  if (listRow) source.rowProperties = propertiesOf(listRow);
  if (listRow && scalarCount(listRow) > 0) source.rowFields = fieldInfos(domain, listRow, searchDto);

  const display = displayNameOf(fields, rowIdField);
  if (display !== undefined) source.displayNameField = display;

  const created = targets.find((one) => one.role === "create");
  const createBody = created ? typeOf(domain, innermostRef(created.operation.request.body)) : undefined;
  if (createBody) {
    source.createRequired = createBody.allFields
      .filter((one) => one.required && shapeOf(one, NO_ENUM_VALUES) !== undefined)
      .map((one) => one.name);
    source.createStructured = createBody.allFields
      .filter((one) => one.required && shapeOf(one, NO_ENUM_VALUES) === undefined)
      .map((one) => one.name);
  }

  const order = orderFieldOf(domain, targets);
  if (order !== undefined) source.orderField = order;

  const update = lastPathParamOf(targets, "update");
  if (update !== undefined) source.updatePathParam = update;
  const remove = lastPathParamOf(targets, "delete");
  if (remove !== undefined) source.deletePathParam = remove;

  return source;
}

/** The roles whose body is the record as it is written: the create and the update. */
const FORM_ROLES = new Set(["create", "update"]);

/**
 * The DTO an entity's screens are built from.
 *
 * A request body states what may be written, so it is the form, and the widest one is the record:
 * an entity's create and update bodies differ by the identifier the update addresses. A custom
 * action's body is never the form, so an entity written only through actions is read from the
 * record it answers with. The comparison counts inherited fields, because the
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
    // A custom action's body (an adjust, an approve) states what that one command takes, not
    // what the record is; read as the form, it names the record by the action's reason field.
    if (!FORM_ROLES.has(target.role)) continue;
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
    const alias = sortAliasOf(domain, searchDto, field.name);
    if (alias) one.sortAlias = alias;
    if (field.format === "code") one.isCode = true;
    if (field.format === "money" && field.money && shape.tsType === "number") one.money = { ...field.money };
    if (field.format === "secret" && shape.tsType === "string") one.secret = true;
    const figure = figureKindOf(field.format, shape.tsType);
    if (figure) one.figureKind = figure;
    if (field.required) one.required = true;
    if (field.defaultValue !== undefined) one.defaultLiteral = JSON.stringify(field.defaultValue);
    // A key the contract names as another entity's, whatever its own name: drawn by that record's
    // name and opening its peek. A reference matched on another field than the identifier says so.
    if (field.reference?.kindField && field.reference.kinds && shape.tsType === "string") {
      // The kind field's value picks the entity per record, so the key opens a peek per kind.
      one.isForeignKey = true;
      one.referenceDeclared = true;
      one.fkEntityField = one.fkEntityField ?? field.name;
      one.referenceKinds = {
        field: field.reference.kindField,
        kinds: Object.entries(field.reference.kinds).map(([value, entity]) => ({
          value,
          peekKind: entity.charAt(0).toLowerCase() + entity.slice(1),
        })),
      };
    } else if (field.reference?.entity && !field.reference.many && shape.tsType === "string") {
      const target = field.reference.entity.charAt(0).toLowerCase() + field.reference.entity.slice(1);
      one.isForeignKey = true;
      one.referenceDeclared = true;
      // A key named `<stem>Id` keeps its stem, which is what its name field is named after
      // (`userId` beside `userName`); any other name is named after the referenced entity.
      one.fkEntityField = one.fkEntityField ?? target;
      one.referencePeekKind = target;
      one.referenceMatch = field.reference.idField;
    }
    // The name the reference states is a path from this record: a field beside the key
    // (`actorName`), or a path through a record nested in it (`plan.name`).
    const statedName = one.referenceDeclared ? field.reference?.nameField : undefined;
    if (statedName?.includes(".")) {
      one.referenceNamePath = statedName;
      one.referenceNameSource = "declared";
    } else if (statedName !== undefined && type.allFields.some((other) => other.name === statedName)) {
      one.referenceNameField = statedName;
      one.referenceNameSource = "declared";
    }
    const maxLength = field.constraints?.find((one) => one.kind === "maxLength")?.value;
    if (typeof maxLength === "number") one.maxLength = maxLength;
    fields.push(one);
  }

  // A key whose record also arrives nested beside it (`positionId` next to `position`) names that
  // record, so the key is drawn by the nested record's name and opens it.
  for (const one of fields) {
    if (!one.isForeignKey || !one.fkEntityField) continue;
    // A name the reference states is settled already.
    if (one.referenceNameSource === "declared") continue;
    const nested = type.allFields.find((field) => field.name === one.fkEntityField);
    const nestedType = nested ? typeOf(domain, nested.type) : undefined;
    if (!nestedType) continue;
    // The referenced entity's declared name fields are read in `withReferenceNames`; only a guess
    // from the nested type's field names is marked as one, since a serializer may leave such a
    // field out of the nested record.
    const name = referenceNameOf(nestedType);
    if (!name) continue;
    one.referenceNamePath = `${one.fkEntityField}.${name}`;
    one.referenceNameSource = "inferred";
    // The peek a reference opens is named after the referenced entity, which the nested DTO names
    // with any `DTO` / `Dto` suffix removed.
    const entityName = nestedType.name.replace(/(Detail|List)?(DTO|Dto)$/, "");
    one.referencePeekKind = entityName.charAt(0).toLowerCase() + entityName.slice(1);
  }

  detectI18nFieldPairs(fields);
  return fields;
}

/**
 * The field a nested record is named by: a common name field, then a field whose name ends in
 * `Name`, then the first plain text field that is neither a key nor an audit stamp.
 */
function referenceNameOf(type: ResolvedType): string | undefined {
  const text = type.allFields
    .filter((field) => !AUDIT_FIELDS.includes(field.name) && !field.name.toLowerCase().endsWith("id"))
    .filter((field) => {
      const shape = shapeOf(field, NO_ENUM_VALUES);
      return shape?.tsType === "string" && shape.columnFormat === undefined;
    })
    .map((field) => field.name);
  return (
    text.find((one) => COMMON_NAME_FIELDS.includes(one)) ??
    text.find((one) => one.endsWith("Name")) ??
    text[0]
  );
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
      // Any other map is a structured value (a stored provider payload), drawn as JSON rather than
      // as its value type, which would print `[object Object]`.
      if (ref.name === "Map") {
        return {
          tsType: "Record<string, unknown>",
          formComponent: "TextareaField",
          inputType: "text",
          component: "Text",
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
export function stringShape(field: FieldMeta): FieldShape {
  for (const constraint of field.constraints ?? []) {
    if (constraint.kind === "email") return { ...textShape(), inputType: "email" };
    if (
      constraint.kind === "minLength" &&
      typeof constraint.value === "number" &&
      constraint.value >= TEXTAREA_MIN_LENGTH
    ) {
      return { ...textShape(), formComponent: "TextareaField" };
    }
    if (constraint.kind === "maxLength" && typeof constraint.value === "number" && constraint.value >= TEXTAREA_MAX_LENGTH) {
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
 * The per-language sort keys the search DTO names for `name` (`searchable.sortAlias`), when it
 * names any. A translated name is not sortable itself; its alias for the reader's language is.
 */
function sortAliasOf(domain: ResolvedDomain, searchDto: string | undefined, name: string): Record<string, string> | undefined {
  if (searchDto === undefined) return undefined;
  const field = domain.types.get(searchDto)?.allFields.find((one) => one.name === name);
  const alias = field?.searchable?.sortAlias;
  return alias && Object.keys(alias).length > 0 ? { ...alias } : undefined;
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
/**
 * The list's time range counts, from the search operation that declares a time axis and the
 * `GET .../counts` read under the same path as that search.
 */
export function timeBucketsOf(targets: readonly EndpointTarget[], listTarget: EndpointTarget | undefined): { field: string; fetch: string } | undefined {
  const declaring = [listTarget, ...targets].find((one) => one?.operation.timeAxis);
  const field = declaring?.operation.timeAxis;
  if (!declaring || !field) return undefined;
  const base = declaring.operation.path.replace(/\/search$/, "");
  const counts = targets.find((one) => one.operation.method === "GET" && one.operation.path === `${base}/counts`);
  return counts ? { field, fetch: counts.name } : undefined;
}

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

/** The figure kind a field's SimpliX Meta `format` names, where its type can carry it. */
export function figureKindOf(format: string | undefined, tsType: string): FieldInfo["figureKind"] {
  if (tsType === "number" && (format === "credits" || format === "bytes" || format === "duration")) return format;
  if (tsType === "string" && format === "excerpt") return "excerpt";
  return undefined;
}
