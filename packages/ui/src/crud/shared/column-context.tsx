import { type Dispatch, type SetStateAction, createContext, useContext } from "react";

export interface ColumnInfo {
  field: string;
  label: string;
}

export interface CrudListColumnContextValue {
  columns: ColumnInfo[];
  setColumns: Dispatch<SetStateAction<ColumnInfo[]>>;
  hiddenColumns: Set<string>;
  setHiddenColumns: Dispatch<SetStateAction<Set<string>>>;
  isCardMode: boolean;
  setIsCardMode: Dispatch<SetStateAction<boolean>>;
}

export const CrudListColumnContext = createContext<CrudListColumnContextValue | null>(null);

export function useCrudListColumns() {
  return useContext(CrudListColumnContext);
}
