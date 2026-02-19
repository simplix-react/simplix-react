import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../utils/cn";

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
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...rest}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  ),
);

TooltipContent.displayName = "TooltipContent";
