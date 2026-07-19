import * as AlertDialogPrimitive from "@rn-primitives/alert-dialog";
import { useTranslation } from "@simplix-react/i18n/react";
import { View } from "react-native";

import { Button } from "../controls/button";
import { Heading } from "../primitives/heading";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Props for the {@link AlertDialog} component. */
export interface AlertDialogProps {
  /** Controlled visibility. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Confirm button label. Defaults to the localized "Confirm". */
  confirmLabel?: string;
  /** Cancel button label. Defaults to the localized "Cancel". */
  cancelLabel?: string;
  /** Renders the confirm action in the destructive variant. */
  destructive?: boolean;
  /** Called when the user confirms. */
  onConfirm: () => void;
  className?: string;
}

/**
 * Blocking confirmation dialog — the only dialog-first interaction in the
 * mobile grammar. Use for destructive or irreversible confirmation.
 *
 * @example
 * ```tsx
 * <AlertDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete this visit?"
 *   destructive
 *   onConfirm={remove}
 * />
 * ```
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  className,
}: AlertDialogProps) {
  const { t } = useTranslation("simplix/native");

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="absolute inset-0 items-center justify-center bg-black/50 p-6">
          <AlertDialogPrimitive.Content
            className={cn(
              "w-full max-w-md gap-3 rounded-xl border border-border bg-card p-5 shadow-lg",
              className,
            )}
          >
            <Heading level={5}>{title}</Heading>
            {description ? (
              <Text size="sm" tone="muted">
                {description}
              </Text>
            ) : null}
            <View className="flex-row justify-end gap-2 pt-2">
              <AlertDialogPrimitive.Cancel asChild>
                <Button variant="outline">{cancelLabel ?? t("common.cancel")}</Button>
              </AlertDialogPrimitive.Cancel>
              <AlertDialogPrimitive.Action asChild>
                <Button
                  variant={destructive ? "destructive" : "default"}
                  onPress={onConfirm}
                >
                  {confirmLabel ?? t("common.confirm")}
                </Button>
              </AlertDialogPrimitive.Action>
            </View>
          </AlertDialogPrimitive.Content>
        </AlertDialogPrimitive.Overlay>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
