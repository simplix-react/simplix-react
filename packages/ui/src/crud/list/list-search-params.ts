import { buildSearchableParams, type BuildSearchableParamsOptions } from "@simplix-react/headless";

import { decodeAddressedFilters, type FilterControl } from "./addressed-filters";
import type { UseCrudListResult } from "./use-crud-list";

/** Options for {@link listSearchParams}: the ones the list's adapter was built with. */
export interface ListSearchParamsOptions extends BuildSearchableParamsOptions {
  /** The parameters a tab or the address forces, as handed to `adaptForcedList`; they win. */
  readonly forced?: Readonly<Record<string, unknown>>;
}

/** Options for {@link filtersToRequestParams}: the list's adapter options and the controls it draws. */
export interface FiltersToRequestParamsOptions extends ListSearchParamsOptions {
  /**
   * The controls the list draws, so a value a link carries as text is read back as the type its
   * control commits. Pass the same controls the list was given in its `addressedFilters`.
   */
  readonly controls?: readonly FilterControl[];
}

/**
 * The request parameters a list sends for one set of filters, without its page and its sort.
 *
 * <p><b>One function for the list and for everything that counts what the list shows.</b> A tile
 * reading "4 failed jobs" that opens the list filtered to those jobs states the same filters twice,
 * once as the link and once as the count's request. Both go through this function, so the count and
 * the list cannot send different parameters for the same filters: the filters are read as the list
 * reads them from its address ({@link decodeAddressedFilters}), serialised the way the list's
 * adapter serialises them (`buildSearchableParams`, with the adapter's own `transformFilters`), and
 * the forced parameters win. Pass the result, with the page window of the read, to the generated
 * list hook.
 *
 * @param filters - Filter keys (`field.operator`) to a string or an array of strings, such as a
 *   tile's link carries and `CrudSearch.filters` holds.
 * @param options - The adapter's own `searchKey`, `transformFilters` and forced parameters, and the
 *   controls the list draws.
 * @returns The flat request parameters, ready for a generated list hook.
 *
 * @example
 * ```ts
 * const failed = { "status.in": ["FAILED"] };
 * // the tile's count
 * const count = useListCount(useListBackgroundJobs, filtersToRequestParams(failed));
 * // the tile's link
 * <Link to="/jobs" search={{ filters: failed }} />
 * ```
 */
export function filtersToRequestParams(
  filters: Readonly<Record<string, string | readonly string[]>> | undefined,
  options?: FiltersToRequestParamsOptions,
): Record<string, unknown> {
  const values = decodeAddressedFilters(filters, { controls: options?.controls, forced: options?.forced });
  const params = buildSearchableParams(
    { filters: values },
    { transformFilters: options?.transformFilters, searchKey: options?.searchKey },
  );
  return { ...params, ...options?.forced };
}

/**
 * The search a server-mode list is sending now, without its page: the committed filters, the free
 * text and the sort, serialised the way its adapter serialises them. A request that must cover the
 * same rows as the list (an export, a count over the whole result) is sent with these, so it can
 * never disagree with what the reader narrowed the list to.
 *
 * @param list - The list as `useCrudList` returned it.
 * @param options - The adapter's own `searchKey` and `transformFilters`, and any forced parameters.
 */
export function listSearchParams(
  list: Pick<UseCrudListResult<unknown>, "filters" | "sort">,
  options?: ListSearchParamsOptions,
): Record<string, unknown> {
  const filters: Record<string, unknown> = { ...list.filters.committedValues };
  if (list.filters.search) filters._search = list.filters.search;
  const params = buildSearchableParams(
    {
      filters,
      ...(list.sort.field ? { sort: { field: list.sort.field, direction: list.sort.direction } } : {}),
    },
    { transformFilters: options?.transformFilters, searchKey: options?.searchKey },
  );
  return { ...params, ...options?.forced };
}
