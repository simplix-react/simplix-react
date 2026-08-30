import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { ALERT_ACTION_CLASS, ALERT_CANCEL_CLASS, AlertPanel } from "../shared/alert-panel";
import { useBeforeUnload } from "./use-before-unload";

/** Options for the {@link useUnsavedChanges} hook. */
export interface UseUnsavedChangesOptions {
  /** Whether the form has unsaved changes. */
  isDirty: boolean;
}

/** Return value of the {@link useUnsavedChanges} hook. */
export interface UseUnsavedChangesReturn {
  /** Wrap navigation callbacks with this to show a confirmation dialog when dirty. */
  guardedNavigate: (callback: () => void) => void;
  /** Alert dialog element to render in your component's JSX. */
  dialog: ReactNode;
}

/**
 * Guard navigation with an unsaved changes confirmation dialog.
 *
 * @remarks
 * Combines `useBeforeUnload` (browser tab close) with an in-app
 * alert dialog for programmatic navigation (e.g. route changes).
 *
 * @param options - {@link UseUnsavedChangesOptions}
 * @returns `guardedNavigate` wrapper and a `dialog` ReactNode to render.
 *
 * @example
 * ```tsx
 * const { guardedNavigate, dialog } = useUnsavedChanges({ isDirty });
 *
 * const handleClose = () => guardedNavigate(() => router.back());
 *
 * return (
 *   <>
 *     <CrudForm onClose={handleClose}>...</CrudForm>
 *     {dialog}
 *   </>
 * );
 * ```
 */
export function useUnsavedChanges({ isDirty }: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const { t } = useTranslation("simplix/ui");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useBeforeUnload(isDirty);

  const guardedNavigate = useCallback((callback: () => void) => {
    if (isDirty) {
      setPendingAction(() => callback);
    } else {
      callback();
    }
  }, [isDirty]);

  const handleConfirm = useCallback(() => {
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
  }, []);

  const dialog: ReactNode = (
    <AlertPanel
      open={pendingAction !== null}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={t("common.unsavedTitle")}
      description={t("common.unsavedDescription")}
      actions={
        <>
          <AlertDialog.Cancel className={ALERT_CANCEL_CLASS} onClick={handleCancel}>
            {t("common.cancel")}
          </AlertDialog.Cancel>
          <AlertDialog.Action
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className={ALERT_ACTION_CLASS}
          >
            {t("common.discard")}
          </AlertDialog.Action>
        </>
      }
    />
  );

  return { guardedNavigate, dialog };
}
