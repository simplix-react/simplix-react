import { buildSearchableParams, type BuildSearchableParamsOptions } from "@simplix-react/headless";

import type { UseCrudListResult } from "./use-crud-list";

/** Options for {@link listSearchParams}: the ones the list's adapter was built with. */
export interface ListSearchParamsOptions extends BuildSearchableParamsOptions {
  /** The parameters a tab or the address forces, as handed to `adaptForcedList`; they win. */
  readonly forced?: Readonly<Record<string, unknown>>;
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
