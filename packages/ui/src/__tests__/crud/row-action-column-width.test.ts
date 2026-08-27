import { describe, expect, it } from "vitest";

import { getActionColumnWidth } from "../../crud/shared/row-actions";
import type { RowActionDef } from "../../crud/shared/row-actions";

/**
 * What the cluster actually measures at, in the same terms the component renders it in.
 *
 * <p>The icon strip is one `overflow-hidden` box, so a column too narrow for it cuts the last
 * glyph in half and leaves nothing behind — no scrollbar, no ellipsis, no attribute. Nobody can
 * see that from the DOM, which is why the width is asserted here against the arithmetic rather
 * than looked at in a browser.
 *
 * @param count how many actions the row declares
 * @returns the px the strip needs inside the cell, before the cell's own padding
 */
function iconStripContent(count: number): number {
  // `size-7` per button, a `border-l` divider between each pair, and the strip's own border.
  return count * 28 + (count - 1) + 2;
}

/** What a table cell spends on its own horizontal padding — `px-3` on both sides. */
const CELL_PADDING = 24;

const actions = (count: number): RowActionDef<unknown>[] =>
  Array.from({ length: count }, () => ({ type: "view" as const, onClick: () => {} }));

describe("getActionColumnWidth", () => {
  it("gives the icon strip room for its glyphs and the cell's padding", () => {
    for (const count of [1, 2, 3, 4, 5]) {
      const width = getActionColumnWidth(actions(count), "icon");
      expect(width).toBeGreaterThanOrEqual(iconStripContent(count) + CELL_PADDING);
    }
  });

  it("is what the old padding-blind formula was not", () => {
    // The shape this test exists to keep out: a width covering the glyphs and nothing else, which
    // hands a two-icon cluster 40px of content box for the 59px it draws.
    const paddingBlind = (count: number) => count * 30 + 4;
    expect(paddingBlind(2)).toBeLessThan(iconStripContent(2) + CELL_PADDING);
    expect(getActionColumnWidth(actions(2), "icon")).toBeGreaterThanOrEqual(
      iconStripContent(2) + CELL_PADDING,
    );
  });

  it("leaves the labelled variants where they were", () => {
    expect(getActionColumnWidth(actions(1), "outline")).toBe(120);
    expect(getActionColumnWidth(actions(2), "ghost")).toBe(188);
  });
});
