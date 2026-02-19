import { useContext, useMemo, useSyncExternalStore } from "react";
import { AccessContext } from "./access-provider.js";
import type { AccessPolicy } from "../types.js";

/**
 * Permission descriptor attached to a menu item.
 */
export interface MenuPermission {
  /** The action to check (e.g., "list", "view"). */
  action: string;
  /** The subject to check against (e.g., "Pet", "Order"). */
  subject: string;
}

/**
 * A menu item that can be filtered by access permissions.
 */
export interface FilterableMenuItem {
  /** Permission required to show this item. If absent, always shown. */
  permission?: MenuPermission;
  /** Nested child items, filtered recursively. */
  children?: FilterableMenuItem[];
  [key: string]: unknown;
}

function filterItems<T extends FilterableMenuItem>(
  items: T[],
  policy: AccessPolicy<string, string> | null,
): T[] {
  const result: T[] = [];

  for (const item of items) {
    // Check permission — no policy means show all (opt-in)
    if (
      item.permission &&
      policy &&
      policy.cannot(item.permission.action, item.permission.subject)
    ) {
      continue;
    }

    if (item.children && item.children.length > 0) {
      const filtered = filterItems(
        item.children as (T extends FilterableMenuItem
          ? FilterableMenuItem
          : never)[],
        policy,
      );

      // If all children were filtered out, skip parent too
      if (filtered.length === 0) {
        continue;
      }

      result.push({ ...item, children: filtered });
    } else {
      result.push(item);
    }
  }

  return result;
}

/**
 * Recursively filters a menu tree based on access permissions.
 *
 * @remarks
 * Items with a `permission` property are checked against the current policy.
 * Items without `permission` are always shown. If all children of a parent
 * are filtered out, the parent is also removed.
 *
 * Reactively updates when the policy state changes via `useSyncExternalStore`.
 * When used outside an {@link AccessProvider}, returns all items unfiltered.
 *
 * @typeParam T - Menu item type extending {@link FilterableMenuItem}.
 * @param items - The menu tree to filter.
 * @returns A filtered copy of the menu tree.
 *
 * @example
 * ```tsx
 * import { useMenuFilter } from "@simplix-react/access/react";
 *
 * const menu = [
 *   { label: "Dashboard" },
 *   { label: "Pets", permission: { action: "list", subject: "Pet" } },
 * ];
 *
 * function Sidebar() {
 *   const filtered = useMenuFilter(menu);
 *   return filtered.map(item => <MenuItem key={item.label} {...item} />);
 * }
 * ```
 */
export function useMenuFilter<T extends FilterableMenuItem>(items: T[]): T[] {
  const policy = useContext(AccessContext);

  // Subscribe to policy changes for reactive updates.
  // The snapshot reference changes only when rules change (cached in createAccessPolicy).
  const snapshot = useSyncExternalStore(
    policy ? policy.subscribe : emptySubscribe,
    policy ? policy.getSnapshot : emptySnapshot,
    policy ? policy.getSnapshot : emptySnapshot,
  );

  return useMemo(() => filterItems(items, policy), [items, policy, snapshot]);
}

const EMPTY_SNAPSHOT = {};

function emptySubscribe(_listener: () => void): () => void {
  return () => {};
}

function emptySnapshot(): object {
  return EMPTY_SNAPSHOT;
}
