import { useCallback, useMemo, useState } from "react";

import { adaptOrvalGet, useDebouncedValue } from "@simplix-react/headless";

import { shortEntityId, type EntityOption } from "./entity-options";

/** How long the operator must stop typing before the query reaches the server. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Params stand-in while nothing is picked. The selection request is disabled in
 * that case, and a page of zero rows is rejected by the searchable contract anyway.
 */
const NO_SELECTION = "";

/** One page of a searchable list read. */
interface EntityPage<TItem> {
  content?: TItem[];
  totalElements?: number;
}

/** What a search hook hands to a server-searched picker. */
export interface EntitySearch {
  /** The current result page — not the whole directory — with the pick at its head. */
  options: EntityOption[];
  /** Whether the search behind `onSearch` is in flight. */
  loading: boolean;
  /** True when the server holds more matches than the fetched page. */
  hasMore: boolean;
  /** Receives the operator's search text; debounced before it reaches the server. */
  onSearch: (query: string) => void;
}

/** Configuration for {@link createEntitySearch}. */
export interface EntitySearchConfig<
  TItem,
  TParams,
  TQuery extends { data: unknown; isLoading: boolean },
  TArg,
> {
  /** The domain's Orval list hook (called unconditionally inside the returned hook). */
  useList: (params: TParams, options?: { query?: { enabled?: boolean } }) => TQuery;
  /**
   * Params for one page of search results. Include `page` and `size` together, the
   * label sort, and the `<field>.contains` key the typed text goes into. An empty
   * query must still return a page, so the operator sees something before typing.
   */
  searchParams: (query: string) => TParams;
  /**
   * Params that fetch exactly the picked row, so its label survives a search that has
   * moved on. Only called with a non-empty id.
   */
  selectionParams: (value: string) => TParams;
  /**
   * A second axis asked in parallel, for a directory whose display name has no single
   * searchable column — a person stored as separate family and given name columns.
   * Both pages merge, de-duplicated by id. Omit it when one column carries the whole
   * name; searchable params AND together, so a second axis cannot be folded into the
   * first.
   */
  alternateSearchParams?: (query: string) => TParams;
  /** FK id per row; rows whose value is empty are dropped. */
  getValue: (item: TItem) => string | undefined;
  /** Display label per row; receives the caller arg so it can add discriminators. */
  getLabel: (item: TItem, arg: TArg) => string;
  /** Optional row predicate (exclude-self, active-only). */
  filter?: (item: TItem, arg: TArg) => boolean;
  /** Optional gate hook — skips every request when it returns false (e.g. a permission check). */
  useEnabled?: () => boolean;
}

const ALWAYS_ENABLED = () => true;

/**
 * Builds a server-searched options hook for an FK entity list — the loader behind a
 * form picker over a directory that outgrows one page.
 *
 * <p>Its eager sibling {@link createEntityOptions} fetches the whole set once, which is
 * right for a bounded catalogue and wrong for a ledger: past the batch size the option
 * list is silently short and a row that exists cannot be found. This one asks the server
 * per query instead, and resolves the picked id separately so a selection keeps its name
 * once the search text moves past it.
 *
 * <p>The list-filter counterpart is {@link createEntityFacet}; the two differ only in that
 * a filter picks several ids and a form picks one.
 *
 * @returns A `useXSearch(value, arg?)` hook yielding the picker's option props.
 */
export function createEntitySearch<
  TItem,
  TParams,
  TQuery extends { data: unknown; isLoading: boolean },
  TArg = void,
>(
  cfg: EntitySearchConfig<TItem, TParams, TQuery, TArg>,
): (value: string, arg?: TArg) => EntitySearch {
  const resolvedUseEnabled = cfg.useEnabled ?? ALWAYS_ENABLED;
  const alternateSearchParams = cfg.alternateSearchParams;

  return function useEntitySearch(value: string, arg?: TArg): EntitySearch {
    const enabled = resolvedUseEnabled();
    const [typed, setTyped] = useState("");
    const query = useDebouncedValue(typed.trim(), SEARCH_DEBOUNCE_MS);
    const a = arg as TArg;

    const primaryQuery = adaptOrvalGet<EntityPage<TItem>, TQuery>(
      cfg.useList(cfg.searchParams(query), { query: { enabled } }),
    );
    const alternateQuery = adaptOrvalGet<EntityPage<TItem>, TQuery>(
      cfg.useList((alternateSearchParams ?? cfg.searchParams)(query), {
        query: { enabled: enabled && !!alternateSearchParams },
      }),
    );

    const primaryRows = primaryQuery.data?.content;
    const alternateRows = alternateSearchParams ? alternateQuery.data?.content : undefined;

    const rows = useMemo(() => {
      const merged: TItem[] = [];
      const seen = new Set<string>();
      for (const item of [...(primaryRows ?? []), ...(alternateRows ?? [])]) {
        const id = cfg.getValue(item);
        if (!id || seen.has(id)) continue;
        if (cfg.filter && !cfg.filter(item, a)) continue;
        seen.add(id);
        merged.push(item);
      }
      return merged;
      // `cfg` is stable across renders (created once by the factory).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryRows, alternateRows, a]);

    // The picked row keeps its name even when the search text has moved past it —
    // otherwise editing a record blanks the field it was about to leave untouched.
    const selectedInRows = !!value && rows.some((item) => cfg.getValue(item) === value);
    const selectionQuery = adaptOrvalGet<EntityPage<TItem>, TQuery>(
      cfg.useList(cfg.selectionParams(value || NO_SELECTION), {
        query: { enabled: enabled && !!value && !selectedInRows },
      }),
    );
    const selectedRow = selectionQuery.data?.content?.[0];

    const options = useMemo<EntityOption[]>(() => {
      const base = rows.map((item) => ({
        label: cfg.getLabel(item, a),
        value: cfg.getValue(item)!,
      }));
      if (value && !selectedInRows) {
        base.unshift({
          label: selectedRow ? cfg.getLabel(selectedRow, a) : shortEntityId(value),
          value,
        });
      }
      return base;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, value, selectedInRows, selectedRow, a]);

    const hasMore =
      (primaryQuery.data?.totalElements ?? 0) > (primaryRows?.length ?? 0) ||
      (!!alternateSearchParams &&
        (alternateQuery.data?.totalElements ?? 0) > (alternateRows?.length ?? 0));

    const onSearch = useCallback((next: string) => setTyped(next), []);

    return {
      options,
      loading: primaryQuery.isLoading || alternateQuery.isLoading || selectionQuery.isLoading,
      hasMore,
      onSearch,
    };
  };
}
