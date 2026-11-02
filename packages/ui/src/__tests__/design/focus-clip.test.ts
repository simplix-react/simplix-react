import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";

/**
 * The keyboard focus ring is a box-shadow outside the control, so an ancestor that clips cuts it.
 *
 * <p>Two tokens carry the answer, and a part that clips picks one of two ways to keep the ring: a
 * part that groups controls and clips them (a tab strip, a segmented group, a row action strip, a
 * stepper) points `--focus-halo` at `--focus-halo-inset` for everything inside it, and a part that
 * only bounds its content takes a gutter of `--focus-gutter` (a negative margin and an equal
 * padding, or an `overflow-clip-margin`). The rendered probe that finds a part nobody gave either
 * lives in the UI kit (`focus-clip-rendered.mjs`); this file keeps the parts it found fixed.
 */
const theme = resolve(__dirname, "../../theme");
const read = (file: string) => readFileSync(resolve(theme, file), "utf8");

/** The compiled declarations of the rule whose selector is the slot's own. */
function slotRule(css: string, slot: string): string {
  const at = css.indexOf(`[data-slot="${slot}"]`);
  if (at < 0) throw new Error(`the compiled design has no rule for the slot ${slot}`);
  return css.slice(at, css.indexOf("}", at));
}

describe("the focus ring tokens", () => {
  it("are defined with the halo in the base theme", () => {
    const base = read("base.css");
    expect(base).toMatch(/--focus-halo:\s*0 0 0 3px/);
    expect(base).toMatch(/--focus-halo-inset:\s*inset 0 0 0 3px/);
    expect(base).toMatch(/--focus-gutter:\s*3px/);
  });

  it("are overridden together with the halo by a design", () => {
    const tokens = read("designs/clarity-tokens.css");
    const halo = /--focus-halo:\s*([^;]+);/.exec(tokens)?.[1];
    const inset = /--focus-halo-inset:\s*([^;]+);/.exec(tokens)?.[1];
    expect(halo).toBeDefined();
    // The same colour and the same reach, turned inward.
    expect(inset).toBe(halo?.replace("0 0 0 3px", "inset 0 0 0 3px"));
  });

  it("raise the control that holds focus above its neighbours, in the base layer", () => {
    const base = read("base.css");
    expect(base).toMatch(/@layer base \{\s*:where\([^)]*button[^)]*\):focus-visible \{\s*z-index: 1;/);
  });
});

describe("a part that clips the controls it groups draws their ring inside", () => {
  it.each(["tabs-list", "row-actions-strip", "crud-filter-bar-segment", "number-input-step"])("%s", (slot) => {
    expect(slotRule(clarityCss, slot)).toMatch(/--focus-halo:\s*var\(--focus-halo-inset\)/);
  });
});

describe("a part that only bounds its content leaves a gutter for the ring", () => {
  const source = readFileSync(resolve(__dirname, "../../crud/shared/section-shell.tsx"), "utf8");

  it("clips the form's unpainted section one gutter outside its padding box", () => {
    expect(clarityCss).toMatch(/\[data-slot="crud-form-body"\][^{]*\[data-slot="section-shell"\][^{]*\{[^}]*overflow-clip-margin:\s*var\(--focus-gutter\)/);
  });

  it("keeps clipping a painted section card at its padding box, where its corners round", () => {
    expect(source).toContain('isCard && "overflow-hidden"');
    expect(source).not.toContain("overflow-clip-margin");
  });

  it("pads the collapsing body by the gutter and takes the room back", () => {
    expect(source).toContain("-m-[var(--focus-gutter)] overflow-hidden p-[var(--focus-gutter)]");
  });
});
