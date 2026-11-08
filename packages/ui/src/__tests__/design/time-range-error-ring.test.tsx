// @vitest-environment jsdom
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import clarityCss from "../../design/clarity-stylesheet";
import { declarationsOf } from "../helpers/contrast";

vi.mock("react-apexcharts", () => ({
  default: () => <div data-testid="apex-chart" />,
}));

vi.mock("../../base/charts/apexcharts/use-chart-theme", () => ({
  useChartTheme: () => ({
    foreground: "#09090b",
    mutedForeground: "#71717a",
    border: "#e4e4e7",
    borderLight: "rgba(0,0,0,0.12)",
    background: "#ffffff",
    muted: "#f4f4f5",
    primary: "#18181b",
    ring: "#a1a1aa",
    fontFamily: "inherit",
    tooltipTheme: "light" as const,
  }),
  hideGridRect: vi.fn(),
  toHex6: (c: string) => c,
}));

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
    locale: "en",
    exists: () => true,
  }),
}));

import { TimeRangeSelector } from "../../base/inputs/time-range-selector";

afterEach(cleanup);

/**
 * The time range selector's load-error state.
 *
 * <p>The overlay that says "Failed to load" fills the heatmap box and sits above it (`z-30`), while the
 * halo of a control beside the heatmap reaches a few pixels into that box. A control left under the
 * overlay had its keyboard ring covered, and the retry button inside the overlay was a bare border with
 * no ground. The controls are read from the rendered error state and their rules from the compiled
 * clarity stylesheet, so a control added to the selector later is held to the same rules.
 */

/** Renders the selector with a read that fails and waits for the error overlay. */
async function renderFailed(): Promise<HTMLElement> {
  const fetchCounts = async (): Promise<number[]> => {
    throw new Error("read failed");
  };
  const { container } = render(
    <TimeRangeSelector value={{ from: new Date(Date.now() - 3_600_000), to: new Date() }} onChange={() => undefined} fetchCounts={fetchCounts} />,
  );
  await waitFor(() => expect(container.querySelector('[data-slot="time-range-error"]')).not.toBeNull());
  return container;
}

/** The z-index step a Tailwind class list gives an element, or 0 when it names none. */
function zOf(classes: string): number {
  const found = /(?:^|\s)z-(\d+)(?:\s|$)/.exec(classes);
  return found ? Number(found[1]) : 0;
}

/** The compiled declarations of the slot's own rule (base layer, before any state). */
function baseRule(css: string, slot: string): Map<string, string> {
  const merged = new Map<string, string>();
  for (const rule of declarationsOf(css, `[data-slot="${slot}"][data-slot][data-s-${slot}]`)) for (const [key, value] of rule) merged.set(key, value);
  return merged;
}

/** The slot's declarations while the keyboard holds it. */
function focusRule(css: string, slot: string): Map<string, string> {
  const merged = new Map<string, string>();
  for (const rule of declarationsOf(css, `[data-s-${slot}]:focus-visible`)) for (const [key, value] of rule) merged.set(key, value);
  return merged;
}

/** Whether the slot's focus rule draws the design's halo and drops the browser outline. */
function drawsHalo(css: string, slot: string): boolean {
  const rule = focusRule(css, slot);
  return rule.get("--tw-shadow") === "var(--focus-halo)" && rule.get("outline-style") === "none";
}

describe("the error overlay", () => {
  it("is drawn inside the heatmap box, never beside the navigation controls", async () => {
    const container = await renderFailed();
    const overlay = container.querySelector('[data-slot="time-range-error"]') as HTMLElement;
    const heatmap = container.querySelector('[data-slot="time-range-heatmap"]') as HTMLElement;
    expect(overlay.parentElement).toBe(heatmap);
    for (const nav of container.querySelectorAll('[data-slot="time-range-nav-button"]')) expect(heatmap.contains(nav)).toBe(false);
  });

  it("is lower than the focus layer of every other control of the selector in the clarity design", async () => {
    const container = await renderFailed();
    const overlay = container.querySelector('[data-slot="time-range-error"]') as HTMLElement;
    const overlayZ = zOf(overlay.className);
    expect(overlayZ).toBeGreaterThan(0);
    const slots = new Set<string>();
    for (const control of container.querySelectorAll("button, select")) {
      const slot = control.getAttribute("data-slot");
      if (slot && slot !== "time-range-retry" && !overlay.contains(control)) slots.add(slot);
    }
    expect([...slots]).toEqual(expect.arrayContaining(["time-range-nav-button", "time-range-preset", "time-range-action"]));
    for (const slot of slots) {
      expect(baseRule(clarityCss, slot).get("position"), `${slot} is positioned`).toBe("relative");
      expect(Number(focusRule(clarityCss, slot).get("z-index")), `${slot} holds focus above the overlay`).toBeGreaterThan(overlayZ);
    }
  });
});

describe("the retry button", () => {
  it("stands on a ground and draws the keyboard halo in the clarity design", async () => {
    const container = await renderFailed();
    const retry = container.querySelector('[data-slot="time-range-retry"]') as HTMLElement;
    expect(retry.closest('[data-slot="time-range-error"]')).not.toBeNull();
    expect(baseRule(clarityCss, "time-range-retry").get("background-color")).toMatch(/^var\(--/);
    expect(drawsHalo(clarityCss, "time-range-retry")).toBe(true);
  });
});

describe("the rule readers", () => {
  const ringed = [
    '  :where([data-slot="a"])[data-s-a]:focus-visible {',
    "    --tw-shadow: var(--focus-halo);",
    "    outline-style: none;",
    "    z-index: 40;",
    "  }",
  ].join("\n");

  it("read the halo and the layer of a focus rule", () => {
    expect(drawsHalo(ringed, "a")).toBe(true);
    expect(Number(focusRule(ringed, "a").get("z-index"))).toBe(40);
  });

  it("refuse a focus rule that lost the halo", () => {
    expect(drawsHalo(ringed.replace("var(--focus-halo)", "none"), "a")).toBe(false);
  });

  it("read no layer from a rule that names none", () => {
    expect(focusRule(ringed.replace("    z-index: 40;\n", ""), "a").get("z-index")).toBeUndefined();
  });

  it("read the layer of a Tailwind class list", () => {
    expect(zOf("absolute inset-0 z-30 flex")).toBe(30);
    expect(zOf("absolute inset-0 focus-visible:z-40")).toBe(0);
  });
});
