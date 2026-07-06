import { createContext, useCallback, useContext, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { transformToGroup } from "./menu-transformer";
import type {
  FixedMenuItem,
  MenuContextValue,
  MenuProviderProps,
  NavigationGroup,
} from "./menu-types";

const MenuContext = createContext<MenuContextValue | null>(null);

// Query-key prefix for the nav menu-tree queries (one query per menu group code).
// Exported so hosts can register or invalidate it (e.g. localStorage persistence,
// or refreshing the nav after a menu edit).
export const MENU_TREE_QUERY_KEY = ["menu", "tree"] as const;

export function MenuProvider({
  fetchMenuTree,
  menuGroups,
  fixedGroups = [],
  permissionFilter,
  locale = "ko",
  staleTime = 5 * 60 * 1000,
  children,
}: MenuProviderProps) {
  const results = useQueries({
    queries: menuGroups.map((config) => ({
      queryKey: [...MENU_TREE_QUERY_KEY, config.menuCode] as const,
      queryFn: ({ signal }) => fetchMenuTree(config.menuCode, signal),
      staleTime,
      refetchOnWindowFocus: true,
    })),
  });

  const groups: NavigationGroup[] = useMemo(
    () =>
      results
        .map((r, i) => {
          if (!r.data) return null;
          return transformToGroup(menuGroups[i], r.data, locale, permissionFilter);
        })
        .filter((g): g is NavigationGroup => g !== null),
    [results, menuGroups, locale, permissionFilter],
  );

  const isLoading = results.some((r) => r.isLoading);
  const error = (results.find((r) => r.error)?.error as Error | null) ?? null;

  const getFixedGroup = useCallback(
    (code: string): FixedMenuItem[] =>
      fixedGroups.find((g) => g.groupCode === code)?.items ?? [],
    [fixedGroups],
  );

  const value: MenuContextValue = useMemo(
    () => ({ groups, getFixedGroup, isLoading, error }),
    [groups, getFixedGroup, isLoading, error],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return ctx;
}
