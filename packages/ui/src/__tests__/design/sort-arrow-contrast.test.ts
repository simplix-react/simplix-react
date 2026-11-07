import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";
import { contrast, declarationsOf, tokenBlocks, tokenOf } from "../helpers/contrast";

/**
 * The idle sort arrow of a table head stays readable in the clarity design.
 *
 * <p>A fade multiplies an ink by an opacity, so an arrow drawn in the muted ink at 45% lands under
 * the 3:1 an icon needs on the table head, in both themes, while the ink and the ground are each a
 * correct token. Nothing else fails when the opacity drops, so this file holds the three things that
 * decide the contrast of the arrow on the screen:
 *
 * <ol>
 *   <li>the compiled design draws an unsorted arrow at full opacity, at rest and under the pointer,
 *       because a fade would have to be re-lifted by every product that reads the design;
 *   <li>it names the ink in a token, whose value it never carries itself;
 *   <li>that token reaches 3:1 on the table head ground, in light and dark, and under every colour
 *       preset that redefines the muted ink.
 * </ol>
 *
 * <p>The contrast is computed from the same token files the screen reads. The fade the arrow used to
 * be drawn with is run through the same function and must come out under 3:1, which keeps the
 * check from passing on any ink.
 */

const TOKENS = fileURLToPath(new URL("../../theme/designs/clarity-tokens.css", import.meta.url));
const PRESETS = fileURLToPath(new URL("../../theme/presets/", import.meta.url));

/** What an icon needs against its ground (WCAG 1.4.11). */
const ICON_MINIMUM = 3;

const IDLE_ICON = '[data-slot="crud-list-sort-icon"][data-sorted="false"]';
const clarityTokens = tokenBlocks(readFileSync(TOKENS, "utf8"));
const lightTokens = clarityTokens.find((block) => block.head === "[data-design='clarity']")?.variables;
const darkTokens = clarityTokens.find((block) => block.head === "[data-design='clarity'].dark")?.variables;

/** The ground of a table head, named by the rule that draws it rather than assumed. */
const headGround = () =>
  tokenOf(
    declarationsOf(clarityCss, '[data-slot="table-header"][data-slot][data-s-table-header]')[0]?.get("background-color"),
    "The table head ground",
  );

/** The idle arrow's rule at rest and its rules under the pointer. */
const [restRule, ...otherIdleRules] = declarationsOf(clarityCss, `${IDLE_ICON}[data-s-crud-list-sort-icon] {`);
const hoverRules = declarationsOf(clarityCss, `button:hover > :where(${IDLE_ICON})`);

/** The token the idle arrow is drawn in at rest. */
const restInk = () => tokenOf(restRule?.get("color"), "The idle arrow's ink");

describe("the contrast function", () => {
  it("reads black on white as 21:1 and an ink on itself as 1:1", () => {
    expect(contrast("oklch(0 0 0)", "oklch(1 0 0)")).toBeCloseTo(21, 5);
    expect(contrast("oklch(0.5 0.1 120)", "oklch(0.5 0.1 120)")).toBeCloseTo(1, 5);
  });

  it("puts the retired 45% fade of the muted ink under 3:1 on the table head, in both themes", () => {
    expect(contrast("oklch(0.54 0.016 265)", "oklch(0.988 0.002 260)", 0.45)).toBeLessThan(ICON_MINIMUM);
    expect(contrast("oklch(0.64 0.01 265)", "oklch(0.205 0.009 265)", 0.45)).toBeLessThan(ICON_MINIMUM);
  });

  it("puts the same ink unfaded over 3:1, so the failure above is the fade", () => {
    expect(contrast("oklch(0.54 0.016 265)", "oklch(0.988 0.002 260)")).toBeGreaterThanOrEqual(ICON_MINIMUM);
    expect(contrast("oklch(0.64 0.01 265)", "oklch(0.205 0.009 265)")).toBeGreaterThanOrEqual(ICON_MINIMUM);
  });
});

describe("the idle sort arrow in the compiled clarity design", () => {
  it("has a rule at rest and a rule under the pointer", () => {
    expect(restRule).toBeDefined();
    expect(otherIdleRules).toHaveLength(0);
    expect(hoverRules).toHaveLength(1);
  });

  it("is drawn at full opacity in every rule that reaches it", () => {
    const opacities = [restRule, ...hoverRules].map((rule) => rule?.get("opacity"));
    expect(opacities).toEqual(["1", "1"]);
  });

  it("names its ink in a token at rest and a stronger one under the pointer", () => {
    expect(restInk()).toBe("--muted-foreground");
    expect(tokenOf(hoverRules[0]?.get("color"), "The pointer ink")).toBe("--foreground");
  });
});

describe("the ink of the idle sort arrow on the table head", () => {
  it("is named by the table head's own rule, which draws it from a token", () => {
    expect(headGround()).toBe("--table-head");
  });

  it("reaches 3:1 in the light and the dark clarity tokens", () => {
    for (const [theme, tokens] of [["light", lightTokens], ["dark", darkTokens]] as const) {
      expect(tokens, `${theme} tokens`).toBeDefined();
      const ground = tokens?.get(headGround());
      const ink = tokens?.get(restInk());
      expect(ground, `${headGround()} in ${theme}`).toBeDefined();
      expect(ink, `${restInk()} in ${theme}`).toBeDefined();
      expect(contrast(ink ?? "", ground ?? ""), `${theme} ratio`).toBeGreaterThanOrEqual(ICON_MINIMUM);
    }
  });

  it("reaches 3:1 under every colour preset that redefines the ink", () => {
    const presets = readdirSync(PRESETS).filter((file) => file.endsWith(".css"));
    let redefined = 0;
    for (const file of presets) {
      for (const block of tokenBlocks(readFileSync(`${PRESETS}${file}`, "utf8"))) {
        const ink = block.variables.get(restInk());
        if (ink === undefined) continue;
        const dark = block.head.includes(".dark");
        const ground = (dark ? darkTokens : lightTokens)?.get(headGround()) ?? "";
        redefined += 1;
        expect(contrast(ink, ground), `${file} ${dark ? "dark" : "light"}`).toBeGreaterThanOrEqual(ICON_MINIMUM);
      }
    }
    expect(redefined).toBeGreaterThan(0);
  });
});
