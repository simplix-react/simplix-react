// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CalendarBody } from "../components/calendar-body";
import { CalendarProvider } from "../context/calendar-context";
import { DAY_HIGHLIGHTS, FIXED_DATE, HEATMAP, RESOURCES, TIMELINE_ITEMS, TIME_BANDS } from "./fixtures";

afterEach(cleanup);

describe("ResourceTimelineView", () => {
  it("renders a column per resource and an item bar", () => {
    render(
      <CalendarProvider
        items={TIMELINE_ITEMS}
        resources={RESOURCES}
        defaultView="resource-timeline"
        defaultDate={FIXED_DATE}
        timeBands={TIME_BANDS}
        dayHighlights={DAY_HIGHLIGHTS}
      >
        <CalendarBody />
      </CalendarProvider>
    );

    // Column headers (resource names) render.
    expect(screen.getByText("Ada Lovelace")).toBeDefined();
    expect(screen.getByText("Grace Hopper")).toBeDefined();
    // A bar for a same-day segment renders its title.
    expect(screen.getByText("Regular Shift")).toBeDefined();
  });
});

describe("HeatmapMonthView", () => {
  it("renders 24-slot heat strips from injected aggregate data", () => {
    render(
      <CalendarProvider items={[]} resources={RESOURCES} defaultView="heatmap-month" defaultDate={FIXED_DATE} heatmap={HEATMAP}>
        <CalendarBody />
      </CalendarProvider>
    );

    // The 09:00 slot on 2026-07-15 carries its aggregate count in the title.
    expect(screen.getByTitle("09:00 · 5")).toBeDefined();
    expect(screen.getByTitle("10:00 · 3")).toBeDefined();
  });
});
