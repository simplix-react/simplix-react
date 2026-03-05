import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { cn } from "../../utils/cn";
import { useBeforeUnload } from "./use-before-unload";

export interface UseUnsavedChangesOptions {
  isDirty: boolean;
}

export interface UseUnsavedChangesReturn {
  /** Wrap navigation callbacks with this to show confirmation when dirty */
  guardedNavigate: (callback: () => void) => void;
  /** Render this in your component's JSX to show the confirmation dialog */
  dialog: ReactNode;
}

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
    <AlertDialog.Root open={pendingAction !== null} onOpenChange={(open) => { if (!open) handleCancel(); }}>
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
            {t("common.unsavedTitle")}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {t("common.unsavedDescription")}
          </AlertDialog.Description>
          <footer className="mt-6 flex w-full justify-end gap-2">
            <AlertDialog.Cancel
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                "border border-input bg-background transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none",
              )}
              onClick={handleCancel}
            >
              {t("common.cancel")}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                "bg-destructive text-destructive-foreground transition-colors",
                "hover:bg-destructive/90",
                "focus-visible:outline-none",
              )}
            >
              {t("common.discard")}
            </AlertDialog.Action>
          </footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );

  return { guardedNavigate, dialog };
}
