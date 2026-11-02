import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";

/**
 * A card has no row to point at, so the clarity design draws the row action strip on it at rest.
 *
 * <p>The strip is hidden until the table row holding it is pointed at, focused or open, and a card
 * is not a table row, so without a rule of its own the strip of every card stayed invisible on a
 * pointer device. The compiled stylesheet is read as the browser reads it.
 */
const css = clarityCss;

/** The declaration block of the first rule whose selector names the row action strip. */
function stripRule(source: string): string {
  const at = source.indexOf('[data-slot="row-actions-strip"]');
  if (at < 0) throw new Error("the compiled design has no rule for the row action strip");
  return source.slice(at, source.indexOf("}", at));
}

describe("the row action strip on a card in the clarity design", () => {
  it("is drawn at rest inside a card", () => {
    const rule = /\[data-slot="crud-card"\] :where\(\[data-slot="row-actions-strip"\]\)[^{]*\{([^}]*)\}/.exec(css);
    expect(rule?.[1]).toMatch(/opacity:\s*1/);
  });

  it("stays hidden at rest inside a table row", () => {
    expect(stripRule(css)).toMatch(/opacity:\s*0/);
  });
});
