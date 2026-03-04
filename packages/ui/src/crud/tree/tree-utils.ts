import type { TreeConfig, TreeNodeMetadata } from "./tree-types";

function getId<T>(item: T, config: TreeConfig<T>): string {
  const field = config.idField ?? ("id" as keyof T & string);
  return String((item as Record<string, unknown>)[field]);
}

function getChildren<T>(item: T, config: TreeConfig<T>): T[] {
  const field = config.childrenField ?? ("children" as keyof T & string);
  return ((item as Record<string, unknown>)[field] as T[] | undefined) ?? [];
}

/**
 * Convert recursive tree data to a flat array for table rendering.
 * Walks DFS, only expanding nodes present in expandedIds.
 */
export function treeToFlat<T>(
  data: T[],
  expandedIds: Set<string>,
  config: TreeConfig<T>,
  loadingIds?: Set<string>,
): Array<T & TreeNodeMetadata> {
  const result: Array<T & TreeNodeMetadata> = [];

  function walk(items: T[], depth: number) {
    for (const item of items) {
      const id = getId(item, config);
      const children = getChildren(item, config);
      const hasChildren = children.length > 0;
      const isExpanded = expandedIds.has(id);

      result.push({
        ...item,
        _treeDepth: depth,
        _hasChildren: hasChildren,
        _isExpanded: isExpanded,
        _isLoading: loadingIds?.has(id),
      });

      if (hasChildren && isExpanded) {
        walk(children, depth + 1);
      }
    }
  }

  walk(data, 0);
  return result;
}

/** Get all node IDs from recursive tree (for expandAll). */
export function getAllNodeIds<T>(data: T[], config: TreeConfig<T>): string[] {
  const ids: string[] = [];

  function walk(items: T[]) {
    for (const item of items) {
      ids.push(getId(item, config));
      const children = getChildren(item, config);
      if (children.length > 0) {
        walk(children);
      }
    }
  }

  walk(data);
  return ids;
}

/** Get node IDs up to a certain depth (for initial expansion). */
export function getNodeIdsUpToDepth<T>(
  data: T[],
  depth: number,
  config: TreeConfig<T>,
): string[] {
  const ids: string[] = [];

  function walk(items: T[], currentDepth: number) {
    if (currentDepth >= depth) return;
    for (const item of items) {
      const children = getChildren(item, config);
      if (children.length > 0) {
        ids.push(getId(item, config));
        walk(children, currentDepth + 1);
      }
    }
  }

  walk(data, 0);
  return ids;
}

/** Get all descendant IDs of a node (for move dialog - prevent circular refs). */
export function getDescendantIds<T>(
  data: T[],
  nodeId: string,
  config: TreeConfig<T>,
): Set<string> {
  const descendants = new Set<string>();

  function findAndCollect(items: T[]): boolean {
    for (const item of items) {
      if (getId(item, config) === nodeId) {
        collectAll(getChildren(item, config));
        return true;
      }
      const children = getChildren(item, config);
      if (children.length > 0 && findAndCollect(children)) {
        return true;
      }
    }
    return false;
  }

  function collectAll(items: T[]) {
    for (const item of items) {
      descendants.add(getId(item, config));
      collectAll(getChildren(item, config));
    }
  }

  findAndCollect(data);
  return descendants;
}

/** Get ancestor IDs of a node (for expandToNode). */
export function getAncestorIds<T>(
  data: T[],
  targetId: string,
  config: TreeConfig<T>,
): string[] {
  const path: string[] = [];

  function walk(items: T[]): boolean {
    for (const item of items) {
      const id = getId(item, config);
      if (id === targetId) return true;
      const children = getChildren(item, config);
      if (children.length > 0) {
        path.push(id);
        if (walk(children)) return true;
        path.pop();
      }
    }
    return false;
  }

  walk(data);
  return path;
}

/** Get siblings (same parent children). */
export function getSiblings<T>(
  data: T[],
  parentId: string | null,
  config: TreeConfig<T>,
): T[] {
  if (parentId === null) return data;

  function find(items: T[]): T[] | null {
    for (const item of items) {
      if (getId(item, config) === parentId) {
        return getChildren(item, config);
      }
      const children = getChildren(item, config);
      if (children.length > 0) {
        const found = find(children);
        if (found) return found;
      }
    }
    return null;
  }

  return find(data) ?? [];
}

/** Filter tree preserving ancestors of matching nodes. */
export function filterTreeWithAncestors<T>(
  data: T[],
  matchFn: (item: T) => boolean,
  config: TreeConfig<T>,
): T[] {
  const childrenField = config.childrenField ?? ("children" as keyof T & string);

  function filterNodes(items: T[]): T[] {
    const result: T[] = [];
    for (const item of items) {
      const children = getChildren(item, config);
      const filteredChildren = children.length > 0 ? filterNodes(children) : [];
      const selfMatches = matchFn(item);

      if (selfMatches || filteredChildren.length > 0) {
        result.push({
          ...item,
          [childrenField]: filteredChildren,
        });
      }
    }
    return result;
  }

  return filterNodes(data);
}
