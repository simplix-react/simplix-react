import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";
import { contrast, declarationsOf, tokenBlocks, tokenOf } from "../helpers/contrast";

/**
 * Every toast kind of the clarity design is readable in both schemes, under the design's own tokens
 * and under a theme that inverts the strong overlay in its dark scheme.
 *
 * <p>The text of a toast is drawn in `--popover-strong-foreground`, so its ground has to be
 * `--popover-strong` in every scheme: a ground from anywhere else pairs a foreground with a colour
 * nobody chose it for. The design's own tokens keep both dark, so a stray dark ground still reads
 * there; a product theme that turns the overlay light in its dark scheme is where it stops reading,
 * which is why that theme is checked too.
 */

const TOKENS = fileURLToPath(new URL("../../theme/designs/clarity-tokens.css", import.meta.url));
const KINDS = ["success", "warning", "error", "info"] as const;
/** What body text needs against its ground (WCAG 1.4.3). */
const TEXT_MINIMUM = 4.5;
/** What a glyph needs against its ground (WCAG 1.4.11). */
const ICON_MINIMUM = 3;

const blocks = tokenBlocks(readFileSync(TOKENS, "utf8"));
/** Every value a scheme defines, later blocks winning, as the cascade reads them. */
const scheme = (head: string) => {
  const merged = new Map<string, string>();
  for (const block of blocks) if (block.head === head) for (const [name, value] of block.variables) merged.set(name, value);
  return merged;
};
const light = scheme("[data-design='clarity']");
const dark = new Map([...light, ...scheme("[data-design='clarity'].dark")]);
/** A product theme whose dark scheme draws the strong overlay light with dark text. */
const inverted = new Map([...dark, ["--popover-strong", "oklch(0.94 0.01 195)"], ["--popover-strong-foreground", "oklch(0.18 0.01 220)"]]);

/** The last value a property takes across the rules that reach one selector. */
const last = (rules: ReadonlyArray<ReadonlyMap<string, string>>, property: string) =>
  rules.map((rule) => rule.get(property)).filter((value): value is string => value !== undefined).at(-1);

/** The ground and the text a toast kind is drawn with, light and dark, as the compiled design states them. */
function painted(kind: (typeof KINDS)[number]) {
  const base = declarationsOf(clarityCss, '[data-slot="toast"][data-slot][data-s-toast] {');
  const own = declarationsOf(clarityCss, `[data-slot="toast"][data-type="${kind}"][data-s-toast] {`);
  const inDark = declarationsOf(clarityCss, `:where([data-slot="toast"][data-type="${kind}"])[data-s-toast]:is(.dark *) {`);
  const lightGround = last([...base, ...own], "background-color");
  const lightText = last([...base, ...own], "color");
  return {
    light: { ground: lightGround, text: lightText },
    dark: { ground: last(inDark, "background-color") ?? lightGround, text: last(inDark, "color") ?? lightText },
  };
}

const icon = (kind: (typeof KINDS)[number]) => last(declarationsOf(clarityCss, `[data-slot="toast-icon"][data-type="${kind}"][data-s-toast-icon] {`), "color");

describe("the toast kinds of the compiled clarity design", () => {
  for (const kind of KINDS) {
    it(`draws a ${kind} toast on the strong overlay with its foreground, in both schemes`, () => {
      const { light: day, dark: night } = painted(kind);
      for (const [name, pair] of [["light", day], ["dark", night]] as const) {
        expect(tokenOf(pair.ground, `${kind} ground (${name})`), `${kind} ground (${name})`).toBe("--popover-strong");
        expect(tokenOf(pair.text, `${kind} text (${name})`), `${kind} text (${name})`).toBe("--popover-strong-foreground");
      }
    });

    it(`keeps a ${kind} toast's text over 4.5:1 under the design's tokens and an inverted dark theme`, () => {
      const { light: day, dark: night } = painted(kind);
      for (const [name, tokens, pair] of [["light", light, day], ["dark", dark, night], ["inverted dark", inverted, night]] as const) {
        const ground = tokens.get(tokenOf(pair.ground, `${kind} ground`)) ?? "";
        const text = tokens.get(tokenOf(pair.text, `${kind} text`)) ?? "";
        expect(contrast(text, ground), `${kind} in ${name}`).toBeGreaterThanOrEqual(TEXT_MINIMUM);
      }
    });

    it(`keeps a ${kind} toast's glyph over 3:1 on the overlay under the design's tokens`, () => {
      const glyph = tokenOf(icon(kind), `${kind} glyph`);
      const { light: day, dark: night } = painted(kind);
      for (const [name, tokens, pair] of [["light", light, day], ["dark", dark, night]] as const) {
        const ground = tokens.get(tokenOf(pair.ground, `${kind} ground`)) ?? "";
        expect(contrast(tokens.get(glyph) ?? "", ground), `${kind} glyph in ${name}`).toBeGreaterThanOrEqual(ICON_MINIMUM);
      }
    });
  }
});
