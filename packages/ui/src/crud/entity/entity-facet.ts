import { useCallback, useMemo, useState } from "react";

import { SearchOperator, adaptOrvalGet, makeFilterKey } from "@simplix-react/headless";
import type { CrudListFilters } from "../list/use-crud-list";

import type { EntityOption } from "./entity-options";

/** What a facet hook hands to a `FilterBar` faceted filter definition. */
export interface EntityFacet {
  /** The current result page — not the whole directory. */
  options: EntityOption[];
  /** Whether the search behind `onSearch` is in flight. */
  loading: boolean;
  /** Labels for the picked ids, resolved whether or not they are on the current page. */
  selectedOptions: EntityOption[];
  /** Receives the operator's search text (the FilterBar debounces it). */
  onSearch: (query: string) => void;
}

/** Configuration for {@link createEntityFacet}. */
export interface EntityFacetConfig<
  TItem,
  TParams,
  TQuery extends { data: unknown; isLoading: boolean },
  TArg,
> {
  /** The domain's Orval list hook (called unconditionally inside the returned hook). */
  useList: (params: TParams, options?: { query?: { enabled?: boolean } }) => TQuery;
  /**
   * The referenced entity's id field — both the filter key the picked values live
   * under (`<idField>.in`) and what {@link getValue} returns.
   */
  idField: string;
  /**
   * Params for one page of search results. Include `page` and `size` together, the
   * label sort, and the `<field>.contains` key the typed text goes into. An empty
   * query must still return a page, so the operator sees something before typing.
   */
  searchParams: (query: string) => TParams;
  /**
   * Params that fetch exactly the picked rows, so their labels survive a search that
   * has moved on. Only called with a non-empty list.
   */
  selectionParams: (values: string[]) => TParams;
  /** FK id per row; rows whose value is empty are dropped. */
  getValue: (item: TItem) => string | undefined;
  /** Display label per row; receives the caller arg so it can add discriminators. */
  getLabel: (item: TItem, arg: TArg) => string;
  /** Optional gate hook — skips both requests when it returns false (e.g. a permission check). */
  useEnabled?: () => boolean;
}

const ALWAYS_ENABLED = () => true;

/** @returns the values under `key`, whatever shape the filter state holds them in */
function valuesAt(source: Record<string, unknown>, key: string): string[] {
  const raw = source[key];
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === "string");
  return typeof raw === "string" && raw ? [raw] : [];
}

/**
 * Builds a server-searched options hook for an FK entity list — the loader behind a
 * `FilterBar` faceted filter over a directory that outgrows one page.
 *
 * <p>Its eager sibling {@link createEntityOptions} fetches the whole set once, which is
 * right for a bounded catalogue and wrong for a ledger: past the batch size the option
 * list is silently short and a row that exists cannot be found. This one asks the server
 * per query instead, and resolves the picked ids separately so a selection keeps its name
 * once the search text moves past it.
 *
 * @returns A `useXFacet(state, arg?)` hook yielding the faceted filter's option props.
 */
export function createEntityFacet<
  TItem,
  TParams,
  TQuery extends { data: unknown; isLoading: boolean },
  TArg = void,
>(
  cfg: EntityFacetConfig<TItem, TParams, TQuery, TArg>,
): (state: CrudListFilters, arg?: TArg) => EntityFacet {
  const resolvedUseEnabled = cfg.useEnabled ?? ALWAYS_ENABLED;
  const filterKey = makeFilterKey(cfg.idField, SearchOperator.IN);

  return function useEntityFacet(state: CrudListFilters, arg?: TArg) {
    const enabled = resolvedUseEnabled();
    const [query, setQuery] = useState("");

    const searchQuery = adaptOrvalGet<{ content?: TItem[] }, TQuery>(
      cfg.useList(cfg.searchParams(query), { query: { enabled } }),
    );

    // The popover writes to pending state and only the Apply button commits, so both
    // have to be resolved — otherwise a just-picked row loses its name until Apply.
    const pending = valuesAt(state.values, filterKey);
    const committed = valuesAt(state.committedValues, filterKey);
    const selectedValues = useMemo(
      () => [...new Set([...pending, ...committed])],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [pending.join(","), committed.join(",")],
    );

    const hasSelection = selectedValues.length > 0;
    const selectionQuery = adaptOrvalGet<{ content?: TItem[] }, TQuery>(
      cfg.useList(
        // Never called with an empty list: the request is disabled in that case, and a
        // page size of zero is rejected by the searchable contract anyway.
        cfg.selectionParams(hasSelection ? selectedValues : [""]),
        { query: { enabled: enabled && hasSelection } },
      ),
    );

    const toOptions = useCallback(
      (rows: TItem[] | undefined): EntityOption[] =>
        (rows ?? [])
          .filter((it) => !!cfg.getValue(it))
          .map((it) => ({ label: cfg.getLabel(it, arg as TArg), value: cfg.getValue(it)! })),
      // `cfg` is stable across renders (created once by the factory).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [arg],
    );

    const options = useMemo(
      () => toOptions(searchQuery.data?.content),
      [searchQuery.data, toOptions],
    );
    const selectedOptions = useMemo(
      () => (hasSelection ? toOptions(selectionQuery.data?.content) : []),
      [selectionQuery.data, hasSelection, toOptions],
    );

    const onSearch = useCallback((next: string) => setQuery(next), []);

    return { options, loading: searchQuery.isLoading, selectedOptions, onSearch };
  };
}
