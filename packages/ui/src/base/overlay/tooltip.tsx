import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { tooltipArrowStyle, tooltipContentStyle } from "./tooltip.style";

// Provider
export type TooltipProviderProps = ComponentPropsWithRef<
  typeof TooltipPrimitive.Provider
>;

export function TooltipProvider({
  delayDuration = 0,
  ...rest
}: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...rest} />;
}

// Root - pass through
export const Tooltip = TooltipPrimitive.Root;

// Trigger - pass through
export const TooltipTrigger = TooltipPrimitive.Trigger;

// Entry and exit motion comes from the tw-animate-css utilities. They are not part of this
// package's stylesheet, so they stay on the element: the generated design stylesheet cannot
// @apply a utility that is not defined where it is compiled.
const CONTENT_MOTION =
  "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:data-[side=bottom]:slide-out-to-top-1 data-[state=closed]:data-[side=top]:slide-out-to-bottom-1 data-[state=closed]:data-[side=left]:slide-out-to-right-1 data-[state=closed]:data-[side=right]:slide-out-to-left-1";

// Content
export type TooltipContentProps = ComponentPropsWithRef<
  typeof TooltipPrimitive.Content
>;

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 0, children, ...rest }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn("z-50 w-fit", CONTENT_MOTION, className)}
        {...rest}
        {...slotAttributes(tooltipContentStyle, {})}
      >
        {children}
        <TooltipPrimitive.Arrow
          className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45"
          {...slotAttributes(tooltipArrowStyle, {})}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  ),
);

TooltipContent.displayName = "TooltipContent";
