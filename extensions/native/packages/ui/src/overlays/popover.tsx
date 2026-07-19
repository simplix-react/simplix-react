import * as PopoverPrimitive from "@rn-primitives/popover";
import type { ReactNode } from "react";

import { cn } from "../utils/cn";

/** Props for the {@link Popover} component. */
export interface PopoverProps {
  /** Element that toggles the popover (rendered with `asChild`). */
  trigger: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Anchored popover for lightweight contextual content (tablet-oriented).
 * Phone-first flows should prefer `BottomSheet`.
 */
export function Popover({ trigger, children, className }: PopoverProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Overlay className="absolute inset-0">
          <PopoverPrimitive.Content
            className={cn(
              "rounded-lg border border-border bg-popover p-3 shadow-md",
              className,
            )}
          >
            {children}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Overlay>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
