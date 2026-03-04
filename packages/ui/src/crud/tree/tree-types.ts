export interface TreeNodeMetadata {
  _treeDepth: number;
  _hasChildren: boolean;
  _isExpanded: boolean;
  _isLoading?: boolean;
}

export interface TreeConfig<T> {
  idField?: keyof T & string;
  parentIdField?: keyof T & string;
  childrenField?: keyof T & string;
  initialExpandedDepth?: number;
}

export interface TreeReorderConfig<T> {
  orderField: keyof T & string;
  idField?: keyof T & string;
  onReorder: (parentId: string | null, items: T[]) => void | Promise<void>;
}

export interface TreeMoveConfig<T> {
  idField?: keyof T & string;
  parentIdField?: keyof T & string;
  getDisplayName: (item: T) => string;
  onMove: (itemId: string, newParentId: string | null) => void | Promise<void>;
}
