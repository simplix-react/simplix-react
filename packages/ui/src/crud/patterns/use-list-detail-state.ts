import { useCallback, useState } from "react";

/** Possible views in a list-detail layout. */
export type DetailView = "empty" | "detail" | "new" | "edit";

/** Return type of {@link useListDetailState}. */
export interface UseListDetailStateResult {
  selectedId: string | null;
  view: DetailView;
  showDetail: (id: string) => void;
  showList: () => void;
  showNew: () => void;
  showEdit: (id: string) => void;
}

/** Options for {@link useListDetailState}. */
export interface UseListDetailStateOptions {
  initialView?: DetailView;
}

/**
 * Manages the view state for a list-detail layout
 * (empty / detail / new / edit) together with the selected item id.
 */
export function useListDetailState(
  options?: UseListDetailStateOptions,
): UseListDetailStateResult {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<DetailView>(options?.initialView ?? "empty");

  const showDetail = useCallback((id: string) => {
    setSelectedId(id);
    setView("detail");
  }, []);

  const showList = useCallback(() => {
    setSelectedId(null);
    setView("empty");
  }, []);

  const showNew = useCallback(() => {
    setSelectedId(null);
    setView("new");
  }, []);

  const showEdit = useCallback((id: string) => {
    setSelectedId(id);
    setView("edit");
  }, []);

  return { selectedId, view, showDetail, showList, showNew, showEdit };
}
