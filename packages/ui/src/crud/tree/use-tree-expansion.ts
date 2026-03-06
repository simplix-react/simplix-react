import { useCallback, useMemo, useState } from "react";

import type { TreeConfig } from "./tree-types";
import { getAllNodeIds, getAncestorIds, getNodeIdsUpToDepth } from "./tree-utils";

/** @internal Options for the {@link useTreeExpansion} hook. */
interface UseTreeExpansionOptions<T> {
  /** Flat or nested tree data array. */
  data: T[];
  /** Tree structure configuration (id field, children field, etc.). */
  config: TreeConfig<T>;
}

/**
 * Return value of the {@link useTreeExpansion} hook.
 */
export interface UseTreeExpansionResult {
  /** Set of currently expanded node IDs. */
  expandedIds: Set<string>;
  /** Toggle a single node between expanded/collapsed. */
  toggleExpand: (id: string) => void;
  /** Expand all nodes in the tree. */
  expandAll: () => void;
  /** Collapse all nodes in the tree. */
  collapseAll: () => void;
  /** Check whether a specific node is expanded. */
  isExpanded: (id: string) => boolean;
  /** Expand all ancestor nodes to reveal a specific node. */
  expandToNode: (id: string) => void;
}

/**
 * Manage expand/collapse state for a tree data structure.
 *
 * @remarks
 * Initializes with nodes expanded up to `config.initialExpandedDepth` (default 1).
 * Provides `expandAll`, `collapseAll`, and `expandToNode` for programmatic control.
 *
 * @typeParam T - Tree node data type.
 * @param options - Tree data and configuration.
 * @returns Expansion state and control functions.
 *
 * @example
 * ```ts
 * const { expandedIds, toggleExpand, expandAll } = useTreeExpansion({
 *   data: categories,
 *   config: { idField: "id", childrenField: "children" },
 * });
 * ```
 */
export function useTreeExpansion<T>({
  data,
  config,
}: UseTreeExpansionOptions<T>): UseTreeExpansionResult {
  const initialIds = useMemo(
    () => new Set(getNodeIdsUpToDepth(data, config.initialExpandedDepth ?? 1, config)),
    // Only compute on mount
    [],
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(initialIds);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(getAllNodeIds(data, config)));
  }, [data, config]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds],
  );

  const expandToNode = useCallback(
    (id: string) => {
      const ancestors = getAncestorIds(data, id, config);
      if (ancestors.length === 0) return;
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const ancestorId of ancestors) {
          next.add(ancestorId);
        }
        return next;
      });
    },
    [data, config],
  );

  return {
    expandedIds,
    toggleExpand,
    expandAll,
    collapseAll,
    isExpanded,
    expandToNode,
  };
}
