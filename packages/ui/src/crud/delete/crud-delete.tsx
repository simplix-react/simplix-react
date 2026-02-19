import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { cn } from "../../utils/cn";

/** Props for the {@link CrudDelete} confirmation dialog. */
export interface CrudDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
  entityName?: string;
  /** Label for the cancel button (defaults to `"Cancel"`). */
  cancelLabel?: string;
  /** Label for the delete button (defaults to `"Delete"`). */
  deleteLabel?: string;
  /** Label shown while deletion is in progress (defaults to `"Deleting..."`). */
  deletingLabel?: string;
}

/**
 * Delete confirmation dialog using Radix AlertDialog.
 * Requires explicit user confirmation before deletion proceeds.
 *
 * @example
 * ```tsx
 * <CrudDelete
 *   open={showDelete}
 *   onOpenChange={setShowDelete}
 *   onConfirm={handleDelete}
 *   entityName="user"
 *   loading={isDeleting}
 * />
 * ```
 */
export function CrudDelete({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
  entityName,
  cancelLabel = "Cancel",
  deleteLabel = "Delete",
  deletingLabel = "Deleting...",
}: CrudDeleteProps) {
  const displayTitle = title ?? `Delete ${entityName ?? "item"}`;
  const displayDescription =
    description ??
    `Are you sure you want to delete this ${entityName ?? "item"}? This action cannot be undone.`;

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <AlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border bg-background p-6 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <AlertDialog.Title className="text-lg font-semibold">
            {displayTitle}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {displayDescription}
          </AlertDialog.Description>
          <footer className="mt-6 flex w-full justify-end gap-2">
            <AlertDialog.Cancel
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                "border border-input bg-background ring-offset-background transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
              disabled={loading}
            >
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                "bg-destructive text-destructive-foreground ring-offset-background transition-colors",
                "hover:bg-destructive/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
              disabled={loading}
            >
              {loading ? deletingLabel : deleteLabel}
            </AlertDialog.Action>
          </footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
