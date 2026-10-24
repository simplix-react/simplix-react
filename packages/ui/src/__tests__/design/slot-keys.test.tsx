// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { defineSlotStyle, isPartAttribute, partAttributes, slotAttributes } from "../../design/slot-style";
import { Grid } from "../../primitives/grid";

afterEach(cleanup);

const probe = defineSlotStyle({ slot: "probe", base: "", variants: { size: { sm: "", md: "" } }, defaultVariants: { size: "md" } });
const probePart = defineSlotStyle({ slot: "probe-part", as: "part", base: "", variants: {}, defaultVariants: {} });

// A selector whose rightmost compound names a slot or a part without that slot's own attribute is
// filed by Safari with every other slot's rules and checked against every slot element.
const unkeyed = (css: string): string[] =>
  css
    .split("\n")
    .filter((line) => line.trimEnd().endsWith("{") && !line.trimStart().startsWith("@"))
    .filter((line) => {
      const selector = line.trim().slice(0, -1).trim();
      const slot = selector.match(/\[data-slot="([^"]+)"\]/)?.[1];
      const part = selector.match(/\[data-part="([^"]+)"\]/)?.[1];
      if (slot) return !selector.includes(`[data-s-${slot}]`);
      if (part) return !selector.includes(`[data-p-${part}]`);
      return false;
    });

describe("slot keys", () => {
  it("names the slot and the part in an attribute of their own", () => {
    expect(slotAttributes(probe, {})).toEqual({ "data-slot": "probe", "data-s-probe": "", "data-size": "md" });
    expect(partAttributes(probePart, {})).toEqual({ "data-part": "probe-part", "data-p-probe-part": "" });
    expect(isPartAttribute("data-p-probe-part")).toBe(true);
    expect(isPartAttribute("data-part-single")).toBe(true);
    expect(isPartAttribute("data-slot")).toBe(false);
  });

  it("keys every generated rule on the slot's attribute", () => {
    for (const file of ["classic.css", "clarity.css"]) {
      const css = readFileSync(fileURLToPath(new URL(`../../theme/designs/${file}`, import.meta.url)), "utf8");
      expect(unkeyed(css), file).toEqual([]);
    }
    expect(unkeyed(`  :where([data-slot="probe"]) {\n`)).toHaveLength(1);
    expect(unkeyed(`  [data-slot="probe"][data-slot][data-s-probe] {\n`)).toHaveLength(0);
  });

  it("hands a part's key to the element that draws a responsive grid", () => {
    const { container } = render(<Grid columns={2} {...partAttributes(probePart, {})} />);
    const drawn = container.querySelector("[data-part=probe-part]");
    expect(drawn?.hasAttribute("data-p-probe-part")).toBe(true);
    expect(container.firstElementChild?.hasAttribute("data-p-probe-part")).toBe(false);
  });
});
