import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../utils/cn";

// Root - pass through
export const Sheet = DialogPrimitive.Root;

// Trigger - pass through
export const SheetTrigger = DialogPrimitive.Trigger;

// Close - pass through
export const SheetClose = DialogPrimitive.Close;

// Overlay (internal)
const SheetOverlay = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<typeof DialogPrimitive.Overlay>
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className,
    )}
    {...rest}
  />
));

SheetOverlay.displayName = "SheetOverlay";

// Content
export type SheetContentProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Content
> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
};

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  (
    { className, children, side = "right", showCloseButton = true, ...rest },
    ref,
  ) => (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...rest}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);

SheetContent.displayName = "SheetContent";

// Header
export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function SheetHeader({ className, ...rest }: SheetHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...rest}
    />
  );
}

// Footer
export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function SheetFooter({ className, ...rest }: SheetFooterProps) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...rest}
    />
  );
}

// Title
export type SheetTitleProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Title
>;

export const SheetTitle = forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...rest }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-foreground font-semibold", className)}
      {...rest}
    />
  ),
);

SheetTitle.displayName = "SheetTitle";

// Description
export type SheetDescriptionProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Description
>;

export const SheetDescription = forwardRef<
  HTMLParagraphElement,
  SheetDescriptionProps
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...rest}
  />
));

SheetDescription.displayName = "SheetDescription";
