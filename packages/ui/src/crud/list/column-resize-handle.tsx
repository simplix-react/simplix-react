import { useCallback, useEffect, useRef } from "react";

import { KEYBOARD_STEP, MIN_COLUMN_WIDTH } from "./column-widths";

/** Props for {@link ColumnResizeHandle}. */
export interface ColumnResizeHandleProps {
  /** The field of the column whose trailing edge this is. */
  field: string;
  /** Reports a width while the pointer is still down, so the column follows the drag. */
  onPreview: (field: string, width: number) => void;
  /** Reports the width the reader settled on. */
  onCommit: (field: string, width: number) => void;
  /** Gives the column back to the screen's own sizing. */
  onReset: (field: string) => void;
  /** The accessible name, already translated. */
  label: string;
}

/**
 * The grab zone along a column's trailing edge.
 *
 * <p>A real element rather than a pseudo-element, which is what lets it take focus: a reader who
 * cannot use a pointer moves the edge with the arrow keys, and a pseudo-element can never be
 * reached that way. It sits inside the header cell and is positioned against it, so the cell's
 * own children — the label, the sort button — are untouched.
 *
 * <p><b>The press is stopped here.</b> A sortable header is a button, and a press near its
 * trailing edge would otherwise sort the list every time the reader sized the column. The click
 * that follows the release is swallowed for the same reason: it arrives after the pointer is up,
 * so the drag has to still be remembered when it does.
 *
 * <p>Double-clicking gives the column back to the screen's own width, so a column dragged too
 * narrow to grab again is never a dead end.
 */
export function ColumnResizeHandle({
  field,
  onPreview,
  onCommit,
  onReset,
  label,
}: ColumnResizeHandleProps) {
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);
  const dragged = useRef(false);
  const handleRef = useRef<HTMLSpanElement>(null);

  /**
   * @returns the width of the header cell this handle belongs to
   */
  const cellWidth = useCallback(() => {
    const cell = handleRef.current?.closest("th");
    return cell ? cell.getBoundingClientRect().width : MIN_COLUMN_WIDTH;
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const current = drag.current;
      if (!current) return;
      dragged.current = true;
      onPreview(field, widthFrom(current, event.clientX));
    };

    const onPointerUp = (event: PointerEvent) => {
      const current = drag.current;
      if (!current) return;
      drag.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (!dragged.current) return;
      onCommit(field, widthFrom(current, event.clientX));
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [field, onCommit, onPreview]);

  return (
    <span
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      tabIndex={0}
      className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize select-none hover:bg-current/25 focus-visible:bg-current/40 focus-visible:outline-none"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        // Stopped so the header's sort button never sees it. Sizing a column is not asking for it
        // to be sorted, and the two gestures start in the same place.
        event.preventDefault();
        event.stopPropagation();
        drag.current = { startX: event.clientX, startWidth: cellWidth() };
        dragged.current = false;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }}
      onClick={(event) => {
        if (!dragged.current) return;
        dragged.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onReset(field);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          const step = event.key === "ArrowLeft" ? -KEYBOARD_STEP : KEYBOARD_STEP;
          onCommit(field, Math.max(MIN_COLUMN_WIDTH, Math.round(cellWidth() + step)));
          return;
        }
        // The keyboard's version of the double-click, so the way back does not need a pointer.
        if (event.key === "Home") {
          event.preventDefault();
          onReset(field);
        }
      }}
    />
  );
}

/**
 * @param drag where the drag started
 * @param clientX where the pointer is now
 * @returns the width that follows, never below the floor
 */
function widthFrom(drag: { startX: number; startWidth: number }, clientX: number): number {
  return Math.max(MIN_COLUMN_WIDTH, Math.round(drag.startWidth + (clientX - drag.startX)));
}
