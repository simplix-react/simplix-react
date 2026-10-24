import { parseFilterKey } from "./filter-utils";
import { SearchOperator } from "./filter-types";

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).toLowerCase();
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((part) => part.trim()).filter(Boolean);
  return [value];
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

/**
 * Whether one record passes one committed filter, the way a server reading the same key would.
 *
 * <p>A filter bar and a chip row commit keys as `field.operator` (`name.contains`, `role.in`); a key
 * with no operator is compared for equality. Used where a list is processed in memory, so a filter
 * narrows the rows there exactly as it narrows them on a server rather than matching nothing.
 *
 * @param record the row
 * @param key the committed key
 * @param value the committed value; an empty value narrows nothing
 * @returns whether the row stays
 */
export function matchesFilter(record: Record<string, unknown>, key: string, value: unknown): boolean {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return true;
  const parsed = parseFilterKey(key);
  if (!parsed || !(Object.values(SearchOperator) as string[]).includes(parsed.operator)) {
    return record[key] === value;
  }
  const actual = record[parsed.field];
  switch (parsed.operator as SearchOperator) {
    case SearchOperator.EQUALS:
      return text(actual) === text(value);
    case SearchOperator.NOT_EQUALS:
      return text(actual) !== text(value);
    case SearchOperator.CONTAINS:
      return text(actual).includes(text(value));
    case SearchOperator.NOT_CONTAINS:
      return !text(actual).includes(text(value));
    case SearchOperator.STARTS_WITH:
      return text(actual).startsWith(text(value));
    case SearchOperator.ENDS_WITH:
      return text(actual).endsWith(text(value));
    case SearchOperator.GREATER_THAN:
      return compare(actual, value) > 0;
    case SearchOperator.LESS_THAN:
      return compare(actual, value) < 0;
    case SearchOperator.GREATER_THAN_OR_EQUAL:
      return compare(actual, value) >= 0;
    case SearchOperator.LESS_THAN_OR_EQUAL:
      return compare(actual, value) <= 0;
    case SearchOperator.IN:
      return list(value).some((candidate) => text(candidate) === text(actual));
    case SearchOperator.NOT_IN:
      return !list(value).some((candidate) => text(candidate) === text(actual));
    case SearchOperator.BETWEEN:
    case SearchOperator.NOT_BETWEEN: {
      const [from, to] = list(value);
      const inside = (from === undefined || from === "" || compare(actual, from) >= 0) && (to === undefined || to === "" || compare(actual, to) <= 0);
      return parsed.operator === SearchOperator.BETWEEN ? inside : !inside;
    }
    case SearchOperator.IS_NULL:
      return actual === null || actual === undefined || actual === "";
    case SearchOperator.IS_NOT_NULL:
      return !(actual === null || actual === undefined || actual === "");
    case SearchOperator.IS_TRUE:
      return actual === true;
    case SearchOperator.IS_FALSE:
      return actual === false;
    default:
      return true;
  }
}
