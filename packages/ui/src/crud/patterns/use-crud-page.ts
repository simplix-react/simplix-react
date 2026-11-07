import { useCallback, useMemo } from "react";

import type { CrudNavigateOptions, CrudSearch, CrudSearchFilters, CrudView } from "./crud-search";
import type { ListDetailVariant } from "./list-detail";
import type { UseFadeTransitionResult } from "./use-fade-transition";
import type { UseListDetailStateResult } from "./use-list-detail-state";

import { addressedFiltersKey } from "../list/addressed-filters";
import { buildCrudSearch, parseCrudSearch } from "./crud-search";
import { useFadeTransition } from "./use-fade-transition";

// ── useCrudNavigation ──

/** Return type of {@link useCrudNavigation}. */
export interface UseCrudNavigationResult {
  view: CrudView;
  selectedId: string | undefined;
  showList: () => void;
  showDetail: (id: string) => void;
  showNew: () => void;
  showEdit: (id: string) => void;
  /** The list filters the address carries, or `undefined` when it names none. */
  filters: CrudSearchFilters | undefined;
  /**
   * Writes the list filters into the address, keeping everything else in it (record, mode, tab).
   * The navigation replaces the current history entry, so narrowing a list does not fill the
   * history; pass `undefined` to clear them.
   */
  setFilters: (filters: CrudSearchFilters | undefined) => void;
}

/**
 * Parses CRUD search params and returns memoized navigation callbacks.
 *
 * @example
 * ```tsx
 * const nav = useCrudNavigation(search, onNavigate);
 * const { view, selectedId, showList, showDetail } = nav;
 * ```
 */
export function useCrudNavigation<S extends CrudSearch>(
  search: S,
  /**
   * Where to go.
   *
   * <p>Typed in the caller's own search rather than in {@link CrudSearch}: a screen whose address
   * carries more than the record (which explanation is open, which tab) hands over a handler
   * that reads that wider shape, and a parameter fixed at the narrow one refuses it.
   *
   * <p>The second argument says how the router should record the move. A handler that takes one
   * argument still fits: it pushes, as it always did.
   */
  onNavigate: (search: S, options?: CrudNavigateOptions) => void,
): UseCrudNavigationResult {
  const { view, selectedId } = parseCrudSearch(search);

  const tab = search.tab;
  // Held by content, so a router that hands over a new object with the same filters does not
  // change the callbacks below.
  const filtersKey = addressedFiltersKey(search.filters);
  // The key stands for the content of `search.filters`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = useMemo(() => search.filters, [filtersKey]);
  const showList = useCallback(() => onNavigate(buildCrudSearch("list", undefined, tab, filters) as S), [onNavigate, tab, filters]);
  const showDetail = useCallback((id: string) => onNavigate(buildCrudSearch("detail", id, tab, filters) as S), [onNavigate, tab, filters]);
  const showNew = useCallback(() => onNavigate(buildCrudSearch("new", undefined, tab, filters) as S), [onNavigate, tab, filters]);
  const showEdit = useCallback((id: string) => onNavigate(buildCrudSearch("edit", id, tab, filters) as S), [onNavigate, tab, filters]);
  const setFilters = useCallback(
    (next: CrudSearchFilters | undefined) => onNavigate({ ...search, filters: next }, { replace: true }),
    [onNavigate, search],
  );

  return { view, selectedId, showList, showDetail, showNew, showEdit, filters, setFilters };
}

// ── useCrudPageState ──

/** Return type of {@link useCrudPageState}. */
export interface UseCrudPageStateResult {
  state: UseListDetailStateResult;
  fade: UseFadeTransitionResult;
  closePanel: (() => void) | undefined;
}

/**
 * Composes fade transition and list-detail state from navigation result.
 *
 * @example
 * ```tsx
 * const nav = useCrudNavigation(search, onNavigate);
 * const { state, fade, closePanel } = useCrudPageState(variant, nav);
 * ```
 */
export function useCrudPageState(
  variant: ListDetailVariant | "page",
  nav: Pick<UseCrudNavigationResult, "view" | "selectedId" | "showList" | "showDetail" | "showNew" | "showEdit">,
): UseCrudPageStateResult {
  const { view, selectedId, showList, showDetail, showNew, showEdit } = nav;

  const fade = useFadeTransition({
    active: view === "detail",
    targetId: selectedId ?? null,
  });

  const state: UseListDetailStateResult = {
    selectedId: selectedId ?? null,
    view: view === "list" ? "empty" : view,
    showDetail,
    showList,
    showNew,
    showEdit,
  };

  const closePanel = variant === "page" ? undefined : showList;

  return { state, fade, closePanel };
}
