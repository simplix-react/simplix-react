import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";
import { declarationsOf } from "../helpers/contrast";

/**
 * Every button the filters draw takes the design's keyboard ring.
 *
 * <p>A slot that gives a bare `<button>` no `focus-visible` rule leaves the browser's own outline as
 * the only answer to the keyboard, which the design never drew. Two of them showed up on a list with an
 * active filter: the cross inside a filter chip and the button that clears every filter.
 *
 * <p>The buttons are read from the source (every `<button>` of `src/crud/filters/*.tsx` that carries a
 * slot) and each slot's ring from the compiled clarity stylesheet, so a button added later is held to
 * the same rule without being listed here.
 */
const filters = resolve(__dirname, "../../crud/filters");
const sources = readdirSync(filters).filter((name) => name.endsWith(".tsx"));
const styles = readdirSync(filters).filter((name) => name.endsWith(".style.ts"));

/** The slot name each exported slot declaration of the filters stands for. */
function slotsByConstant(): Map<string, string> {
  const slots = new Map<string, string>();
  for (const name of styles) {
    const text = readFileSync(resolve(filters, name), "utf8");
    for (const found of text.matchAll(/export const (\w+) = defineSlotStyle\(\{\s*slot: "([^"]+)"/g)) {
      slots.set(found[1] ?? "", found[2] ?? "");
    }
  }
  return slots;
}

/** The opening tag of a `<button`: attributes run to the first `>` outside braces that does not end an arrow. */
function openingTags(text: string): string[] {
  const tags: string[] = [];
  let from = text.indexOf("<button");
  while (from >= 0) {
    let depth = 0;
    let at = from + "<button".length;
    for (; at < text.length; at += 1) {
      const char = text[at];
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      else if (char === ">" && depth === 0 && text[at - 1] !== "=") break;
    }
    tags.push(text.slice(from, at));
    from = text.indexOf("<button", at);
  }
  return tags;
}

/** The slots of the filters' buttons, each with the files that draw one. */
function buttonSlots(): Map<string, string[]> {
  const byConstant = slotsByConstant();
  const found = new Map<string, string[]>();
  for (const name of sources) {
    for (const tag of openingTags(readFileSync(resolve(filters, name), "utf8"))) {
      for (const use of tag.matchAll(/slotAttributes\(\s*(\w+)/g)) {
        const slot = byConstant.get(use[1] ?? "");
        if (slot === undefined) throw new Error(`${name}: ${use[1]} is not a slot declaration of the filters`);
        found.set(slot, [...(found.get(slot) ?? []), name]);
      }
    }
  }
  return found;
}

/**
 * Whether some rule of `css` for `slot` draws the halo on `:focus-visible` and removes the browser outline.
 *
 * <p>A variant of the slot adds an attribute test between the slot and its marker
 * (`[data-slot="x"][data-interactive="true"][data-s-x]`), so the selector is matched with those allowed.
 */
function drawsRing(css: string, slot: string): boolean {
  const selector = new RegExp(`\\[data-slot="${slot}"\\](?:\\[[^\\]]*\\])*\\)?\\[data-s-${slot}\\]:focus-visible`);
  return css
    .split("\n")
    .filter((line) => line.trim().endsWith("{") && selector.test(line))
    .some((line) =>
      declarationsOf(css, line.trim().slice(0, -1).trim()).some(
        (rule) => /^var\(--focus-halo(-inset)?\)$/.test(rule.get("--tw-shadow") ?? "") && rule.get("outline-style") === "none",
      ),
    );
}

describe("the ring check reads a compiled rule", () => {
  const ringed = [
    '  :where([data-slot="a-button"])[data-s-a-button]:focus-visible {',
    "    --tw-shadow: var(--focus-halo);",
    "    box-shadow: var(--tw-shadow);",
    "    outline-style: none;",
    "  }",
  ].join("\n");

  it("accepts a slot that draws the halo and drops the outline", () => {
    expect(drawsRing(ringed, "a-button")).toBe(true);
  });

  it("refuses a slot that has only a hover rule", () => {
    const hoverOnly = ringed.replace(":focus-visible", ":hover");
    expect(drawsRing(hoverOnly, "a-button")).toBe(false);
  });

  it("refuses a slot whose focus rule keeps the browser outline", () => {
    expect(drawsRing(ringed.replace("    outline-style: none;\n", ""), "a-button")).toBe(false);
  });

  it("refuses a slot whose focus rule draws a different shadow", () => {
    expect(drawsRing(ringed.replace("var(--focus-halo)", "var(--shadow-1)"), "a-button")).toBe(false);
  });

  it("does not take the ring of a slot whose name only starts the same", () => {
    expect(drawsRing(ringed, "a-button-long")).toBe(false);
  });

  it("accepts the ring of a variant, which adds an attribute test between the slot and its marker", () => {
    const variant = ringed.replace('"a-button"])[data-s', '"a-button"][data-interactive="true"])[data-s');
    expect(drawsRing(variant, "a-button")).toBe(true);
  });
});

describe("the buttons of the filters", () => {
  const slots = buttonSlots();

  it("include the chip cross and the clear-all button the audit named", () => {
    expect([...slots.keys()]).toEqual(
      expect.arrayContaining([
        "crud-filter-bar-chip-remove",
        "crud-filter-bar-clear-button",
        "crud-filter-bar-columns-button",
        "crud-field-clear-button",
        "crud-filter-operator-trigger",
        "crud-unified-text-operator",
      ]),
    );
  });

  it.each([...slots.keys()].sort())("%s draws the keyboard ring in the clarity design", (slot) => {
    expect(drawsRing(clarityCss, slot), `${slot} (${[...new Set(slots.get(slot))].join(", ")})`).toBe(true);
  });
});

describe("the cross that clears one filter field", () => {
  it("carries its ring in the base, with no variant that leaves a use without one", () => {
    const text = readFileSync(resolve(filters, "field-clear-button.style.ts"), "utf8");
    expect(text).toMatch(/base: "[^"]*focus-visible:shadow-\[var\(--focus-halo\)\]/);
    expect(text).not.toMatch(/\bring:/);
  });
});
