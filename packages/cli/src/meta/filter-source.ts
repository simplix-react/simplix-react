import type { FilterFieldInfo } from "../commands/scaffold-crud.js";
import type { FieldMeta, TypeRef } from "./ir-types.js";

/**
 * Every member of the framework's `SearchOperator` (`@simplix-react/headless`), key → the suffix
 * a filter key is spelled with.
 *
 * It is mirrored rather than imported because neither side may take the dependency: the CLI does
 * not depend on the runtime packages, and a generated domain package declares none of them
 * either. The values are the operator vocabulary of the wire, so a member added there is added
 * here.
 */
export const SEARCH_OPERATORS = {
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  STARTS_WITH: "startsWith",
  ENDS_WITH: "endsWith",
  GREATER_THAN: "greaterThan",
  LESS_THAN: "lessThan",
  GREATER_THAN_OR_EQUAL: "greaterThanOrEqualTo",
  LESS_THAN_OR_EQUAL: "lessThanOrEqualTo",
  IN: "in",
  NOT_IN: "notIn",
  BETWEEN: "between",
  NOT_BETWEEN: "notBetween",
  IS_NULL: "isNull",
  IS_NOT_NULL: "isNotNull",
  IS_TRUE: "isTrue",
  IS_FALSE: "isFalse",
} as const;

/** A member of the framework's `SearchOperator`, by key. */
export type SearchOperatorKey = keyof typeof SEARCH_OPERATORS;

/** The suffix a filter key is spelled with — the framework enum's value, never its key. */
export type SearchOperatorValue = (typeof SEARCH_OPERATORS)[SearchOperatorKey];

/**
 * searchable-jpa's own operator names → the framework member each one is.
 *
 * The two vocabularies are mostly the same string and not always: the backend spells its bounds
 * `GREATER_THAN_OR_EQUAL_TO` and `LESS_THAN_OR_EQUAL_TO`, and the framework's members carry no
 * `_TO`. A table keyed by the suffix cannot recover that, and a lookup that misses is substituted
 * downstream rather than left empty — `SUFFIX_TO_ENUM_KEY[…] ?? "GREATER_THAN_OR_EQUAL"` turns
 * every unmatched operator into an upper bound, so a `lessThanOrEqualTo` filter queries the other
 * direction while compiling and reporting nothing.
 *
 * `null` marks an operator the backend supports and the framework enum has no member for. Those
 * are dropped from a field's filter rather than guessed at, and reported by the caller. The
 * reverse hole needs no entry: `IS_TRUE` and `IS_FALSE` exist only on the framework side, where a
 * boolean field asks for them as `equals`.
 */
export const SEARCH_OPERATOR_BY_IR_NAME: Record<string, SearchOperatorKey | null> = {
  EQUALS: "EQUALS",
  NOT_EQUALS: "NOT_EQUALS",
  GREATER_THAN: "GREATER_THAN",
  GREATER_THAN_OR_EQUAL_TO: "GREATER_THAN_OR_EQUAL",
  LESS_THAN: "LESS_THAN",
  LESS_THAN_OR_EQUAL_TO: "LESS_THAN_OR_EQUAL",
  CONTAINS: "CONTAINS",
  NOT_CONTAINS: "NOT_CONTAINS",
  STARTS_WITH: "STARTS_WITH",
  NOT_STARTS_WITH: null,
  ENDS_WITH: "ENDS_WITH",
  NOT_ENDS_WITH: null,
  IS_NULL: "IS_NULL",
  IS_NOT_NULL: "IS_NOT_NULL",
  IN: "IN",
  NOT_IN: "NOT_IN",
  BETWEEN: "BETWEEN",
  NOT_BETWEEN: "NOT_BETWEEN",
};

/**
 * The framework member an IR operator name is, or `null` when the framework has none for it.
 *
 * A name the table does not carry throws: the IR states what the backend will accept, and a
 * silent fallback there sends a filter the server reads as a different question.
 */
export function searchOperatorOf(irName: string): SearchOperatorKey | null {
  if (!Object.hasOwn(SEARCH_OPERATOR_BY_IR_NAME, irName)) {
    throw new Error(
      `The DTO meta IR names the search operator '${irName}', which is not one of ` +
        `searchable-jpa's. Add it to SEARCH_OPERATOR_BY_IR_NAME with the framework member it ` +
        "is, or with null when the framework has none.",
    );
  }
  return SEARCH_OPERATOR_BY_IR_NAME[irName];
}

/**
 * What a searchable field is, which is what decides the control its filter is rendered with. The
 * OpenAPI path reads this from a schema's `type` and `format`; the IR states it outright.
 */
export type FilterValueKind = "string" | "number" | "boolean" | "date" | "enum" | "unknown";

/** One searchable field of a DTO, read into the shape both the emitter and the scaffold use. */
export interface SearchField {
  /** Wire name of the DTO field, which is the filter key's base. */
  name: string;
  kind: FilterValueKind;
  /** The framework members this field may be asked with, in the order the DTO declares them. */
  operators: SearchOperatorKey[];
  /** Whether the list may be ordered by this field, which the column header reads. */
  sortable: boolean;
  /** The i18n key the field is labeled by, when the backend states one. */
  labelKey?: string;
  /** The enum's values, in declaration order, when {@link kind} is `enum`. */
  options?: string[];
}

/** An operator searchable-jpa supports that the framework enum has no member for. */
export interface UnsupportedOperator {
  field: string;
  /** The operator as the IR names it. */
  operator: string;
}

export interface SearchFieldsResult {
  fields: SearchField[];
  unsupportedOperators: UnsupportedOperator[];
}

/**
 * Read a search DTO's searchable fields into {@link SearchField}s.
 *
 * `enumValues` answers the IR's enum registry: an `enum` field whose values are not found keeps
 * its kind and loses its options, which the faceted rule then treats as it treats any field with
 * nothing to offer.
 */
export function readSearchFields(
  fields: FieldMeta[],
  enumValues: (name: string) => string[] | undefined,
): SearchFieldsResult {
  const read: SearchField[] = [];
  const unsupportedOperators: UnsupportedOperator[] = [];

  for (const field of fields) {
    if (!field.searchable) continue;

    const operators: SearchOperatorKey[] = [];
    for (const name of field.searchable.operators) {
      const key = searchOperatorOf(name);
      if (key === null) {
        unsupportedOperators.push({ field: field.name, operator: name });
        continue;
      }
      operators.push(key);
    }

    const one: SearchField = {
      name: field.name,
      kind: filterValueKind(field.type),
      operators,
      sortable: field.searchable.sortable,
    };
    if (field.labelKey !== undefined) one.labelKey = field.labelKey;
    const options = field.type.kind === "enum" ? enumValues(field.type.name) : undefined;
    if (options) one.options = options;
    read.push(one);
  }

  return { fields: read, unsupportedOperators };
}

/** What a reference is worth to a filter: a container is its element, and a DTO is nothing. */
export function filterValueKind(ref: TypeRef): FilterValueKind {
  switch (ref.kind) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "instant":
    case "date":
    case "time":
      return "date";
    case "enum":
      return "enum";
    case "container":
      // A `List<String>` is searched by its members, so the element is what the control asks for.
      return ref.args.length === 1 ? filterValueKind(ref.args[0]) : "unknown";
    default:
      return "unknown";
  }
}

/**
 * Fields the filter bar never offers: the row's own key, the page window, and the audit stamps
 * the OpenAPI path drops by prefix. They stay in the params type — the route accepts them — and
 * only the control is withheld.
 */
const UNFILTERED_FIELDS = new Set([
  "id",
  "ids",
  "page",
  "size",
  "sort",
  "createdBy",
  "updatedBy",
  "deletedTimestamp",
]);

/** Text operators a text control may be switched between, in the order it lists them. */
const TEXT_OPERATORS: SearchOperatorKey[] = [
  "CONTAINS",
  "NOT_CONTAINS",
  "EQUALS",
  "NOT_EQUALS",
  "STARTS_WITH",
  "ENDS_WITH",
];

/** Operators that put a value on one side of a bound, which is what a number control offers. */
const COMPARISON_OPERATORS: SearchOperatorKey[] = [
  "GREATER_THAN",
  "LESS_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN_OR_EQUAL",
];

/** A field whose `IN` would have opened a facet with nothing inside it. */
export interface UnfacetedField {
  field: string;
  kind: FilterValueKind;
}

export interface DerivedFilters {
  filters: FilterFieldInfo[];
  unfacetedFields: UnfacetedField[];
}

/**
 * The filter controls a DTO's searchable fields resolve to.
 *
 * The rules are the OpenAPI path's, with the two decisions it could only guess at answered from
 * the IR instead. A faceted control fills its options from the field's enum and writes `.in`, so
 * a field with an `IN` operator and no enum behind it opens a panel with nothing in it — the
 * OpenAPI path makes one anyway, because its rule fires before anything has looked at the type.
 * Here such a field falls through to the text and equality rules, which give the operator
 * something to type into, and is reported as {@link UnfacetedField}.
 */
export function deriveFilterFields(fields: SearchField[]): DerivedFilters {
  const filters: FilterFieldInfo[] = [];
  const unfacetedFields: UnfacetedField[] = [];

  for (const field of fields) {
    if (UNFILTERED_FIELDS.has(field.name)) continue;

    const has = (key: SearchOperatorKey): boolean => field.operators.includes(key);
    const key = (operator: SearchOperatorKey): string =>
      `${field.name}.${SEARCH_OPERATORS[operator]}`;
    const label = field.name.charAt(0).toUpperCase() + field.name.slice(1);

    // A boolean is asked as a yes/no, and `equals` is the only operator that can carry it.
    if (field.kind === "boolean" && has("EQUALS")) {
      filters.push({
        filterKey: key("EQUALS"),
        component: "ToggleFilter",
        label,
        field: field.name,
        operator: SEARCH_OPERATORS.EQUALS,
        valueType: "boolean",
      });
      continue;
    }

    // A country and a timezone have their own pickers, which are recognised by name because
    // neither is a type the backend distinguishes.
    if (/(?:country|countryCode)$/i.test(field.name) && has("IN")) {
      filters.push({
        filterKey: key("IN"),
        component: "CountryFilter",
        label,
        field: field.name,
        operator: SEARCH_OPERATORS.IN,
        valueType: "array",
      });
      continue;
    }
    if (/(?:timezone|timeZone)$/i.test(field.name) && (has("IN") || has("CONTAINS"))) {
      const inbound = has("IN");
      filters.push({
        filterKey: key(inbound ? "IN" : "CONTAINS"),
        component: "TimezoneFilter",
        label,
        field: field.name,
        operator: inbound ? SEARCH_OPERATORS.IN : SEARCH_OPERATORS.CONTAINS,
        valueType: inbound ? "array" : "string",
      });
      continue;
    }

    if (has("IN")) {
      if (field.kind === "enum" && field.options && field.options.length > 0) {
        filters.push({
          filterKey: key("IN"),
          component: "FacetedFilter",
          label,
          field: field.name,
          operator: SEARCH_OPERATORS.IN,
          options: field.options,
          valueType: "array",
        });
        continue;
      }
      unfacetedFields.push({ field: field.name, kind: field.kind });
    }

    // A date range writes both bounds, so the field has to accept both.
    if (field.kind === "date" && has("GREATER_THAN_OR_EQUAL") && has("LESS_THAN_OR_EQUAL")) {
      filters.push({
        filterKey: key("GREATER_THAN_OR_EQUAL"),
        component: "DateRangeFilter",
        label,
        field: field.name,
        operator: SEARCH_OPERATORS.GREATER_THAN_OR_EQUAL,
        pairedKey: key("LESS_THAN_OR_EQUAL"),
        valueType: "dateRange",
      });
      continue;
    }

    const comparable = field.operators.some((one) => COMPARISON_OPERATORS.includes(one));
    if (field.kind === "number" && comparable) {
      // The control opens on the bound it can widen from, and on equality when there is no bound.
      const first =
        field.operators.find((one) => one === "GREATER_THAN_OR_EQUAL" || one === "EQUALS") ??
        field.operators[0];
      filters.push({
        filterKey: key(first),
        component: "NumberFilter",
        label,
        field: field.name,
        operator: SEARCH_OPERATORS[first],
        valueType: "number",
      });
      continue;
    }

    if (has("CONTAINS")) {
      filters.push({
        filterKey: key("CONTAINS"),
        component: "TextFilter",
        label,
        field: field.name,
        operator: SEARCH_OPERATORS.CONTAINS,
        valueType: "string",
        textOperators: textOperatorsOf(field, "CONTAINS"),
      });
      continue;
    }

    if (has("EQUALS") && field.kind === "enum" && field.options && field.options.length > 0) {
      filters.push({
        filterKey: key("EQUALS"),
        component: "FacetedFilter",
        label,
        field: field.name,
        operator: SEARCH_OPERATORS.EQUALS,
        options: field.options,
        valueType: "string",
      });
      continue;
    }

    if (has("EQUALS")) {
      filters.push({
        filterKey: key("EQUALS"),
        component: "TextFilter",
        label,
        field: field.name,
        operator: SEARCH_OPERATORS.EQUALS,
        valueType: "string",
        textOperators: textOperatorsOf(field, "EQUALS"),
      });
    }
  }

  return { filters, unfacetedFields };
}

/** The operators a text control may be switched between, in the order it lists them. */
function textOperatorsOf(field: SearchField, fallback: SearchOperatorKey): string[] {
  const listed = TEXT_OPERATORS.filter((one) => field.operators.includes(one)).map(
    (one) => SEARCH_OPERATORS[one],
  );
  return listed.length > 0 ? listed : [SEARCH_OPERATORS[fallback]];
}
