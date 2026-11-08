// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
import type { TimeRange } from "../../base/inputs/time-range-selector/types";

afterEach(cleanup);

const fetchCounts = async (_from: Date, _to: Date, buckets: number) => Array.from({ length: buckets }, () => 0);

function Controlled({ initial }: { initial: TimeRange | null }) {
  const [value, setValue] = useState<TimeRange | null>(initial);
  return (
    <TimeRangeSelector
      value={value}
      onChange={(next) => setValue({ from: next.from, to: next.to })}
      fetchCounts={fetchCounts}
    />
  );
}

const pressedPresets = () => screen.queryAllByRole("button").filter((b) => b.getAttribute("aria-pressed") === "true");
const rangeBadge = () => document.querySelector('[data-slot="time-range-badge"]');

describe("TimeRangeSelector with nothing selected", () => {
  it("lights no preset and writes no range label for a null value", () => {
    render(<Controlled initial={null} />);
    expect(screen.getAllByRole("button").some((b) => b.getAttribute("aria-pressed") !== null)).toBe(true);
    expect(pressedPresets()).toHaveLength(0);
    expect(rangeBadge()).toBeNull();
  });

  it("lights the pressed preset and writes its window once a preset is chosen", () => {
    render(<Controlled initial={null} />);
    fireEvent.click(screen.getByRole("button", { name: "7d" }));
    const pressed = pressedPresets();
    expect(pressed).toHaveLength(1);
    expect(pressed[0]?.textContent).toBe("7d");
    expect(rangeBadge()?.textContent ?? "").not.toBe("");
  });

  it("lights the default preset for a committed value", () => {
    const to = new Date(2026, 10, 9);
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    render(<Controlled initial={{ from, to }} />);
    const pressed = pressedPresets();
    expect(pressed).toHaveLength(1);
    expect(pressed[0]?.textContent).toBe("1d");
    expect(rangeBadge()).not.toBeNull();
  });

  it("returns to unselected when the parent clears the value", () => {
    const to = new Date(2026, 10, 9);
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    const props = { onChange: vi.fn(), fetchCounts };
    const view = render(<TimeRangeSelector {...props} value={{ from, to }} />);
    expect(pressedPresets()).toHaveLength(1);
    view.rerender(<TimeRangeSelector {...props} value={null} />);
    expect(pressedPresets()).toHaveLength(0);
    expect(rangeBadge()).toBeNull();
  });
});
