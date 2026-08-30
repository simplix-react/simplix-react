import { useTranslation } from "@simplix-react/i18n/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { ALERT_ACTION_CLASS, ALERT_CANCEL_CLASS, AlertPanel } from "./alert-panel";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true, hides the cancel button. Useful for info-only dialogs. */
  hideCancel?: boolean;

  onConfirm: () => void;
  isPending?: boolean;
  pendingLabel?: string;
}

/**
 * Confirmation dialog: a title, an optional description, and a footer that commits or cancels.
 *
 * @remarks
 * Drawn in {@link AlertPanel}, so a long description scrolls inside the panel and the footer
 * stays reachable at any window height.
 *
 * @param props - {@link ConfirmDialogProps}
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,

  hideCancel = false,
  onConfirm,
  isPending = false,
  pendingLabel,
}: ConfirmDialogProps) {
  const { t } = useTranslation("simplix/ui");
  const resolvedConfirmLabel = confirmLabel ?? t("common.confirm");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel");

  return (
    <AlertPanel
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      actions={
        <>
          {!hideCancel && (
            <AlertDialog.Cancel className={ALERT_CANCEL_CLASS} disabled={isPending}>
              {resolvedCancelLabel}
            </AlertDialog.Cancel>
          )}
          <AlertDialog.Action
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={ALERT_ACTION_CLASS}
            disabled={isPending}
          >
            {isPending ? (pendingLabel ?? resolvedConfirmLabel) : resolvedConfirmLabel}
          </AlertDialog.Action>
        </>
      }
    />
  );
}
