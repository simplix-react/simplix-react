import { describe, expect, it } from "vitest";

import { heatmapColors, HEATMAP_THEMES, tokenRamp } from "../../base/inputs/time-range-selector/themes";

describe("the time range heatmap's colours", () => {
  it("ramps from the theme's muted to its primary in even steps", () => {
    const ramp = tokenRamp("#eef2f2", "#0f766e");
    expect(ramp).toHaveLength(6);
    expect(ramp[0]).toBe("#eef2f2");
    expect(ramp[5]).toBe("#0f766e");
    // Each channel moves the same way on every step: no slice lighter than the one before it.
    const red = ramp.map((one) => parseInt(one.slice(1, 3), 16));
    for (let i = 1; i < red.length; i++) expect(red[i]!).toBeLessThanOrEqual(red[i - 1]!);
  });

  it("draws the token theme from the tokens, light or dark, and selects in the ring", () => {
    const tokens = { muted: "#1a2b2b", primary: "#5eead4", ring: "#2dd4bf" };
    expect(heatmapColors("tokens", true, tokens)).toEqual({ ramp: tokenRamp("#1a2b2b", "#5eead4"), accent: "#2dd4bf" });
  });

  it("keeps a named theme's fixed palette, which the tokens do not change", () => {
    const tokens = { muted: "#000000", primary: "#ffffff", ring: "#ff0000" };
    expect(heatmapColors("slate", false, tokens)).toEqual({ ramp: HEATMAP_THEMES.slate.light, accent: HEATMAP_THEMES.slate.accent.light });
  });
});
