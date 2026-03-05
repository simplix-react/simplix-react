import { useTranslation } from "@simplix-react/i18n/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import { cn } from "../../utils/cn";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  onConfirm: () => void;
  isPending?: boolean;
  pendingLabel?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  isPending = false,
  pendingLabel,
}: ConfirmDialogProps) {
  const { t } = useTranslation("simplix/ui");
  const resolvedConfirmLabel = confirmLabel ?? t("common.confirm");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel");

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
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <footer className="mt-6 flex w-full justify-end gap-2">
            <AlertDialog.Cancel
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                "border border-input bg-background transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
              disabled={isPending}
            >
              {resolvedCancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                "transition-colors focus-visible:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
                variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              disabled={isPending}
            >
              {isPending ? (pendingLabel ?? resolvedConfirmLabel) : resolvedConfirmLabel}
            </AlertDialog.Action>
          </footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
