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

/**
 * What a body cell carries when its column rests on a width rather than on its own content.
 *
 * <p>Two cases reach this state and they want the same thing: a column the reader has sized, and
 * one the screen declared as flexible. In both, zeroing the cell's max-width stops the auto table
 * layout reading the cell's content as the column's minimum — which is what lets such a column be
 * dragged narrower than what it happens to hold. The cell still renders at the column's width;
 * the zero is what it offers, not what it takes.
 *
 * <p>The attribute is the other half, and it is for whatever the CALLER put inside the cell. A
 * column holding a value of known size caps that content at the width the screen was drawn to, so
 * a long value ellipsizes rather than pushing the table sideways — and that cap, left standing,
 * goes on ellipsizing at the old number in a column the reader has just widened. They drag, watch
 * the column grow, and watch the text not grow with it. The header's own label is released
 * inline because this component renders it; a body cell's content is the caller's, so the release
 * is a rule in this package's stylesheet keyed off this attribute.
 *
 * <p>Both halves come from one decision on purpose. Read separately they drifted: the header was
 * released and the body was not, and the result reads as a column that refuses to widen.
 *
 * @param columnId the column the cell belongs to
 * @param widths what the reader has sized
 * @param meta the column's own declaration
 * @returns the props to spread onto the cell
 */
export function sizedCellProps(
  columnId: string,
  widths: ColumnWidths,
  meta: ColumnSizing | undefined,
): { style?: { maxWidth: number }; "data-column-sized"?: string } {
  const sized = widths[columnId] !== undefined || meta?.flexible === true;
  if (sized) return { style: { maxWidth: 0 }, "data-column-sized": "" };
  // A fixed column keeps its content out of the table's intrinsic width for the same reason, and
  // it is the half that makes `width` mean what it says — a column declared at a width that its
  // longest value can still stretch is a floor wearing another prop's name. The attribute does
  // NOT come with it: releasing the caller's own caps is for a column whose width can change
  // under the reader, and this one's cannot.
  return meta?.fixed === true ? { style: { maxWidth: 0 } } : {};
}

/**
 * How a column declared its width, as the header cell needs to know it.
 *
 * <p>Carried on the column rather than inferred from its size, because the size cannot answer it:
 * TanStack's default is 150, so a column asking for exactly 150 and a column asking for nothing
 * arrive at the header identical.
 */
export interface ColumnSizing {
  /** A floor: the column holds open at its width and takes a share of whatever the table has spare. */
  readonly flexible?: boolean;
  /** A width: the column is that wide and neither its content nor the spare room moves it. */
  readonly fixed?: boolean;
}

/**
 * The style a header cell carries so its column ends up the width the screen asked for.
 *
 * <p>Three states, and the difference between the first two is the whole difference between the
 * `width` and `minWidth` props. A column the reader has dragged and one declared with a fixed
 * `width` are pinned — all three of width/min/max, because an auto table layout reads a bare
 * `width` as a suggestion and spends the table's spare room on whichever column resists least. A
 * column declared with a `minWidth` carries the floor alone, so that spare room lands there.
 *
 * <p><b>A column with neither gets no style, and that is the one the spare room goes to.</b> Which
 * is why the fixed case may not be recognised by comparing the size against TanStack's default:
 * `width={150}` would then be read as no width at all, and the column that asked to stay at 150
 * becomes the one that absorbs the whole remainder — 423px of it in a detail panel, next to a
 * column of unpredictable text that got none.
 *
 * @param readerWidth what this reader has dragged the column to, if anything
 * @param size the column's declared size
 * @param meta how the column declared it
 * @returns the style for the header cell, or nothing where the column declared no width
 */
export function headerWidthStyle(
  readerWidth: number | undefined,
  size: number,
  meta: ColumnSizing | undefined,
):
  | { width: number; minWidth: number; maxWidth: number }
  | { width: number }
  | undefined {
  if (readerWidth !== undefined) return sizedHeaderStyle(readerWidth);
  if (meta?.fixed === true) return sizedHeaderStyle(size);
  if (meta?.flexible === true) return { width: size };
  return undefined;
}
