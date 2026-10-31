import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";

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

type Rgb = readonly [number, number, number];

/** An `oklch(L C H)` value as linear sRGB, clipped to the gamut. */
function oklchToLinear(value: string): Rgb {
  const found = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value.trim());
  if (!found) throw new Error(`Not a plain oklch() colour: ${value}`);
  const [lightness, chroma, hue] = [Number(found[1]), Number(found[2]), (Number(found[3]) * Math.PI) / 180];
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clip = (channel: number) => Math.min(1, Math.max(0, channel));
  return [
    clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const decode = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** The ink at an opacity over a ground, blended the way a browser blends: in encoded sRGB. */
function over(ink: Rgb, ground: Rgb, opacity: number): Rgb {
  const mix = (i: number) => decode(opacity * encode(ink[i] ?? 0) + (1 - opacity) * encode(ground[i] ?? 0));
  return [mix(0), mix(1), mix(2)];
}

/** The WCAG contrast ratio of an ink drawn at an opacity over a ground. */
function contrast(ink: string, ground: string, opacity = 1): number {
  const groundRgb = oklchToLinear(ground);
  const drawn = over(oklchToLinear(ink), groundRgb, opacity);
  const [light, dark] = [luminance(drawn), luminance(groundRgb)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

interface Block {
  readonly head: string;
  readonly variables: ReadonlyMap<string, string>;
}

/** The blocks of a token file: the selector list and the custom properties each declares. */
function tokenBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of css.replace(/\/\*[\s\S]*?\*\//g, "").split("}")) {
    const open = chunk.indexOf("{");
    if (open < 0) continue;
    const variables = new Map<string, string>();
    for (const declaration of chunk.slice(open + 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      variables.set(declaration[1] ?? "", (declaration[2] ?? "").trim());
    }
    blocks.push({ head: chunk.slice(0, open).trim(), variables });
  }
  return blocks;
}

/** The declarations of every rule whose selector line contains `selector`, as property to value. */
function declarationsOf(css: string, selector: string): Array<Map<string, string>> {
  const rules: Array<Map<string, string>> = [];
  const lines = css.split("\n");
  for (let at = 0; at < lines.length; at += 1) {
    const line = lines[at]?.trim() ?? "";
    if (!line.endsWith("{") || !line.includes(selector)) continue;
    const declarations = new Map<string, string>();
    for (let next = at + 1; next < lines.length && lines[next]?.trim() !== "}"; next += 1) {
      const declaration = /^([\w-]+)\s*:\s*(.+?);?$/.exec(lines[next]?.trim() ?? "");
      if (declaration) declarations.set(declaration[1] ?? "", declaration[2] ?? "");
    }
    rules.push(declarations);
  }
  return rules;
}

/** The token a `var(--name)` value names. */
function tokenOf(value: string | undefined, what: string): string {
  const named = /^var\((--[\w-]+)\)$/.exec(value ?? "");
  if (!named) throw new Error(`${what} is not drawn from a token: ${value ?? "(none)"}`);
  return named[1] ?? "";
}

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
