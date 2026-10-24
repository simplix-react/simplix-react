import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Children,
  type ComponentPropsWithRef,
  createContext,
  forwardRef,
  isValidElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { useScrollEdges, type ScrollEdges } from "../../crud/form/use-scroll-edges";
import { cn } from "../../utils/cn";
import {
  dialogBodyStyle,
  dialogContentStyle,
  dialogCornerActionsStyle,
  dialogCornerButtonStyle,
  dialogDescriptionStyle,
  dialogFooterStyle,
  dialogHeaderStyle,
  dialogOverlayStyle,
  dialogTitleStyle,
} from "./dialog.style";

/**
 * What the bands of a banded dialog share: which bands exist, and which edges of the body hide
 * content, so the header and the footer mark the strip the body scrolls under.
 */
interface DialogBandsValue {
  edges: ScrollEdges;
  setEdges: (edges: ScrollEdges) => void;
  head: boolean;
  foot: boolean;
  /** A maximize or close button sits in the top-right corner, over the header band. */
  corner: boolean;
}

const NO_EDGES: ScrollEdges = { above: false, below: false };

const DialogBandsContext = createContext<DialogBandsValue | null>(null);

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

// Entry and exit motion comes from the tw-animate-css utilities. They are not part of this
// package's stylesheet, so they stay on the element: the generated design stylesheet cannot
// @apply a utility that is not defined where it is compiled.
const OVERLAY_MOTION =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";
const CONTENT_MOTION =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

// A banded dialog on a phone-width window is a bottom sheet: pinned to the bottom edge at full
// width, square at the bottom, rising from below instead of zooming. The position is written as
// `top` + `translate` on both sides of the breakpoint (50%/-50% centred, 100%/-100% docked) so a
// window resized across it glides between the two rather than jumping.
const SHEET_BELOW_SM =
  "max-sm:top-full max-sm:translate-y-[-100%] max-sm:max-w-full max-sm:rounded-b-none max-sm:max-h-[calc(100dvh-1rem)] transition-[top,translate,max-width,border-radius] max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=open]:slide-in-from-bottom-8 max-sm:data-[state=closed]:slide-out-to-bottom-8";

/**
 * Splits a dialog's children into its bands. A dialog is banded when a {@link DialogHeader} or a
 * {@link DialogFooter} is a direct child: the headers lead, the footers close, and everything else
 * goes into one {@link DialogBody} between them, the only part that scrolls. A dialog without
 * either (a palette, a viewer drawing its own frame) is left exactly as written.
 */
function splitBands(children: ReactNode) {
  const head: ReactNode[] = [];
  const foot: ReactNode[] = [];
  const middle: ReactNode[] = [];
  let explicitBody = false;
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === DialogHeader) head.push(child);
    else if (isValidElement(child) && child.type === DialogFooter) foot.push(child);
    else {
      if (isValidElement(child) && child.type === DialogBody) explicitBody = true;
      if (child !== null && child !== undefined && child !== false) middle.push(child);
    }
  })
  const banded = head.length > 0 || foot.length > 0;
  return { banded, head, foot, middle, explicitBody };
}

// Overlay
export type DialogOverlayProps = ComponentPropsWithRef<
  typeof DialogPrimitive.Overlay
>;

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...rest }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50", OVERLAY_MOTION, className)}
      {...rest}
      {...slotAttributes(dialogOverlayStyle, {})}
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
  /** Drops the panel padding, for a body that draws its own. */
  flush?: boolean;
  /**
   * `"column"` gives the panel the banded frame (a column with a height ceiling, the bottom sheet
   * below `sm`) without wrapping the children, for content that draws its own header, scrolling
   * body and footer (a CRUD detail or form). Otherwise the frame follows the children (`"auto"`).
   */
  frame?: "auto" | "column";
};

// Structure shared by the top-right corner icon buttons (maximize + close); their look is the
// `dialog-corner-button` slot, so they read as one group.
const CORNER_BUTTON_CLASS =
  "disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showCloseButton = true, maximizable = false, flush = false, frame = "auto", style, ...rest }, ref) => {
    const [maximized, setMaximized] = useState(false);
    const [edges, setEdges] = useState<ScrollEdges>(NO_EDGES);
    const isMaximized = maximizable && maximized;
    const { t } = useTranslation("simplix/ui");
    const bands = splitBands(children);
    const column = bands.banded || frame === "column";
    const bandsValue: DialogBandsValue | null = bands.banded
      ? { edges, setEdges, head: bands.head.length > 0, foot: bands.foot.length > 0, corner: maximizable || showCloseButton }
      : null;
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogMaximizedContext.Provider value={isMaximized}>
        <DialogBandsContext.Provider value={bandsValue}>
          <DialogPrimitive.Content
            ref={ref}
            data-maximized={isMaximized ? "" : undefined}
            className={cn(
              "fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] sm:max-w-lg",
              // Banded: a column with a ceiling, so the body takes the overflow and the header
              // and footer stay put.
              column ? "flex max-h-[calc(100dvh-2rem)] flex-col" : "grid",
              CONTENT_MOTION,
              column && !isMaximized && SHEET_BELOW_SM,
              className,
            )}
            // Maximized: pin every edge a uniform gap from the viewport (not %-based vw/vh,
            // whose horizontal and vertical gaps differ and drift with window size). A flex
            // column so a flex-1 body (see useDialogMaximized) fills the frame; the fixed
            // insets + transform:none override the base centered grid.
            style={isMaximized
              // translate:none (not transform) cancels the base centering: Tailwind v4's
              // translate-x/y compile to the `translate` property, which `transform` won't reset.
              ? { ...style, top: "0.75rem", right: "0.75rem", bottom: "0.75rem", left: "0.75rem", width: "auto", height: "auto", maxWidth: "none", transform: "none", translate: "none", display: "flex", flexDirection: "column" }
              : style}
            {...rest}
            {...slotAttributes(dialogContentStyle, { flush, banded: column })}
          >
            {maximizable && <ResetMaximizeOnClose onReset={setMaximized} />}
            {bands.banded ? (
              <>
                {bands.head}
                {bands.explicitBody && bands.middle.length === 1 ? bands.middle : <DialogBody>{bands.middle}</DialogBody>}
                {bands.foot}
              </>
            ) : (
              children
            )}
            {(maximizable || showCloseButton) && (
              <div
                className="absolute z-[2] flex items-center"
                {...slotAttributes(dialogCornerActionsStyle, {})}
              >
                {maximizable && (
                  <button
                    type="button"
                    onClick={() => setMaximized((prev) => !prev)}
                    aria-label={maximized ? t("common.restore") : t("common.maximize")}
                    className={CORNER_BUTTON_CLASS}
                    {...slotAttributes(dialogCornerButtonStyle, {})}
                  >
                    {maximized ? <Minimize2 /> : <Maximize2 />}
                  </button>
                )}
                {showCloseButton && (
                  <DialogPrimitive.Close
                    className={CORNER_BUTTON_CLASS}
                    {...slotAttributes(dialogCornerButtonStyle, { close: true })}
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
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogBandsContext.Provider>
        </DialogMaximizedContext.Provider>
      </DialogPortal>
    );
  },
);

DialogContent.displayName = "DialogContent";

// Header
export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...rest }: DialogHeaderProps) {
  const bands = useContext(DialogBandsContext);
  return (
    <div
      className={cn("flex flex-col", bands && "relative z-[1] shrink-0", className)}
      {...rest}
      {...slotAttributes(dialogHeaderStyle, { scrolled: bands?.edges.above ?? false, corner: bands?.corner ?? true })}
    />
  );
}

// Body
export type DialogBodyProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * The scrolling middle of a banded dialog. {@link DialogContent} wraps everything between its
 * header and footer in one automatically; write it by hand only to put props on it.
 *
 * @remarks
 * It reports which of its edges hide content, and the header and footer draw the scroll-edge
 * shadow on the strip the content passes under.
 */
export function DialogBody({ className, ...rest }: DialogBodyProps) {
  const bands = useContext(DialogBandsContext);
  const { ref, edges } = useScrollEdges<HTMLDivElement>(true);
  const setEdges = bands?.setEdges;
  useEffect(() => {
    setEdges?.(edges);
  }, [edges, setEdges]);
  // The edges live on the content, which outlives the body across a close; reset them so a
  // reopened dialog does not start with the last session's shadows.
  useEffect(() => () => setEdges?.(NO_EDGES), [setEdges]);
  return (
    <div
      ref={ref}
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      {...rest}
      {...slotAttributes(dialogBodyStyle, { head: bands?.head ?? false, foot: bands?.foot ?? false })}
    />
  );
}

// Footer
export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...rest }: DialogFooterProps) {
  const bands = useContext(DialogBandsContext);
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end", bands && "relative z-[1] shrink-0", className)}
      {...rest}
      {...slotAttributes(dialogFooterStyle, { overflow: bands?.edges.below ?? false })}
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
      className={className}
      {...rest}
      {...slotAttributes(dialogTitleStyle, {})}
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
    className={className}
    {...rest}
    {...slotAttributes(dialogDescriptionStyle, {})}
  />
));

DialogDescription.displayName = "DialogDescription";
