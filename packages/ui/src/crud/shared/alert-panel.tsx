import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactNode } from "react";

import { useScrollEdges } from "../form/use-scroll-edges";

import { slotAttributes, slotClassNames } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  alertPanelActionStyle,
  alertPanelBodyStyle,
  alertPanelCancelStyle,
  alertPanelContentStyle,
  alertPanelDescriptionStyle,
  alertPanelFooterStyle,
  alertPanelOverlayStyle,
  alertPanelTitleStyle,
} from "./alert-panel.style";

// Entry and exit motion is tw-animate-css, which a design stylesheet cannot @apply; it stays
// on the element, the same in every design.
const alertPanelContentMotion =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

// On a phone-width window the panel docks to the bottom edge as a sheet, the same switch a
// banded dialog makes (see `DialogContent`), animated across the breakpoint.
const ALERT_SHEET_BELOW_SM =
  "max-sm:top-full max-sm:translate-y-[-100%] max-sm:max-w-full max-sm:rounded-b-none transition-[top,translate,max-width,border-radius] max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=open]:slide-in-from-bottom-8 max-sm:data-[state=closed]:slide-out-to-bottom-8";

// Entry and exit motion is tw-animate-css, which a design stylesheet cannot @apply; it stays
// on the element, the same in every design.
const alertPanelOverlayMotion =
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

/** Props for the {@link AlertPanel} shell. */
export interface AlertPanelProps {
  /** Whether the panel is on screen. */
  open: boolean;
  /** Called when Radix asks for the panel to open or close (Escape, the overlay, a Cancel). */
  onOpenChange: (open: boolean) => void;
  /** The heading, pinned above the body. */
  title: ReactNode;
  /** The body. Omitted entirely when there is nothing to say beyond the title. */
  description?: ReactNode;
  /** The footer buttons, pinned below the body: `AlertDialog.Cancel` / `AlertDialog.Action`. */
  actions: ReactNode;
}

/**
 * The panel every alert-style confirmation in this package is drawn in, bounded by the window.
 *
 * @remarks
 * The three confirmations here ({@link ConfirmDialog}, `CrudDelete` and the unsaved-changes
 * guard) were three copies of one overlay, one centred panel and one footer row, and the copy
 * is why the same geometry defect stood in all three: a panel `fixed` at `top-1/2` with a width
 * and **no height at all** grows in both directions at once, so a confirmation whose description
 * runs long puts its title off the top of the window and its buttons off the bottom, with
 * nothing to scroll. The reader is left with a wall of text, no way to confirm, no way to
 * cancel, and Escape as the only exit, which they have to guess.
 *
 * Whether it happens is decided by the data, not by the code: a record with a long name, a
 * refusal the server spelled out, a delete that lists what it will take with it. It passes review
 * on the day it is written.
 *
 * So the panel is a flex column with a ceiling, and only the body scrolls. The title and the
 * footer are `shrink-0`, which is what makes the confirm button reachable at any window height;
 * a bounded panel whose footer scrolled away with the text would be no better than an unbounded
 * one. The body carries its own inset, so the scrollbar rides the panel edge.
 *
 * `dvh` rather than `vh`: on a phone the browser's own chrome eats into `vh`, and a panel sized
 * against the larger figure hides its footer behind the address bar.
 *
 * @param props - {@link AlertPanelProps}
 *
 * @example
 * ```tsx
 * <AlertPanel
 *   open={open}
 *   onOpenChange={onOpenChange}
 *   title={t("list.deleteTitle")}
 *   description={t("list.deleteDescription")}
 *   actions={
 *     <>
 *       <AlertDialog.Cancel className={ALERT_BUTTON_STRUCTURE} {...alertCancelAttributes}>{t("common.cancel")}</AlertDialog.Cancel>
 *       <AlertDialog.Action className={ALERT_BUTTON_STRUCTURE} {...alertActionAttributes}>{t("common.delete")}</AlertDialog.Action>
 *     </>
 *   }
 * />
 * ```
 */
export function AlertPanel({ open, onOpenChange, title, description, actions }: AlertPanelProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className={cn(alertPanelOverlayMotion, "fixed inset-0 z-50")}
          {...slotAttributes(alertPanelOverlayStyle, {})}
        />
        <AlertPanelContent title={title} description={description} actions={actions} />
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/**
 * The panel itself, mounted only while open, so the body's scroll-edge probe attaches when the
 * body exists. The title and the footer mark the strip the body scrolls under.
 */
function AlertPanelContent({ title, description, actions }: Pick<AlertPanelProps, "title" | "description" | "actions">) {
  const { ref, edges } = useScrollEdges<HTMLDivElement>(true);
  const hasBody = description !== undefined && description !== null;
  return (
        <AlertDialog.Content
          className={cn(alertPanelContentMotion, 
            "fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 sm:max-w-lg",
            // The ceiling, and the column that lets the body take the overflow on its own.
            "flex max-h-[calc(100dvh-2rem)] flex-col",
            ALERT_SHEET_BELOW_SM,
          )}
          {...slotAttributes(alertPanelContentStyle, {})}
        >
          <AlertDialog.Title
            className="relative z-[1] shrink-0"
            {...slotAttributes(alertPanelTitleStyle, { scrolled: edges.above, body: hasBody })}
          >
            {title}
          </AlertDialog.Title>
          {hasBody && (
            // No `flex-1`: the body takes its natural height until the panel meets the ceiling and
            // then shrinks, which is what `min-h-0` allows. Growing it would stretch a two-line
            // confirmation down the whole window.
            <div ref={ref} className="min-h-0 overflow-y-auto overscroll-contain" {...slotAttributes(alertPanelBodyStyle, {})}>
              <AlertDialog.Description {...slotAttributes(alertPanelDescriptionStyle, {})}>
                {description}
              </AlertDialog.Description>
            </div>
          )}
          <footer
            className="relative z-[1] flex w-full shrink-0 flex-col-reverse sm:flex-row sm:justify-end"
            {...slotAttributes(alertPanelFooterStyle, { overflow: hasBody && edges.below })}
          >
            {actions}
          </footer>
        </AlertDialog.Content>
  );
}

/**
 * The structure of the footer's buttons: the shape every alert panel's buttons share. The look is
 * drawn from the `alert-panel-cancel` and `alert-panel-action` slots.
 */
export const ALERT_BUTTON_STRUCTURE =
  "inline-flex h-8 items-center justify-center disabled:pointer-events-none";

/** Attributes that draw `AlertDialog.Cancel` as the footer's secondary button. */
export const alertCancelAttributes = slotAttributes(alertPanelCancelStyle, {});

/** Attributes that draw `AlertDialog.Action` as the footer's committing button. */
export const alertActionAttributes = slotAttributes(alertPanelActionStyle, {});

/**
 * Attributes that draw `AlertDialog.Action` as a committing button that destroys or discards
 * (delete, discard changes). Radix focuses Cancel first in an alert dialog, so Enter on open
 * never runs it.
 */
export const alertDangerActionAttributes = slotAttributes(alertPanelActionStyle, { tone: "danger" });

/**
 * The footer's secondary button as a class string, for a caller that draws an element of its own
 * to look like it. The panels themselves use `ALERT_BUTTON_STRUCTURE` with `alertCancelAttributes`.
 */
export const ALERT_CANCEL_CLASS = cn(ALERT_BUTTON_STRUCTURE, slotClassNames(alertPanelCancelStyle)());

/**
 * The footer's committing button as a class string, for a caller that draws an element of its own
 * to look like it. The panels themselves use `ALERT_BUTTON_STRUCTURE` with `alertActionAttributes`.
 */
export const ALERT_ACTION_CLASS = cn(ALERT_BUTTON_STRUCTURE, slotClassNames(alertPanelActionStyle)());
