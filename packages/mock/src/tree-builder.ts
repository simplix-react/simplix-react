import type { TreeNode } from "@simplix-react/contract";

/**
 * Converts flat database rows into a recursive embedded tree structure.
 *
 * @remarks
 * Unlike {@link buildTreeFromFlatRows}, this function embeds `children` directly
 * into each row object rather than wrapping rows in a `TreeNode` envelope.
 * Rows with `null`/`undefined` parent or orphaned parent references become root nodes.
 *
 * @param rows - Flat array of entity data rows.
 * @param identityField - The field name used as the node identifier. Defaults to `"id"`.
 * @param parentField - The field name used as the parent reference. Defaults to `"parentId"`.
 * @returns Array of root-level nodes, each augmented with a `children` array.
 *
 * @example
 * ```ts
 * import { buildEmbeddedTree } from "@simplix-react/mock";
 *
 * const rows = [
 *   { id: "1", name: "Root", parentId: null },
 *   { id: "2", name: "Child", parentId: "1" },
 * ];
 * const tree = buildEmbeddedTree(rows);
 * // [{ id: "1", name: "Root", parentId: null, children: [{ id: "2", ... }] }]
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

/**
 * Converts flat database rows into a recursive `TreeNode` structure.
 *
 * @remarks
 * Each row is wrapped in a `TreeNode<T>` with `data` and `children` fields.
 * Rows whose `parentId` is `null`/`undefined` or references a missing parent
 * become root nodes.
 *
 * @param rows - Flat array of entity data rows. Each row must have a `parentId` field.
 * @param identityField - The field name used as the node identifier. Defaults to `"id"`.
 * @returns Array of root-level {@link TreeNode} instances with nested children.
 *
 * @example
 * ```ts
 * import { buildTreeFromFlatRows } from "@simplix-react/mock";
 *
 * const rows = [
 *   { id: 1, name: "Root", parentId: null },
 *   { id: 2, name: "Child A", parentId: 1 },
 *   { id: 3, name: "Child B", parentId: 1 },
 * ];
 * const tree = buildTreeFromFlatRows(rows);
 * // [{ data: { id: 1, ... }, children: [{ data: { id: 2, ... } }, { data: { id: 3, ... } }] }]
 * ```
 */
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
