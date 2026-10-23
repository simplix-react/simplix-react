import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { popoverContentStyle } from "./popover.style";

// Root - pass through
export const Popover = PopoverPrimitive.Root;

// Trigger - pass through
export const PopoverTrigger = PopoverPrimitive.Trigger;

// Anchor - pass through
export const PopoverAnchor = PopoverPrimitive.Anchor;

// Entry and exit motion comes from the tw-animate-css utilities. They are not part of this
// package's stylesheet, so they stay on the element: the generated design stylesheet cannot
// @apply a utility that is not defined where it is compiled.
const CONTENT_MOTION =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

// Content
export type PopoverContentProps = ComponentPropsWithRef<
  typeof PopoverPrimitive.Content
> & {
  /** Drops the panel padding, for a body that draws its own. */
  flush?: boolean;
};

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, flush = false, ...rest }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn("z-50 w-72", CONTENT_MOTION, className)}
        {...rest}
        {...slotAttributes(popoverContentStyle, { flush })}
      />
    </PopoverPrimitive.Portal>
  ),
);

PopoverContent.displayName = "PopoverContent";
