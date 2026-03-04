import type { TreeNode } from "@simplix-react/contract";

/**
 * Converts flat database rows into a recursive tree structure.
 *
 * Expects each row to have an identity field and a `parentId` field.
 * Rows with `null` parentId become root nodes.
 *
 * @param rows - Flat array of entity data rows.
 * @param identityField - The field name used as the node identifier. Defaults to `"id"`.
 * @returns Array of root-level tree nodes with nested children.
 *
 * @example
 * ```ts
 * const rows = [
 *   { id: "1", name: "Root", parentId: null },
 *   { id: "2", name: "Child", parentId: "1" },
 * ];
 * const tree = buildTreeFromFlatRows(rows);
 * // [{ data: { id: "1", ... }, children: [{ data: { id: "2", ... }, children: [] }] }]
 * ```
 */
export function buildEmbeddedTree<T extends object>(
  rows: T[],
  identityField = "id",
  parentField = "parentId",
): (T & { children: unknown[] })[] {
  type EmbeddedNode = T & { children: unknown[] };
  const nodeMap = new Map<unknown, EmbeddedNode>();
  const roots: EmbeddedNode[] = [];

  for (const row of rows) {
    const r = row as Record<string, unknown>;
    nodeMap.set(r[identityField], { ...row, children: [] });
  }

  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const node = nodeMap.get(r[identityField])!;
    const parentId = r[parentField];

    if (parentId == null) {
      roots.push(node);
    } else {
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}

export function buildTreeFromFlatRows<T extends object>(
  rows: T[],
  identityField = "id",
): TreeNode<T>[] {
  const nodeMap = new Map<unknown, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  // Create all nodes first
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    nodeMap.set(r[identityField], { data: row, children: [] });
  }

  // Build parent-child relationships
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const node = nodeMap.get(r[identityField])!;
    const parentId = r.parentId;

    if (parentId == null) {
      roots.push(node);
    } else {
      const parentNode = nodeMap.get(parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // Orphan node — treat as root
        roots.push(node);
      }
    }
  }

  return roots;
}
