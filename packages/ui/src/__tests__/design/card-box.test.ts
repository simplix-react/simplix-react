import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";

/**
 * A card of a card list is a box: a 1px border in the border token, the surface radius and the card
 * ground. Cards are separated by borders, not by shadows, so the box is what tells one card from the
 * next. The compiled stylesheet is read as the browser reads it.
 */
const css = clarityCss;

/** The declaration block of the first rule whose selector is exactly the card slot. */
function cardRule(source: string): string {
  const match = /\n\s*\[data-slot="crud-card"\]\[data-slot\]\[data-s-crud-card\]\s*\{([^}]*)\}/.exec(source);
  if (!match) throw new Error("the compiled design has no base rule for the card slot");
  return match[1] ?? "";
}

describe("the card of a card list in the clarity design", () => {
  it("draws a border, the surface radius and the card ground from tokens", () => {
    const rule = cardRule(css);
    expect(rule).toMatch(/border-width:\s*1px/);
    expect(rule).toMatch(/border-color:\s*var\(--border\)/);
    expect(rule).toMatch(/border-radius:\s*var\(--radius-surface\)/);
    expect(rule).toMatch(/background-color:\s*var\(--card\)/);
  });

  it("draws no literal colour in the card box", () => {
    expect(cardRule(css)).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|oklch\(/i);
  });

  it("strengthens the border while the pointer is on the card or focus is inside it", () => {
    expect(css).toMatch(/\[data-slot="crud-card"\]\)\[data-s-crud-card\]:hover[^{]*\{[^}]*border-color:\s*var\(--border-strong\)/);
    expect(css).toMatch(/\[data-slot="crud-card"\]\)\[data-s-crud-card\]:focus-within[^{]*\{[^}]*border-color:\s*var\(--border-strong\)/);
  });
});
