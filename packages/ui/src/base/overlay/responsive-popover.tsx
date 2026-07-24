import type { ReactNode } from "react";

import { useMediaQuery } from "../../hooks/use-media-query";
import { cn } from "../../utils/cn";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * Viewport width at or below which overlays center as a modal dialog instead of
 * anchoring as a popover. Matches Tailwind's `sm` breakpoint boundary.
 */
export const MOBILE_MEDIA_QUERY = "(max-width: 640px)";

/** Props for the {@link ResponsivePopover} component. */
export interface ResponsivePopoverProps {
  /** Whether the overlay is open. */
  open: boolean;
  /** Called when the open state should change. */
  onOpenChange: (open: boolean) => void;
  /** The trigger element; rendered via `asChild`. */
  trigger: ReactNode;
  /** Accessible title for the mobile dialog (visually hidden). */
  title: ReactNode;
  /** Overlay body. */
  children: ReactNode;
  /** Popover alignment on desktop. @defaultValue "start" */
  align?: "start" | "center" | "end";
  /** Extra class name applied to the overlay content wrapper. */
  contentClassName?: string;
}

/**
 * Anchored popover on desktop, centered modal dialog on mobile.
 *
 * On viewports at or below {@link MOBILE_MEDIA_QUERY} the body renders inside a
 * centered, scrollable dialog so it can never be clipped by the viewport edge
 * the way an anchored popover can; above it, it renders as a normal popover.
 */
export function ResponsivePopover({
  open,
  onOpenChange,
  trigger,
  title,
  children,
  align = "start",
  contentClassName,
}: ResponsivePopoverProps) {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className={cn(
            "w-auto max-w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto p-0",
            contentClassName,
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    // modal: inside a Dialog, the dialog's scroll lock blocks wheel events on
    // body-portaled popovers; a modal popover registers its own scroll-lock
    // layer so wheel scrolling works in the calendar's option lists.
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className={cn("w-auto p-0", contentClassName)}
        align={align}
        style={{ maxHeight: "var(--radix-popover-content-available-height)", overflowY: "auto" }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
