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

function Controlled({
  initial,
  clearable = false,
  onClear,
}: {
  initial: TimeRange | null;
  clearable?: boolean;
  onClear?: () => void;
}) {
  const [value, setValue] = useState<TimeRange | null>(initial);
  return (
    <TimeRangeSelector
      value={value}
      onChange={(next) => setValue({ from: next.from, to: next.to })}
      onClear={
        clearable
          ? () => {
              onClear?.();
              setValue(null);
            }
          : undefined
      }
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

const POPULATED: TimeRange = { from: new Date(2026, 10, 8), to: new Date(2026, 10, 9) };
const preset = (label: string) => screen.getByRole("button", { name: label });

describe("TimeRangeSelector clearing", () => {
  it("lights a preset on the first press and clears it on the second, when the host answers onClear", () => {
    const onClear = vi.fn();
    render(<Controlled initial={null} clearable onClear={onClear} />);
    fireEvent.click(preset("1d"));
    expect(pressedPresets().map((b) => b.textContent)).toEqual(["1d"]);
    expect(onClear).not.toHaveBeenCalled();
    fireEvent.click(preset("1d"));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(pressedPresets()).toHaveLength(0);
    expect(rangeBadge()).toBeNull();
    // Pressed once more it selects again: the toggle is a toggle both ways.
    fireEvent.click(preset("1d"));
    expect(pressedPresets().map((b) => b.textContent)).toEqual(["1d"]);
  });

  it("selects another preset instead of clearing when a different one is pressed", () => {
    const onClear = vi.fn();
    render(<Controlled initial={null} clearable onClear={onClear} />);
    fireEvent.click(preset("1d"));
    fireEvent.click(preset("7d"));
    expect(onClear).not.toHaveBeenCalled();
    expect(pressedPresets().map((b) => b.textContent)).toEqual(["7d"]);
  });

  it("selects the same window again on a second press when the host gives no onClear", () => {
    const onChange = vi.fn();
    const view = render(<TimeRangeSelector value={null} onChange={onChange} fetchCounts={fetchCounts} />);
    fireEvent.click(preset("1d"));
    expect(onChange).toHaveBeenCalledTimes(1);
    view.rerender(<TimeRangeSelector value={POPULATED} onChange={onChange} fetchCounts={fetchCounts} />);
    fireEvent.click(preset("1d"));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("clears through the clear action beside a partial selection", () => {
    const onClear = vi.fn();
    const from = new Date(2026, 10, 8, 3);
    const to = new Date(2026, 10, 8, 5);
    render(<Controlled initial={{ from, to }} clearable onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(rangeBadge()).toBeNull();
  });

  it("clears on Escape over the strip, and does nothing there while nothing is selected", () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    const view = render(<TimeRangeSelector value={null} onChange={onChange} onClear={onClear} fetchCounts={fetchCounts} />);
    fireEvent.keyDown(screen.getByRole("group"), { key: "Escape" });
    expect(onClear).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    view.rerender(<TimeRangeSelector value={POPULATED} onChange={onChange} onClear={onClear} fetchCounts={fetchCounts} />);
    fireEvent.keyDown(screen.getByRole("group"), { key: "Escape" });
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("offers the clear as an entry of the narrow bar's select, only while a window is lit", () => {
    const narrow = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          narrow.mockImplementation(() => cb([{ contentRect: { width: 100 } } as ResizeObserverEntry], this as unknown as ResizeObserver));
        }
        observe() {
          narrow();
        }
        unobserve() {}
        disconnect() {}
      },
    );
    try {
      const onClear = vi.fn();
      const view = render(<TimeRangeSelector value={null} onChange={vi.fn()} onClear={onClear} fetchCounts={fetchCounts} />);
      const options = () => Array.from(screen.getByRole("combobox").querySelectorAll("option")).map((o) => o.textContent);
      expect(options()).not.toContain("Clear selection");
      view.rerender(<TimeRangeSelector value={POPULATED} onChange={vi.fn()} onClear={onClear} fetchCounts={fetchCounts} />);
      expect(options()).toContain("Clear selection");
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "__clear__" } });
      expect(onClear).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("TimeRangeSelector assistive summary", () => {
  const liveRegions = () => document.querySelectorAll("[aria-live]");

  it("renders no live region and no count while nothing is selected", () => {
    render(<Controlled initial={null} />);
    expect(liveRegions()).toHaveLength(0);
    expect(screen.getByRole("group").getAttribute("aria-label") ?? "").not.toContain("·");
  });

  it("renders the range and its count in one live region for a selection", () => {
    render(<Controlled initial={POPULATED} />);
    const regions = liveRegions();
    expect(regions).toHaveLength(1);
    expect(regions[0]?.textContent).toMatch(/·\s*0$/);
    expect(screen.getByRole("group").getAttribute("aria-label")).toBe(regions[0]?.textContent);
  });

  it("drops the live region again when the selection is cleared", () => {
    render(<Controlled initial={POPULATED} clearable />);
    expect(liveRegions()).toHaveLength(1);
    fireEvent.click(preset("1d"));
    expect(liveRegions()).toHaveLength(0);
  });
});
