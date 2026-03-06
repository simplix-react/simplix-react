/**
 * Internal metadata injected into flattened tree rows for rendering.
 *
 * @remarks
 * These fields are added by `treeToFlat()` and consumed by `CrudTree.Table`
 * to render indentation, expand/collapse chevrons, and loading states.
 */
export interface TreeNodeMetadata {
  /** Nesting depth (0 = root). */
  _treeDepth: number;
  /** Whether this node has children. */
  _hasChildren: boolean;
  /** Whether this node is currently expanded. */
  _isExpanded: boolean;
  /** Whether this node's children are loading (for lazy loading). */
  _isLoading?: boolean;
}

/**
 * Configuration for tree data structure mapping.
 *
 * @typeParam T - Tree node data type.
 */
export interface TreeConfig<T> {
  /** Field name for node ID. Defaults to `"id"`. */
  idField?: keyof T & string;
  /** Field name for parent ID (flat-list mode). */
  parentIdField?: keyof T & string;
  /** Field name for nested children array. Defaults to `"children"`. */
  childrenField?: keyof T & string;
  /** Number of levels to expand initially. Defaults to `1`. */
  initialExpandedDepth?: number;
}

/**
 * Configuration for drag-and-drop reordering within a tree level.
 *
 * @typeParam T - Tree node data type.
 */
export interface TreeReorderConfig<T> {
  /** Field name for sort order (e.g. `"displayOrder"`). */
  orderField: keyof T & string;
  /** Field name for node ID. Defaults to `"id"`. */
  idField?: keyof T & string;
  /** Called after reorder with the parent ID and reordered sibling items. */
  onReorder: (parentId: string | null, items: T[]) => void | Promise<void>;
}

/**
 * Configuration for moving a node to a different parent in the tree.
 *
 * @typeParam T - Tree node data type.
 */
export interface TreeMoveConfig<T> {
  /** Field name for node ID. Defaults to `"id"`. */
  idField?: keyof T & string;
  /** Field name for parent ID. */
  parentIdField?: keyof T & string;
  /** Extract a display name from a node for the move dialog. */
  getDisplayName: (item: T) => string;
  /** Called when the user confirms the move. `null` parent means root level. */
  onMove: (itemId: string, newParentId: string | null) => void | Promise<void>;
}
