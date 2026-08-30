import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

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
  /** The footer buttons, pinned below the body — `AlertDialog.Cancel` / `AlertDialog.Action`. */
  actions: ReactNode;
}

/**
 * The panel every alert-style confirmation in this package is drawn in, bounded by the window.
 *
 * @remarks
 * The three confirmations here — {@link ConfirmDialog}, `CrudDelete` and the unsaved-changes
 * guard — were three copies of one overlay, one centred panel and one footer row, and the copy
 * is why the same geometry defect stood in all three: a panel `fixed` at `top-1/2` with a width
 * and **no height at all** grows in both directions at once, so a confirmation whose description
 * runs long puts its title off the top of the window and its buttons off the bottom, with
 * nothing to scroll. The reader is left with a wall of text, no way to confirm, no way to
 * cancel, and Escape as the only exit — which they have to guess.
 *
 * Whether it happens is decided by the data, not by the code: a record with a long name, a
 * refusal the server spelled out, a delete that lists what it will take with it. It passes review
 * on the day it is written.
 *
 * So the panel is a flex column with a ceiling, and only the body scrolls. The title and the
 * footer are `shrink-0`, which is what makes the confirm button reachable at any window height —
 * a bounded panel whose footer scrolled away with the text would be no better than an unbounded
 * one. The body carries the panel's own horizontal padding (`-mx-6 px-6`) so the scrollbar rides
 * the panel edge instead of floating a gutter inside it.
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
 *       <AlertDialog.Cancel className={ALERT_CANCEL_CLASS}>{t("common.cancel")}</AlertDialog.Cancel>
 *       <AlertDialog.Action className={ALERT_ACTION_CLASS}>{t("common.delete")}</AlertDialog.Action>
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
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <AlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
            // The ceiling, and the column that lets the body take the overflow on its own.
            "flex max-h-[calc(100dvh-2rem)] flex-col",
            "rounded-lg border bg-background p-6 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <AlertDialog.Title className="shrink-0 text-lg font-semibold">
            {title}
          </AlertDialog.Title>
          {description !== undefined && description !== null && (
            // No `flex-1`: the body takes its natural height until the panel meets the ceiling and
            // then shrinks, which is what `min-h-0` allows. Growing it would stretch a two-line
            // confirmation down the whole window.
            <div className="-mx-6 mt-2 min-h-0 overflow-y-auto px-6">
              <AlertDialog.Description className="text-sm text-muted-foreground">
                {description}
              </AlertDialog.Description>
            </div>
          )}
          <footer className="mt-6 flex w-full shrink-0 justify-end gap-2">{actions}</footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/** The footer's secondary button — what `AlertDialog.Cancel` is drawn as in all three panels. */
export const ALERT_CANCEL_CLASS = cn(
  "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
  "border border-input bg-background transition-colors",
  "hover:bg-accent hover:text-accent-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-50",
);

/** The footer's committing button — what `AlertDialog.Action` is drawn as in all three panels. */
export const ALERT_ACTION_CLASS = cn(
  "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
  "bg-primary text-primary-foreground transition-colors hover:bg-primary/90",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-50",
);
