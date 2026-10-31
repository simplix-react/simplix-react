import { type KeyboardEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { crudListDetailDividerStyle } from "./list-detail.style";

/**
 * What a resize handle reads and reports for the detail it sizes, whichever way the detail is
 * presented. The root of a {@link ListDetail} owns the numbers; a handle only moves them.
 */
export interface DetailResizeControl {
  /** The width the detail is drawn at, in px. */
  readonly width: number;
  /** The narrowest width the reader can drag the detail to. */
  readonly min: number;
  /** The widest width the reader can drag the detail to; never below `min`. */
  readonly max: number;
  /** Asks for a width; the root clamps it to `min` and `max` and draws the result. */
  readonly onResize: (width: number) => void;
  /** A drag began, so the layout stops animating its change of width. */
  readonly onResizeStart: () => void;
  /** The drag ended. */
  readonly onResizeEnd: () => void;
  /** Back to the width the detail opened at. */
  readonly onReset: () => void;
}

/** How far one arrow key press moves the detail's edge, in px. */
export const RESIZE_KEY_STEP = 20;

/** The step of an arrow key held with Shift. */
export const RESIZE_KEY_STEP_LARGE = 80;

/** Keeps `value` inside `[min, max]`; `max` below `min` leaves `min`. */
export function clampWidth(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** The window's inner width, re-read as it changes; unbounded where there is no window to read. */
export function useViewportWidth(): number {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? Number.POSITIVE_INFINITY : window.innerWidth));
  useEffect(() => {
    const read = () => setWidth(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return width;
}

/** Props for {@link DetailResizeHandle}. */
export interface DetailResizeHandleProps {
  readonly control: DetailResizeControl;
  /**
   * The side the handle's edge moves toward when the detail grows: a panel and a drawer grow to
   * the left, a dialog's right edge grows to the right. It decides which arrow key widens.
   */
  readonly grows: "left" | "right";
  /**
   * How many px the width changes for each px the pointer travels: 2 for a centred dialog, whose
   * edges both move, so the edge under the pointer stays under it.
   */
  readonly ratio?: number;
  /** Takes the handle out of the tab order and the pointer's reach, as a closed panel's divider is. */
  readonly collapsed?: boolean;
  /**
   * Leaves the handle to the pointer: no role, out of the tab order and the accessibility tree. A
   * dialog draws one on each side edge and only one of them is the keyboard's.
   */
  readonly pointerOnly?: boolean;
  readonly className?: string;
}

/**
 * The drag handle of a detail's width, drawn with the divider's slot: a rule and a grip. It is a
 * keyboard control too: an arrow key moves the edge by {@link RESIZE_KEY_STEP} (Shift: a larger
 * step), Home and End go to the narrowest and widest, and a double press returns to the width the
 * detail opened at.
 */
export function DetailResizeHandle({ control, grows, ratio = 1, collapsed = false, pointerOnly = false, className }: DetailResizeHandleProps) {
  const { t } = useTranslation("simplix/ui");
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const { onResize, onResizeStart, onResizeEnd, onReset } = control;
  const controlWidth = useRef(control.width);
  controlWidth.current = control.width;

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      // A `pointerdown` begins a text selection by default, and a handle dragged across text
      // paints every word it passes over, still selected once the pointer is released.
      // `setPointerCapture` routes the events here and says nothing about selection. Cancelling the
      // default also withholds the focus the press would have given, and this is a keyboard
      // control, so the focus is taken by hand.
      e.preventDefault();
      e.currentTarget.focus();
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = controlWidth.current;
      e.currentTarget.setPointerCapture(e.pointerId);
      onResizeStart();
    },
    [onResizeStart],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!dragging.current) return;
      const travelled = e.clientX - startX.current;
      onResize(startWidth.current + (grows === "left" ? -travelled : travelled) * ratio);
    },
    [grows, onResize, ratio],
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    onResizeEnd();
  }, [onResizeEnd]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const step = e.shiftKey ? RESIZE_KEY_STEP_LARGE : RESIZE_KEY_STEP;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const widens = (e.key === "ArrowLeft") === (grows === "left");
        onResize(controlWidth.current + (widens ? step : -step));
      } else if (e.key === "Home") {
        e.preventDefault();
        onResize(control.min);
      } else if (e.key === "End" && Number.isFinite(control.max)) {
        e.preventDefault();
        onResize(control.max);
      }
    },
    [control.max, control.min, grows, onResize],
  );

  return (
    <output
      {...(pointerOnly
        ? { "aria-hidden": true, tabIndex: -1 }
        : {
            role: "separator",
            "aria-orientation": "vertical" as const,
            "aria-label": t("common.detailWidth"),
            "aria-valuenow": Math.round(control.width),
            "aria-valuemin": Math.round(control.min),
            "aria-valuemax": Number.isFinite(control.max) ? Math.round(control.max) : undefined,
            tabIndex: collapsed ? -1 : 0,
          })}
      data-grows={grows}
      className={cn("box-content cursor-col-resize select-none max-md:hidden", collapsed && "pointer-events-none", className)}
      {...slotAttributes(crudListDetailDividerStyle, { collapsed })}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={onReset}
      onKeyDown={pointerOnly ? undefined : handleKeyDown}
    />
  );
}
