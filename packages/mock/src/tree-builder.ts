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
export function buildTreeFromFlatRows<T extends Record<string, unknown>>(
  rows: T[],
  identityField = "id",
): TreeNode<T>[] {
  const nodeMap = new Map<unknown, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  // Create all nodes first
  for (const row of rows) {
    nodeMap.set(row[identityField], { data: row, children: [] });
  }

  // Build parent-child relationships
  for (const row of rows) {
    const node = nodeMap.get(row[identityField])!;
    const parentId = row.parentId;

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
