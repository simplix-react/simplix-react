import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ComponentPropsWithRef, createContext, forwardRef, useContext, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { cn } from "../../utils/cn";

/** True when the enclosing maximizable DialogContent is currently maximized. */
const DialogMaximizedContext = createContext(false);

/**
 * Reads whether the enclosing DialogContent is maximized, so a body can fill the frame
 * (e.g. `flex-1 min-h-0`) instead of a fixed height.
 */
export function useDialogMaximized(): boolean {
  return useContext(DialogMaximizedContext);
}

/**
 * Resets the maximize toggle when the dialog closes. It lives inside the portal content
 * (which unmounts on close) while the maximize state lives on the still-mounted
 * DialogContent, so the dialog reopens at its default size instead of staying maximized.
 */
function ResetMaximizeOnClose({ onReset }: { onReset: (value: boolean) => void }) {
  useEffect(() => () => onReset(false), [onReset]);
  return null;
}

// Root - pass through
export const Dialog = DialogPrimitive.Root;

// Trigger - pass through
export const DialogTrigger = DialogPrimitive.Trigger;

// Portal - pass through
export const DialogPortal = DialogPrimitive.Portal;

// Close - pass through
export const DialogClose = DialogPrimitive.Close;

// Overlay
export type DialogOverlayProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Overlay
>;

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...rest }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...rest}
    />
  ),
);

DialogOverlay.displayName = "DialogOverlay";

// Content
export type DialogContentProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Content
> & {
  showCloseButton?: boolean;
  /** Adds a maximize / restore toggle beside the close button and near-fullscreens the dialog. */
  maximizable?: boolean;
};

// Shared style of the top-right corner icon buttons (maximize + close), so they read as one group.
const CORNER_BUTTON_CLASS =
  "rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showCloseButton = true, maximizable = false, style, ...rest }, ref) => {
    const [maximized, setMaximized] = useState(false);
    const isMaximized = maximizable && maximized;
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogMaximizedContext.Provider value={isMaximized}>
          <DialogPrimitive.Content
            ref={ref}
            data-maximized={isMaximized ? "" : undefined}
            className={cn(
              "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
              className,
            )}
            // Maximized: pin every edge a uniform gap from the viewport (not %-based vw/vh,
            // whose horizontal and vertical gaps differ and drift with window size). A flex
            // column so a flex-1 body (see useDialogMaximized) fills the frame; the fixed
            // insets + transform:none override the base centered grid.
            style={isMaximized
              // translate:none (not transform) cancels the base centering — Tailwind v4's
              // translate-x/y compile to the `translate` property, which `transform` won't reset.
              ? { ...style, top: "0.75rem", right: "0.75rem", bottom: "0.75rem", left: "0.75rem", width: "auto", height: "auto", maxWidth: "none", transform: "none", translate: "none", display: "flex", flexDirection: "column" }
              : style}
            {...rest}
          >
            {maximizable && <ResetMaximizeOnClose onReset={setMaximized} />}
            {children}
            {(maximizable || showCloseButton) && (
              <div className="absolute top-3.5 right-3.5 flex items-center gap-0.5">
                {maximizable && (
                  <button
                    type="button"
                    onClick={() => setMaximized((prev) => !prev)}
                    aria-label={maximized ? "Restore" : "Maximize"}
                    className={CORNER_BUTTON_CLASS}
                  >
                    {maximized ? <Minimize2 /> : <Maximize2 />}
                  </button>
                )}
                {showCloseButton && (
                  <DialogPrimitive.Close
                    className={cn(
                      "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                      CORNER_BUTTON_CLASS,
                    )}
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
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                )}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogMaximizedContext.Provider>
      </DialogPortal>
    );
  },
);

DialogContent.displayName = "DialogContent";

// Header
export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...rest }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        className,
      )}
      {...rest}
    />
  );
}

// Footer
export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...rest }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...rest}
    />
  );
}

// Title
export type DialogTitleProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Title
>;

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...rest }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg leading-none font-semibold", className)}
      {...rest}
    />
  ),
);

DialogTitle.displayName = "DialogTitle";

// Description
export type DialogDescriptionProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Description
>;

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...rest}
  />
));

DialogDescription.displayName = "DialogDescription";
