/**
 * Where a reader's column widths live between visits.
 *
 * <p><b>Its own namespace, deliberately outside every token store's prefix.</b> A token store
 * clears by sweeping every key that starts with its prefix, and signing out calls that clear — so
 * a preference parked beside the tokens is erased by the one act it has to outlive. An operator
 * who dragged a column wide would find it narrow again after every sign-in, with nothing anywhere
 * saying why.
 *
 * <p>Widths are held by the column's `field`, not by its position. A position is lost the moment a
 * screen inserts a column, and it silently moves the stored width onto the neighbour; a field
 * survives both that and translation.
 */
const STORE_NAMESPACE = "simplix.prefs:list-columns:";

/** Column widths a reader has set, by the column's field. */
export type ColumnWidths = Record<string, number>;

/**
 * The narrowest a column may be dragged.
 *
 * <p>Below this a column stops being a column: the header ellipsizes to nothing and there is no
 * visible edge left to grab, so the reader cannot undo what they just did.
 */
export const MIN_COLUMN_WIDTH = 48;

/** How far one arrow-key press moves an edge, in pixels. */
export const KEYBOARD_STEP = 16;

/**
 * Reads the widths stored for one list.
 *
 * <p>Anything unreadable is treated as nothing stored — the reader then gets the column set the
 * screen was designed with, which is the state they would have had anyway.
 *
 * @param listKey the list's own key
 * @returns the stored widths, or an empty set
 */
export function readColumnWidths(listKey: string): ColumnWidths {
  try {
    const raw = localStorage.getItem(STORE_NAMESPACE + listKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const widths: ColumnWidths = {};
    for (const [field, width] of Object.entries(parsed as Record<string, unknown>)) {
      if (field && typeof width === "number" && Number.isFinite(width) && width >= MIN_COLUMN_WIDTH) {
        widths[field] = Math.round(width);
      }
    }
    return widths;
  } catch {
    /* storage unavailable or the entry is not JSON — the screen's own widths stand */
    return {};
  }
}

/**
 * Records the widths for one list, so the next visit opens the way this one ended.
 *
 * @param listKey the list's own key
 * @param widths the widths to keep; an empty set removes the entry rather than storing `{}`
 */
export function writeColumnWidths(listKey: string, widths: ColumnWidths): void {
  try {
    if (Object.keys(widths).length === 0) {
      localStorage.removeItem(STORE_NAMESPACE + listKey);
      return;
    }
    localStorage.setItem(STORE_NAMESPACE + listKey, JSON.stringify(widths));
  } catch {
    /* storage unavailable — the widths last this visit, which beats refusing the drag */
  }
}

/**
 * The style a sized column's header carries.
 *
 * <p>All three of `width`, `minWidth` and `maxWidth`, because an auto-layout table treats a
 * cell's width as a suggestion and discards it whenever the column's content says otherwise —
 * asking for 364 and getting the content's 154 back, with the reader watching the column refuse
 * to move. Measured on a real table, one variable at a time:
 *
 * <pre>
 *   width: 364px            -> 154px   (the content's width)
 *   width + min-width: 364  -> 364px
 * </pre>
 *
 * @param width the width in pixels
 * @returns the style object
 */
export function sizedHeaderStyle(width: number): {
  width: number;
  minWidth: number;
  maxWidth: number;
} {
  return { width, minWidth: width, maxWidth: width };
}
