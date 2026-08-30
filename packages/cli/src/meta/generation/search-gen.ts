import type { FilterFieldInfo } from "../../commands/scaffold-crud.js";
import type { OpenApiNamingStrategy } from "../../openapi/naming/naming-strategy.js";
import {
  deriveFilterFields,
  readSearchFields,
  searchOperatorOf,
  SEARCH_OPERATORS,
  type SearchField,
  type SearchOperatorKey,
} from "../filter-source.js";
import type { FieldMeta, ParamMeta, TypeRef } from "../types.js";
import type { ResolvedDomain } from "../resolve.js";
import { ENUM_MODULE, HEADER, memberName, PRIMITIVES } from "./emit.js";
import {
  jsDoc,
  resolveEndpoints,
  type EndpointEntity,
  type EndpointTarget,
} from "./endpoint-gen.js";
import { modelFileBase } from "./model-gen.js";

/** Directory the search metadata modules land in, relative to a generated package's meta root. */
export const SEARCH_DIR = "search";

/** Directory the params types land in — beside the DTOs, which is where both halves look. */
const MODEL_DIR = "model";

/** Module the emitted metadata is typed against, inside {@link SEARCH_DIR}. */
const FILTER_MODULE = "_filters";

/**
 * The page window every searchable route accepts. The backend binds it on the controller rather
 * than on the DTO, so SimpliX Meta states none of it and a params type built from the filters alone
 * would be missing its paging.
 */
const PAGE_PARAMS = [
  { name: "page", type: "number", doc: "Page number, counted from zero." },
  { name: "size", type: "number", doc: "Rows per page." },
  { name: "sort", type: "string[]", doc: "Ordering, each entry `field.asc` or `field.desc`." },
];

export interface SearchGenOptions {
  /** Contributed by the spec profile, and the same one the endpoints were generated with. */
  naming: OpenApiNamingStrategy;
}

/** An operator searchable-jpa supports that the framework's `SearchOperator` has no member for. */
export interface UnsupportedOperator {
  /** The search DTO the field is declared on. */
  type: string;
  field: string;
  /** The operator as SimpliX Meta names it. */
  operator: string;
}

/**
 * A field whose `IN` would have opened a facet with nothing inside it, rerouted to a control the
 * operator can type into. The OpenAPI path cannot tell these from an enum, because its faceted
 * rule fires before anything has read the field's type.
 */
export interface UnfacetedField {
  type: string;
  field: string;
}

/** A member SimpliX Meta names no type for, sent as text because a query string carries text. */
export interface ErasedFilterType {
  /** The search DTO the field is declared on, or the operation the parameter belongs to. */
  site: string;
  field: string;
}

export interface SearchGenResult {
  /** Path relative to the meta output root → file content. */
  files: Map<string, string>;
  /**
   * The params modules written into the model directory, without their extension. The model
   * generator's barrel is built from the domain's declared types and knows nothing of these, so
   * whoever assembles the package exports them beside it.
   */
  paramsModules: string[];
  unsupportedOperators: UnsupportedOperator[];
  unfacetedFields: UnfacetedField[];
  erasedFilterTypes: ErasedFilterType[];
}

/**
 * One route whose parameters are the filters a search DTO defines, with the two names SimpliX Meta
 * leaves optional resolved: a route the endpoint generator declares no params for is one this
 * generator declares them for, and it has a search DTO exactly then.
 */
interface SearchRoute {
  target: EndpointTarget;
  paramsType: string;
  searchDto: string;
}

/**
 * Emit one search metadata module per entity of a domain closure, the params type of every
 * searchable route, and the barrel over the metadata.
 *
 * The metadata is exported for screens written by hand: nothing generated reads it. What the
 * generated client does depend on is the params type, which both the request function and its
 * hook import from the model directory — a searchable route states no query parameter of its own,
 * so the filters its DTO defines are the only description of what it accepts.
 */
export function generateSearchFiles(
  domain: ResolvedDomain,
  options: SearchGenOptions,
): SearchGenResult {
  const entities = resolveEndpoints(domain, options.naming);
  const emitter = new SearchEmitter(domain);

  const files = new Map<string, string>();
  const paramsModules: string[] = [];
  const described: EndpointEntity[] = [];

  for (const entity of entities) {
    const routes = searchRoutes(entity);
    if (routes.length === 0) continue;

    for (const route of routes) {
      const module = modelFileBase(route.paramsType);
      paramsModules.push(module);
      files.set(`${MODEL_DIR}/${module}.ts`, emitter.paramsFile(route));
    }
    described.push(entity);
    files.set(`${SEARCH_DIR}/${entity.file}.ts`, emitter.metadataFile(routes));
  }

  if (described.length > 0) {
    files.set(`${SEARCH_DIR}/${FILTER_MODULE}.ts`, filterTypes());
    files.set(`${SEARCH_DIR}/index.ts`, barrel(described));
  }

  return {
    files,
    paramsModules,
    unsupportedOperators: emitter.unsupportedOperators,
    unfacetedFields: emitter.unfacetedFields,
    erasedFilterTypes: emitter.erasedFilterTypes,
  };
}

/**
 * The routes of an entity whose parameters are the filters a search DTO defines.
 *
 * A name two of them resolve to keeps the first: both the params module's path and the metadata
 * constants are built from that name, so the second would overwrite one file and declare the other
 * twice. The collision itself is already reported by the endpoint generator, which names its
 * request functions the same way.
 */
function searchRoutes(entity: EndpointEntity): SearchRoute[] {
  const routes: SearchRoute[] = [];
  const taken = new Set<string>();
  for (const target of entity.targets) {
    const searchDto = target.operation.request.searchDto;
    if (target.paramsType === undefined || target.paramsDeclared || searchDto === undefined) {
      continue;
    }
    if (taken.has(target.name)) continue;
    taken.add(target.name);
    routes.push({ target, paramsType: target.paramsType, searchDto });
  }
  return routes;
}

/** The barrel over the directory, which every module of it is reachable through. */
function barrel(entities: EndpointEntity[]): string {
  const modules = entities.map((entity) => entity.file).sort();
  return [HEADER, "", ...modules.map((name) => `export * from './${name}';`), ""].join("\n");
}

/**
 * The shapes the emitted metadata is typed against.
 *
 * The operator union is the framework's `SearchOperator` values written out rather than imported:
 * a generated domain package declares no dependency on the runtime packages, and an import of one
 * would fail to resolve wherever the package is consumed without it.
 */
function filterTypes(): string {
  const operators = Object.values(SEARCH_OPERATORS)
    .map((value) => `  | '${value}'`)
    .join("\n");

  return `${HEADER}

/** How a filter key names its operator — the values of the framework's \`SearchOperator\`. */
export type SearchOperatorValue =
${operators};

/** What a searchable field is, which is what decides the control its filter is rendered with. */
export type FilterValueKind = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'unknown';

/** One searchable field of the DTO a route searches by. */
export interface SearchField {
  /** Wire name of the field, which is the base of every filter key built from it. */
  name: string;
  kind: FilterValueKind;
  /** The operators the route accepts on this field, in the order the DTO declares them. */
  operators: SearchOperatorValue[];
  /** Whether the list may be ordered by this field. */
  sortable: boolean;
  /** The i18n key the field is labeled by, when the backend states one. */
  labelKey?: string;
  /** The enum's values, in declaration order, when \`kind\` is \`enum\`. */
  options?: string[];
}

/** One filter control, and the parameter it writes. */
export interface FilterField {
  /** The parameter the control writes, \`<field>.<operator>\`. */
  filterKey: string;
  /** The control: TextFilter, NumberFilter, FacetedFilter, ToggleFilter, DateRangeFilter, … */
  component: string;
  label: string;
  field: string;
  operator: SearchOperatorValue;
  /** A faceted control's options. */
  options?: string[];
  /** The upper bound a date range writes, beside the lower bound \`filterKey\` names. */
  pairedKey?: string;
  valueType: 'string' | 'number' | 'boolean' | 'date' | 'dateRange' | 'array';
  /** The operators a text control may be switched between. */
  textOperators?: string[];
}
`;
}

/** The names one params module takes from the enum module beside it. */
interface EnumImports {
  enums: Set<string>;
}

class SearchEmitter {
  readonly unsupportedOperators: UnsupportedOperator[] = [];
  readonly unfacetedFields: UnfacetedField[] = [];
  readonly erasedFilterTypes: ErasedFilterType[] = [];

  constructor(private readonly domain: ResolvedDomain) {}

  /**
   * One searchable route's parameters: what the route states, the filters its DTO defines, and
   * the page window the backend binds outside both.
   */
  paramsFile(route: SearchRoute): string {
    const imports: EnumImports = { enums: new Set() };
    const members: string[] = [];

    // What the route states of its own comes first, as it does in the OpenAPI document. Eight of
    // the searchable routes carry parameters beside their filters and every one of them is a
    // control on a screen — the window a census is bucketed over, the tab an inbox is narrowed
    // to. The list renders without them, which is why dropping them fails quietly.
    for (const param of route.target.operation.request.query) {
      members.push(this.ownParam(param, imports, route.target.operation.id));
    }

    for (const field of this.searchableFields(route.searchDto)) {
      for (const name of field.searchable?.operators ?? []) {
        // An operator the framework has no member for is reported by the metadata pass over the
        // same fields; here it is simply not a parameter the client can build.
        const operator = searchOperatorOf(name);
        if (operator === null) continue;
        const key = `${field.name}.${SEARCH_OPERATORS[operator]}`;
        const type = this.memberType(field.type, operator, imports, route.searchDto, field.name);
        members.push(`  ${memberName(key)}?: ${type};`);
      }
    }

    for (const page of PAGE_PARAMS) {
      members.push(`  ${jsDoc(page.doc)}\n  ${page.name}?: ${page.type};`);
    }

    const lines = [HEADER, ""];
    if (imports.enums.size > 0) {
      lines.push(
        `import type { ${[...imports.enums].sort().join(", ")} } from './${ENUM_MODULE}';`,
        "",
      );
    }
    lines.push(
      jsDoc(`What \`${route.target.name}\` reads from the query string, filters included.`),
      `export type ${route.paramsType} = {`,
      ...members,
      "};",
      "",
    );
    return lines.join("\n");
  }

  /** One entity's metadata: each route's searchable fields, and the controls they resolve to. */
  metadataFile(routes: SearchRoute[]): string {
    const parts: string[] = [];

    for (const route of routes) {
      const read = readSearchFields(this.searchableFields(route.searchDto), (name) =>
        this.domain.enums.get(name)?.meta.values.map((value) => value.name),
      );
      for (const one of read.unsupportedOperators) {
        this.unsupportedOperators.push({
          type: route.searchDto,
          field: one.field,
          operator: one.operator,
        });
      }

      const derived = deriveFilterFields(read.fields);
      for (const one of derived.unfacetedFields) {
        this.unfacetedFields.push({ type: route.searchDto, field: one.field });
      }

      const declares = `The fields \`${route.searchDto}\` declares searchable, and how each may be asked.`;
      const resolve = `The controls those fields resolve to on a screen that filters \`${route.target.name}\`.`;
      parts.push(
        `${jsDoc(declares)}
export const ${route.target.name}SearchFields: SearchField[] = [
${read.fields.map(searchFieldLiteral).join("\n")}
];
`,
        `${jsDoc(resolve)}
export const ${route.target.name}Filters: FilterField[] = [
${derived.filters.map(filterFieldLiteral).join("\n")}
];
`,
      );
    }

    return [
      HEADER,
      "",
      `import type { FilterField, SearchField } from './${FILTER_MODULE}';`,
      "",
      ...parts,
    ].join("\n");
  }

  /** The searchable fields of a DTO, inherited ones included and in declaration order. */
  private searchableFields(name: string): FieldMeta[] {
    // A DTO SimpliX Meta does not declare is already reported by the resolver.
    return (this.domain.types.get(name)?.allFields ?? []).filter((field) => field.searchable);
  }

  /** A parameter the route states of its own, carrying the requiredness SimpliX Meta states. */
  private ownParam(param: ParamMeta, imports: EnumImports, site: string): string {
    const type = this.scalarType(param.type, imports, site, param.name);
    const doc = param.description ? `  ${jsDoc(param.description)}\n` : "";
    return `${doc}  ${memberName(param.name)}${param.required ? "" : "?"}: ${type};`;
  }

  /**
   * The type one filter member carries. The operator decides the shape and the field decides what
   * is inside it: a membership test takes a list of the field's own values, a null test takes the
   * answer to the question rather than a value, and a text match takes text whatever the column is.
   */
  private memberType(
    ref: TypeRef,
    operator: SearchOperatorKey,
    imports: EnumImports,
    site: string,
    field: string,
  ): string {
    if (operator === "IS_NULL" || operator === "IS_NOT_NULL") return "boolean";

    const scalar = this.scalarType(ref, imports, site, field);
    switch (operator) {
      case "IN":
      case "NOT_IN":
      case "BETWEEN":
      case "NOT_BETWEEN":
        // Several values reach the wire as one comma-separated field, and both shapes serialise to
        // it: the filter bar commits an array and `buildSearchableParams` hands it through, while
        // hand-written code joins it itself. Naming only the array rejects the second, which is
        // what module code already written against the OpenAPI path passes.
        return `${scalar} | ${scalar}[]`;
      case "CONTAINS":
      case "NOT_CONTAINS":
      case "STARTS_WITH":
      case "ENDS_WITH":
        return "string";
      default:
        return scalar;
    }
  }

  /**
   * The type a single value of a field carries in a query string. A container is searched by its
   * members, so its element is the value; a reference names a shape no query string can carry,
   * and is reported rather than spelled.
   */
  private scalarType(ref: TypeRef, imports: EnumImports, site: string, field: string): string {
    switch (ref.kind) {
      case "number":
        return "number";
      case "enum":
        // A request carries the enum's value rather than its label, which is the union's shape. A
        // name SimpliX Meta does not declare is already reported by the resolver.
        if (!this.domain.enums.has(ref.name)) return this.erased(site, field);
        imports.enums.add(ref.name);
        return ref.name;
      case "container":
        return ref.args.length === 1
          ? this.scalarType(ref.args[0], imports, site, field)
          : this.erased(site, field);
      case "ref":
      case "pick":
      case "param":
      case "unknown":
        return this.erased(site, field);
      default:
        return PRIMITIVES[ref.kind];
    }
  }

  /** A value SimpliX Meta names no type for. It travels as text, which is what a query string is. */
  private erased(site: string, field: string): string {
    this.erasedFilterTypes.push({ site, field });
    return "string";
  }
}

/** One `SearchField`, written as the object literal the emitted module declares. */
function searchFieldLiteral(field: SearchField): string {
  const parts = [
    `name: ${JSON.stringify(field.name)}`,
    `kind: ${JSON.stringify(field.kind)}`,
    `operators: [${field.operators.map((one) => JSON.stringify(SEARCH_OPERATORS[one])).join(", ")}]`,
    `sortable: ${field.sortable}`,
  ];
  if (field.labelKey !== undefined) parts.push(`labelKey: ${JSON.stringify(field.labelKey)}`);
  if (field.options) {
    parts.push(`options: [${field.options.map((one) => JSON.stringify(one)).join(", ")}]`);
  }
  return `  { ${parts.join(", ")} },`;
}

/** One `FilterField`, written as the object literal the emitted module declares. */
function filterFieldLiteral(filter: FilterFieldInfo): string {
  const parts = [
    `filterKey: ${JSON.stringify(filter.filterKey)}`,
    `component: ${JSON.stringify(filter.component)}`,
    `label: ${JSON.stringify(filter.label)}`,
    `field: ${JSON.stringify(filter.field)}`,
    `operator: ${JSON.stringify(filter.operator)}`,
  ];
  if (filter.options) {
    parts.push(`options: [${filter.options.map((one) => JSON.stringify(one)).join(", ")}]`);
  }
  if (filter.pairedKey !== undefined) parts.push(`pairedKey: ${JSON.stringify(filter.pairedKey)}`);
  parts.push(`valueType: ${JSON.stringify(filter.valueType)}`);
  if (filter.textOperators) {
    parts.push(`textOperators: [${filter.textOperators.map((one) => JSON.stringify(one)).join(", ")}]`);
  }
  return `  { ${parts.join(", ")} },`;
}
