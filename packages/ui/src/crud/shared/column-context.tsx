import { type Dispatch, type SetStateAction, createContext, useContext } from "react";

export interface ColumnInfo {
  field: string;
  label: string;
}

export type CrudListViewMode = "list" | "grid";

export interface CrudListColumnContextValue {
  columns: ColumnInfo[];
  setColumns: Dispatch<SetStateAction<ColumnInfo[]>>;
  hiddenColumns: Set<string>;
  setHiddenColumns: Dispatch<SetStateAction<Set<string>>>;
  /** Effective card-mode mirror (responsive OR manual grid) — used to hide the column toggle. */
  isCardMode: boolean;
  setIsCardMode: Dispatch<SetStateAction<boolean>>;
  /** User-selected view. Drives manual grid rendering when the table opts into `gridView`. */
  viewMode: CrudListViewMode;
  setViewMode: Dispatch<SetStateAction<CrudListViewMode>>;
  /** True when the table declares grid as a selectable view (Table `gridView` + card slots). */
  canGridView: boolean;
  setCanGridView: Dispatch<SetStateAction<boolean>>;
  /** True when width < cardBreakpoint forces cards — used to hide the view toggle. */
  responsiveCardMode: boolean;
  setResponsiveCardMode: Dispatch<SetStateAction<boolean>>;
}

export const CrudListColumnContext = createContext<CrudListColumnContextValue | null>(null);

export function useCrudListColumns() {
  return useContext(CrudListColumnContext);
}
