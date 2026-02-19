import { useCallback, useState } from "react";

// ── List variant ──

/** Target descriptor for list-level delete confirmation. */
export interface DeleteTarget {
  id: string | number;
  name: string;
}

/** Return type of {@link useCrudDeleteList}. */
export interface UseCrudDeleteListResult {
  open: boolean;
  target: DeleteTarget | null;
  requestDelete: (target: DeleteTarget) => void;
  cancel: () => void;
}

/**
 * Manages delete-confirmation state for a **list** view where the user
 * picks one row at a time to delete.
 *
 * @example
 * ```tsx
 * const del = useCrudDeleteList();
 * // trigger: del.requestDelete({ id: row.id, name: row.name })
 * // <CrudDelete open={del.open} onOpenChange={(o) => { if (!o) del.cancel(); }} ... />
 * ```
 */
export function useCrudDeleteList(): UseCrudDeleteListResult {
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  const requestDelete = useCallback((t: DeleteTarget) => setTarget(t), []);
  const cancel = useCallback(() => setTarget(null), []);

  return { open: !!target, target, requestDelete, cancel };
}

// ── Detail variant ──

/** Return type of {@link useCrudDeleteDetail}. */
export interface UseCrudDeleteDetailResult {
  open: boolean;
  requestDelete: () => void;
  cancel: () => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * Manages delete-confirmation state for a **detail** view (single item).
 *
 * @example
 * ```tsx
 * const del = useCrudDeleteDetail();
 * // trigger: del.requestDelete()
 * // <CrudDelete open={del.open} onOpenChange={del.onOpenChange} ... />
 * ```
 */
export function useCrudDeleteDetail(): UseCrudDeleteDetailResult {
  const [open, setOpen] = useState(false);

  const requestDelete = useCallback(() => setOpen(true), []);
  const cancel = useCallback(() => setOpen(false), []);
  const onOpenChange = useCallback((o: boolean) => setOpen(o), []);

  return { open, requestDelete, cancel, onOpenChange };
}
