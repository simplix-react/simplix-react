import { useCallback, useMemo, useState } from "react";

import type { TreeConfig } from "./tree-types";
import { getAllNodeIds, getAncestorIds, getNodeIdsUpToDepth } from "./tree-utils";

interface UseTreeExpansionOptions<T> {
  data: T[];
  config: TreeConfig<T>;
}

export interface UseTreeExpansionResult {
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isExpanded: (id: string) => boolean;
  expandToNode: (id: string) => void;
}

export function useTreeExpansion<T>({
  data,
  config,
}: UseTreeExpansionOptions<T>): UseTreeExpansionResult {
  const initialIds = useMemo(
    () => new Set(getNodeIdsUpToDepth(data, config.initialExpandedDepth ?? 1, config)),
    // Only compute on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
