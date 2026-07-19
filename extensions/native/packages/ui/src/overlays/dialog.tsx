import * as DialogPrimitive from "@rn-primitives/dialog";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Button } from "../controls/button";
import { Heading } from "../primitives/heading";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Props for the {@link Dialog} component. */
export interface DialogProps {
  /** Controlled visibility. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Footer row (typically action buttons). */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Centered modal dialog. Sheet-first is the mobile default — reserve Dialog
 * for small confirmations and focused single-input prompts; destructive
 * confirmation belongs to `AlertDialog`.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  className,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="absolute inset-0 items-center justify-center bg-black/50 p-6">
          <DialogPrimitive.Content
            className={cn(
              "w-full max-w-md gap-3 rounded-xl border border-border bg-card p-5 shadow-lg",
              className,
            )}
          >
            {title ? <Heading level={5}>{title}</Heading> : null}
            {description ? (
              <Text size="sm" tone="muted">
                {description}
              </Text>
            ) : null}
            {children}
            {footer ? <View className="flex-row justify-end gap-2 pt-2">{footer}</View> : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Close button helper for {@link Dialog} footers. */
export function DialogClose({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Button variant="outline" onPress={onPress}>
      {label}
    </Button>
  );
}
