import { useContext, useMemo } from "react";

import { useMenu } from "./menu-provider";
import { RouteMatcherContext } from "./route-matcher-context";
import type { NavigationItem, UseActiveMenuItemOptions } from "./menu-types";

/**
 * Returns the menu item matching the current route, or undefined.
 *
 * Matching is delegated to the host router (via {@link RouteMatcherContext})
 * instead of string prefix comparison — so route boundaries and dynamic
 * params are handled correctly. Among all matches the most specific (longest
 * href) wins; ties resolve deterministically by tree order.
 *
 * Requires a {@link RouteMatcherProvider} above in the tree; without it
 * (no router match capability injected) this returns undefined.
 */
export function useActiveMenuItem(
  options: UseActiveMenuItemOptions = {},
): NavigationItem | undefined {
  const { groups } = useMenu();
  const matchRoute = useContext(RouteMatcherContext);
  const { menuCode } = options;

  return useMemo(() => {
    if (!matchRoute) return undefined;

    const scoped = menuCode
      ? groups.filter((g) => g.groupCode === menuCode)
      : groups;

    const hits: NavigationItem[] = [];
    const walk = (items: readonly NavigationItem[]) => {
      for (const item of items) {
        if (item.href && matchRoute(item.href, { fuzzy: true })) {
          hits.push(item);
        }
        if (item.children?.length) walk(item.children);
      }
    };
    scoped.forEach((g) => walk(g.items));

    if (hits.length === 0) return undefined;
    // Most specific (longest href) wins; stable order keeps ties deterministic.
    return hits.reduce((best, cur) =>
      cur.href.length > best.href.length ? cur : best,
    );
  }, [groups, matchRoute, menuCode]);
}
