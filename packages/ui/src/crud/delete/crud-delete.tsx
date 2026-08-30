import { useTranslation } from "@simplix-react/i18n/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { ALERT_ACTION_CLASS, ALERT_CANCEL_CLASS, AlertPanel } from "../shared/alert-panel";

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
 *
 * ```
 * ┌─────────────────────────────────┐
 * │ Delete user?                    │
 * │                                 │
 * │ This action cannot be undone.   │
 * │                                 │
 * │         [Cancel] [Delete]       │
 * └─────────────────────────────────┘
 * ```
 *
 * @param props - {@link CrudDeleteProps}
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
  cancelLabel,
  deleteLabel,
  deletingLabel,
}: CrudDeleteProps) {
  const { t } = useTranslation("simplix/ui");
  const displayTitle = title ?? t("list.deleteTitle", { entity: entityName ?? "item" });
  const displayDescription =
    description ?? t("list.deleteDescription", { entity: entityName ?? "item" });

  return (
    <AlertPanel
      open={open}
      onOpenChange={onOpenChange}
      title={displayTitle}
      description={displayDescription}
      actions={
        <>
          <AlertDialog.Cancel className={ALERT_CANCEL_CLASS} disabled={loading}>
            {cancelLabel ?? t("common.cancel")}
          </AlertDialog.Cancel>
          <AlertDialog.Action
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={ALERT_ACTION_CLASS}
            disabled={loading}
          >
            {loading ? (deletingLabel ?? t("common.deleting")) : (deleteLabel ?? t("common.delete"))}
          </AlertDialog.Action>
        </>
      }
    />
  );
}
