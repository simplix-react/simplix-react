import { useCallback } from "react";

import type { CrudSearch, CrudView } from "./crud-search";
import type { ListDetailVariant } from "./list-detail";
import type { UseFadeTransitionResult } from "./use-fade-transition";
import type { UseListDetailStateResult } from "./use-list-detail-state";

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
   * carries more than the record — which explanation is open, which tab — hands over a handler
   * that reads that wider shape, and a parameter fixed at the narrow one refuses it.
   */
  onNavigate: (search: S) => void,
): UseCrudNavigationResult {
  const { view, selectedId } = parseCrudSearch(search);

  const tab = search.tab;
  const showList = useCallback(() => onNavigate(buildCrudSearch("list", undefined, tab) as S), [onNavigate, tab]);
  const showDetail = useCallback((id: string) => onNavigate(buildCrudSearch("detail", id, tab) as S), [onNavigate, tab]);
  const showNew = useCallback(() => onNavigate(buildCrudSearch("new", undefined, tab) as S), [onNavigate, tab]);
  const showEdit = useCallback((id: string) => onNavigate(buildCrudSearch("edit", id, tab) as S), [onNavigate, tab]);

  return { view, selectedId, showList, showDetail, showNew, showEdit };
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
  nav: UseCrudNavigationResult,
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
