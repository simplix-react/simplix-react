import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";
import { contrast, declarationsOf, tokenBlocks, tokenOf } from "../helpers/contrast";

/**
 * The glyphs and clear buttons of form fields in the clarity design stand on a ground and are readable.
 *
 * <p>Two defects came from the same shape: an ink drawn at a fade, and a button left without a ground.
 *
 * <ol>
 *   <li>A fade multiplies an ink by an opacity, so the muted ink at 60% on the field ground is 2.4:1
 *       in the light scheme, under the 3:1 an icon needs (WCAG 1.4.11), while the ink and the ground
 *       are each a correct token. The calendar glyph of an empty date field, the glyph above an empty
 *       list's sentence and the cross of a clear button took that fade.
 *   <li>A clear button drawn as a bare cross inside a field has a transparent ground, where the design
 *       gives every button one (`NEUTRAL_FILL`), so the rendered audit refused it.
 * </ol>
 *
 * <p>The contrast is computed from the compiled design and the token file the screen reads. The fades
 * the glyphs used to be drawn with go through the same function and must come out under 3:1, which
 * keeps the check from passing on any ink.
 */

const TOKENS = fileURLToPath(new URL("../../theme/designs/clarity-tokens.css", import.meta.url));
const ICON_MINIMUM = 3;

const blocks = tokenBlocks(readFileSync(TOKENS, "utf8"));
const light = blocks.find((block) => block.head === "[data-design='clarity']")?.variables;
const dark = blocks.find((block) => block.head === "[data-design='clarity'].dark")?.variables;
const schemes = [
  ["light", light],
  ["dark", dark],
] as const;

/** Every declaration of every rule whose selector line contains `selector`, merged in source order. */
function declared(selector: string): Map<string, string> {
  const merged = new Map<string, string>();
  for (const rule of declarationsOf(clarityCss, selector)) for (const [name, value] of rule) merged.set(name, value);
  return merged;
}

const slotRule = (slot: string) => declared(`[data-slot="${slot}"][data-slot][data-s-${slot}] {`);
const childRule = (slot: string, child: string) => declared(`:where([data-slot="${slot}"])[data-s-${slot}] > ${child}`);
const hoverRule = (slot: string) => declared(`:where([data-slot="${slot}"])[data-s-${slot}]:hover`);

/** The value a scheme gives a token. */
function valueIn(scheme: ReadonlyMap<string, string> | undefined, token: string, what: string): string {
  const value = scheme?.get(token);
  if (value === undefined) throw new Error(`${what}: ${token} is not defined in the clarity tokens`);
  return value;
}

/** The opacity a rule draws with; no declaration means opaque. */
const opacityOf = (rule: Map<string, string>) => Number(rule.get("opacity") ?? "1");

describe("the faded ink the glyphs used to be drawn with", () => {
  it("stays under 3:1 on the field ground in both schemes, so the fixes below are not satisfied by any ink", () => {
    for (const [scheme, tokens] of schemes) {
      const ink = valueIn(tokens, "--muted-foreground", scheme);
      const card = valueIn(tokens, "--card", scheme);
      const background = valueIn(tokens, "--background", scheme);
      expect(contrast(ink, card, 0.6), `${scheme}: 60% on the card`).toBeLessThan(ICON_MINIMUM);
      expect(contrast(ink, card, 0.5), `${scheme}: 50% on the card`).toBeLessThan(ICON_MINIMUM);
      expect(contrast(ink, background, 0.6), `${scheme}: 60% on the page`).toBeLessThan(ICON_MINIMUM);
    }
  });
});

describe("the leading glyph of a date field trigger", () => {
  const triggers = [
    { slot: "date-picker-trigger", ground: "--card" },
    { slot: "date-range-picker-trigger", ground: "--background" },
  ] as const;

  for (const { slot, ground } of triggers) {
    it(`${slot} draws it in the muted ink at full opacity`, () => {
      const rule = childRule(slot, "svg:first-child");
      expect(tokenOf(rule.get("color"), `The glyph ink of ${slot}`)).toBe("--muted-foreground");
      expect(opacityOf(rule)).toBe(1);
    });

    it(`${slot} names the ground the glyph is judged on`, () => {
      expect(tokenOf(slotRule(slot).get("background-color"), `The ground of ${slot}`)).toBe(ground);
    });

    it(`${slot} glyph reaches 3:1 on its ground in the light and the dark scheme`, () => {
      for (const [scheme, tokens] of schemes) {
        const ink = valueIn(tokens, "--muted-foreground", scheme);
        const groundValue = valueIn(tokens, ground, scheme);
        expect(contrast(ink, groundValue), `${slot} ${scheme}`).toBeGreaterThanOrEqual(ICON_MINIMUM);
      }
    });
  }
});

describe("the chevron of a select field", () => {
  it("is faded only over the trigger's strong ink, which stays over 3:1 on the field ground and the disabled ground", () => {
    const opacity = opacityOf(slotRule("field-chevron"));
    expect(opacity).toBeLessThan(1);
    for (const [scheme, tokens] of schemes) {
      const ink = valueIn(tokens, "--foreground", scheme);
      for (const ground of ["--card", "--surface-2"]) {
        expect(contrast(ink, valueIn(tokens, ground, scheme), opacity), `${scheme} on ${ground}`).toBeGreaterThanOrEqual(
          ICON_MINIMUM,
        );
      }
    }
  });
});

describe("the glyph above an empty list's sentence", () => {
  it("is drawn in the muted ink at full opacity", () => {
    const rule = slotRule("crud-list-empty-icon");
    expect(tokenOf(rule.get("color"), "The empty glyph ink")).toBe("--muted-foreground");
    expect(opacityOf(rule)).toBe(1);
  });

  it("reaches 3:1 on the page and on a card in the light and the dark scheme", () => {
    for (const [scheme, tokens] of schemes) {
      const ink = valueIn(tokens, "--muted-foreground", scheme);
      for (const ground of ["--background", "--card"]) {
        expect(contrast(ink, valueIn(tokens, ground, scheme)), `${scheme} on ${ground}`).toBeGreaterThanOrEqual(
          ICON_MINIMUM,
        );
      }
    }
  });
});

describe("the clear buttons drawn inside a field", () => {
  const clears = ["field-clear-button", "date-picker-clear", "date-range-picker-clear"] as const;

  for (const slot of clears) {
    it(`${slot} stands on the neutral surface at rest and a darker one under the pointer`, () => {
      expect(tokenOf(slotRule(slot).get("background-color"), `The ground of ${slot}`)).toBe("--surface-2");
      const pointer = hoverRule(slot).get("background-color") ?? "";
      expect(pointer, `${slot} hover ground`).toContain("color-mix(");
      expect(pointer).toContain("var(--surface-2)");
    });

    it(`${slot} draws its cross in the muted ink at full opacity, the strong ink under the pointer`, () => {
      expect(tokenOf(slotRule(slot).get("color"), `The ink of ${slot}`)).toBe("--muted-foreground");
      expect(tokenOf(hoverRule(slot).get("color"), `The pointer ink of ${slot}`)).toBe("--foreground");
      // A button that carries its cross as an svg child must not fade it.
      if (slot !== "field-clear-button") expect(opacityOf(childRule(slot, "svg"))).toBe(1);
    });

    it(`${slot} cross reaches 3:1 on its ground in the light and the dark scheme`, () => {
      for (const [scheme, tokens] of schemes) {
        const ground = valueIn(tokens, "--surface-2", scheme);
        const ink = valueIn(tokens, "--muted-foreground", scheme);
        expect(contrast(ink, ground), `${slot} ${scheme}`).toBeGreaterThanOrEqual(ICON_MINIMUM);
      }
    });
  }
});
