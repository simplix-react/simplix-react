import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import clarityCss from "../../design/clarity-stylesheet";

const theme = join(dirname(fileURLToPath(import.meta.url)), "../../theme");
const baseCss = readFileSync(join(theme, "base.css"), "utf8");
const classicCss = readFileSync(join(theme, "designs/classic.css"), "utf8");

/**
 * A focused control is lifted by base.css (`:focus-visible { z-index: N }`). The language selector
 * drawn inside a multilingual field lives on a layer over that same control; if the layer is not
 * stacked above the lift, the focused input covers the selector and it cannot be pressed.
 */
function focusLift(): number {
  const block = /\):focus-visible\s*\{\s*z-index:\s*(\d+)\s*;/.exec(baseCss);
  if (!block) throw new Error("base.css no longer lifts a focused control with a z-index");
  return Number(block[1]);
}

/**
 * Every slot drawn absolutely over a control that is itself lifted on keyboard focus: the language
 * selector's layer, the password toggle, the two date pickers' clear buttons and the select
 * trigger's action group.
 */
const OVER_A_FOCUSABLE_CONTROL = [
  "field-language-inset-overlay",
  "field-password-toggle",
  "date-picker-clear",
  "date-range-picker-clear",
  "field-select-trigger-actions",
] as const;

function rule(css: string, slot: string): string | undefined {
  return new RegExp(`\\[data-slot="${slot}"\\][^{]*\\{([^}]*)\\}`).exec(css)?.[1];
}

function compiledZ(css: string, slot: string): number | undefined {
  const z = /z-index:\s*(-?\d+)/.exec(rule(css, slot) ?? "");
  return z ? Number(z[1]) : undefined;
}

function appliedZ(css: string, slot: string): number | undefined {
  const z = /@apply[^;]*\bz-(\d+)\b/.exec(rule(css, slot) ?? "");
  return z ? Number(z[1]) : undefined;
}

describe("a control drawn over a focusable control stays above it while it is focused", () => {
  it("lifts a focused control by a positive step", () => {
    expect(focusLift()).toBeGreaterThan(0);
  });

  for (const slot of OVER_A_FOCUSABLE_CONTROL) {
    it(`stacks ${slot} above the focus lift in the compiled clarity design`, () => {
      const z = compiledZ(clarityCss, slot);
      expect(z).toBeDefined();
      expect(z!).toBeGreaterThan(focusLift());
    });

    it(`stacks ${slot} above the focus lift in the classic design`, () => {
      const z = appliedZ(classicCss, slot);
      expect(z).toBeDefined();
      expect(z!).toBeGreaterThan(focusLift());
    });
  }
});
