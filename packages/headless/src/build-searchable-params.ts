import type { SortState } from "./shared-types";

/**
 * List query params assembled by a list state machine before serialization —
 * the web page model (`useCrudList`) and the native feed model
 * (`useEntityFeed`) both produce this shape.
 */
export interface SearchableListParams {
  /** Committed filter values keyed by `field.operator`; `_search` is dropped. */
  filters?: Record<string, unknown>;
  /** Active sort state. */
  sort?: SortState;
  /** Offset pagination — `page` is 1-based here. */
  pagination?: { page: number; limit: number };
}

/** Options for {@link buildSearchableParams}. */
export interface BuildSearchableParamsOptions {
  /** Transform filter key-value pairs before sending to the API.
   *  Use this to convert generic filter formats to backend-specific formats
   *  (e.g., searchable-jpa BETWEEN operator, date format conversion). */
  transformFilters?: (filters: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Serialize list state into flat searchable query params.
 *
 * @remarks
 * Implements the searchable backend conventions shared by every platform:
 * - Page: 1-based to 0-based (`page`).
 * - Size: `pagination.limit` to `size`.
 * - Sort: `{ field, direction }` to `["field.direction"]`.
 * - Filters: spread flat as `field.operator` keys, dropping `_search`,
 *   `undefined` / `null` / `""`, and empty arrays.
 *
 * @param params - List state assembled by a list state machine.
 * @param options - Optional filter transformation.
 * @returns Flat query params ready for an Orval-generated list hook.
 */
export function buildSearchableParams(
  params: SearchableListParams | undefined,
  options?: BuildSearchableParamsOptions,
): Record<string, unknown> {
  const apiParams: Record<string, unknown> = {};
  if (!params) return apiParams;

  const { pagination, sort } = params;

  if (pagination) {
    apiParams.page = pagination.page - 1; // 1-based -> 0-based
    apiParams.size = pagination.limit;
  }

  // **A sort state with no field in it is not a sort.** The server's parser matches `field.asc` /
  // `field.desc` and rejects anything else, so a state object that exists while its field is still
  // undefined serialised as the literal `undefined.undefined` and every list holding one answered
  // 400 the moment it loaded. Guarding on the object alone cannot see that — the object is there,
  // and what is missing is inside it.
  if (sort?.field && sort.direction) {
    apiParams.sort = [`${sort.field}.${sort.direction}`];
  }

  let filters = params.filters;
  if (filters) {
    if (options?.transformFilters) {
      filters = options.transformFilters(filters);
    }
    for (const [key, value] of Object.entries(filters)) {
      if (key === "_search") continue;
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      apiParams[key] = value;
    }
  }

  return apiParams;
}
