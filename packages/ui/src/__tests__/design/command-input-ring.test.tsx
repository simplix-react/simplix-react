// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Command, CommandInput } from "../../base/inputs/command";
import clarityCss from "../../design/clarity-stylesheet";
import { declarationsOf } from "../helpers/contrast";

afterEach(cleanup);

/**
 * The search field of a command list draws the keyboard ring in the clarity design.
 *
 * <p>The field of a faceted filter's list showed only a caret while every other control of the popover
 * drew a halo. The halo goes on the row that holds the field and turns inward, since the popover's edge
 * clips an outward one; the field is the only focusable thing in its row, so `focus-within` on the row
 * is the field's own focus.
 */

/** Whether some rule of `css` for the slot's `:focus-within` draws the inward halo. */
function drawsInwardRing(css: string, slot: string): boolean {
  return declarationsOf(css, `[data-s-${slot}]:focus-within`).some((rule) => rule.get("--tw-shadow") === "var(--focus-halo-inset)");
}

describe("the search row of a command list", () => {
  it("holds the field and nothing else that takes focus", () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search" />
      </Command>,
    );
    const field = container.querySelector('[data-slot="command-input"]') as HTMLElement;
    const row = container.querySelector('[data-slot="command-input-wrapper"]') as HTMLElement;
    expect(field.parentElement).toBe(row);
    expect(row.querySelectorAll("input, button, select, textarea, a[href], [tabindex]")).toHaveLength(1);
  });

  it("draws an inward halo while the field has focus in the clarity design", () => {
    expect(drawsInwardRing(clarityCss, "command-input-wrapper")).toBe(true);
  });
});

describe("the ring reader", () => {
  const rule = [
    '  :where([data-slot="a"])[data-s-a]:focus-within {',
    "    --tw-shadow: var(--focus-halo-inset);",
    "  }",
  ].join("\n");

  it("accepts a focus-within rule that draws the inward halo", () => {
    expect(drawsInwardRing(rule, "a")).toBe(true);
  });

  it("refuses an outward halo, which the popover's edge cuts", () => {
    expect(drawsInwardRing(rule.replace("var(--focus-halo-inset)", "var(--focus-halo)"), "a")).toBe(false);
  });

  it("refuses a halo drawn only on a hover", () => {
    expect(drawsInwardRing(rule.replace(":focus-within", ":hover"), "a")).toBe(false);
  });
});
