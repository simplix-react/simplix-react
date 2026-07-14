// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && "count" in params ? `${key}:${String(params.count)}` : key,
    locale: "en",
    exists: () => false,
  }),
}));

import { DateRangePicker } from "../../base/inputs/date-range-picker";

// First popover mount pays one-time Radix/jsdom initialization cost
vi.setConfig({ testTimeout: 20_000 });

afterEach(cleanup);

function openPicker(container: HTMLElement) {
  const trigger = container.querySelector("button") as HTMLButtonElement;
  fireEvent.click(trigger);
}

describe("DateRangePicker", () => {
  const range = { from: new Date(2026, 6, 7), to: new Date(2026, 7, 27) };

  it("renders a month/year select pair per visible calendar", () => {
    const { container } = render(
      <DateRangePicker value={range} onChange={vi.fn()} />,
    );
    openPicker(container);

    // 2 calendars × (month + year) selects
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBe(4);
  });

  it("renders a single select pair with one month", () => {
    const { container } = render(
      <DateRangePicker value={range} onChange={vi.fn()} numberOfMonths={1} />,
    );
    openPicker(container);
    expect(screen.getAllByRole("combobox").length).toBe(2);
  });

  it("shows the second calendar one month after the first", () => {
    const { container } = render(
      <DateRangePicker value={range} onChange={vi.fn()} />,
    );
    openPicker(container);

    const selects = screen.getAllByRole("combobox");
    const texts = selects.map((s) => s.textContent);
    // viewMonth = July 2026 → second pair shows August 2026
    expect(texts).toContain("Jul");
    expect(texts).toContain("Aug");
    expect(texts.filter((x) => x === "2026").length).toBe(2);
  });

  it("shows start date, end date, and inclusive day count", () => {
    const { container } = render(
      <DateRangePicker value={range} onChange={vi.fn()} />,
    );
    openPicker(container);

    expect(screen.getByText("date.startDate")).toBeDefined();
    expect(screen.getByText("date.endDate")).toBeDefined();
    // Jul 7 – Aug 27, 2026 inclusive = 52 days
    expect(screen.getByText("date.daysCount:52")).toBeDefined();
  });

  it("shows an open end while only the start is picked", () => {
    const { container } = render(
      <DateRangePicker
        value={{ from: new Date(2026, 6, 7), to: undefined }}
        onChange={vi.fn()}
      />,
    );
    openPicker(container);

    expect(screen.getByText("date.startDate")).toBeDefined();
    expect(screen.getByText("...")).toBeDefined();
    expect(screen.queryByText(/^date\.daysCount:/)).toBeNull();
  });

  it("hides the summary without a selection", () => {
    const { container } = render(
      <DateRangePicker
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
      />,
    );
    openPicker(container);
    expect(screen.queryByText("date.startDate")).toBeNull();
  });

  it("counts a single-day range as 1 day", () => {
    const { container } = render(
      <DateRangePicker
        value={{ from: new Date(2026, 6, 7, 0, 0), to: new Date(2026, 6, 7, 23, 59) }}
        onChange={vi.fn()}
      />,
    );
    openPicker(container);
    expect(screen.getByText("date.daysCount:1")).toBeDefined();
  });

  it("keeps preset labels on a single line", () => {
    const { container } = render(
      <DateRangePicker value={range} onChange={vi.fn()} />,
    );
    openPicker(container);

    const preset = screen.getByText("date.last15Days");
    expect(preset.className).toContain("whitespace-nowrap");
  });
});
