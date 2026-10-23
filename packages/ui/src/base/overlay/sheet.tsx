import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  sheetCloseStyle,
  sheetContentStyle,
  sheetDescriptionStyle,
  sheetFooterStyle,
  sheetHeaderStyle,
  sheetOverlayStyle,
  sheetTitleStyle,
} from "./sheet.style";

// Root - pass through
export const Sheet = DialogPrimitive.Root;

// Trigger - pass through
export const SheetTrigger = DialogPrimitive.Trigger;

// Close - pass through
export const SheetClose = DialogPrimitive.Close;

// Entry and exit motion comes from the tw-animate-css utilities. They are not part of this
// package's stylesheet, so they stay on the element: the generated design stylesheet cannot
// @apply a utility that is not defined where it is compiled.
const OVERLAY_MOTION =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

// Overlay (internal)
const SheetOverlay = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<typeof DialogPrimitive.Overlay>
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50", OVERLAY_MOTION, className)}
    {...rest}
    {...slotAttributes(sheetOverlayStyle, {})}
  />
));

SheetOverlay.displayName = "SheetOverlay";

// Content
export type SheetContentProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Content
> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  /**
   * Whether the dimmed sheet behind the panel is drawn. @defaultValue `true`
   *
   * <p><b>Set it false for a sheet that works beside its page rather than over it.</b> The overlay
   * is what makes a sheet modal: it dims the page and swallows every click, so a reader who can
   * see the row they want next has to close the sheet before they can reach it — two presses for
   * what is one press when the same content sits in a column. Pair it with `modal={false}` on the
   * `Sheet` root, which is what stops Radix trapping focus and locking the page's scroll.
   *
   * <p>Leave it on for a sheet that is genuinely an interruption — a form the reader must finish
   * or abandon before anything else means anything.
   */
};

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      className,
      children,
      side = "right",
      showCloseButton = true,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation("simplix/ui");

    return (
      <DialogPrimitive.Portal>
        <SheetOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed z-50 flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            side === "right" &&
              "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
            side === "left" &&
              "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
            side === "top" &&
              "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto",
            side === "bottom" &&
              "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto",
            className,
          )}
          {...rest}
          {...slotAttributes(sheetContentStyle, { side })}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              className="absolute top-4 right-4 disabled:pointer-events-none"
              {...slotAttributes(sheetCloseStyle, {})}
            >
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
              <span className="sr-only">{t("common.close")}</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  },
);

SheetContent.displayName = "SheetContent";

// Header
export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function SheetHeader({ className, ...rest }: SheetHeaderProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      {...rest}
      {...slotAttributes(sheetHeaderStyle, {})}
    />
  );
}

// Footer
export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function SheetFooter({ className, ...rest }: SheetFooterProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      {...rest}
      {...slotAttributes(sheetFooterStyle, {})}
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
      className={className}
      {...rest}
      {...slotAttributes(sheetTitleStyle, {})}
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
    className={className}
    {...rest}
    {...slotAttributes(sheetDescriptionStyle, {})}
  />
));

SheetDescription.displayName = "SheetDescription";
