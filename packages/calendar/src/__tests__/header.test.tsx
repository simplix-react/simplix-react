// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CalendarHeader } from "../components/header/calendar-header";
import type { CalendarHeaderProps } from "../components/header/calendar-header";
import { CalendarProvider } from "../context/calendar-context";
import type { CalendarView } from "../model/types";
import { FIXED_DATE } from "./fixtures";

afterEach(cleanup);

// Without an i18n provider the framework `t` returns the key, so aria-labels
// are the stable "accessibility.*" strings — ideal for deterministic queries.
function renderHeader(headerProps: CalendarHeaderProps, defaultView: CalendarView = "month") {
  return render(
    <CalendarProvider items={[]} defaultDate={FIXED_DATE} defaultView={defaultView}>
      <CalendarHeader {...headerProps} />
    </CalendarProvider>
  );
}

describe("CalendarHeader view switcher", () => {
  it("shows the five base views by default and hides the data-driven views", () => {
    renderHeader({});
    expect(screen.getByLabelText("accessibility.viewByDay")).toBeDefined();
    expect(screen.getByLabelText("accessibility.viewByAgenda")).toBeDefined();
    expect(screen.queryByLabelText("accessibility.viewByResourceTimeline")).toBeNull();
    expect(screen.queryByLabelText("accessibility.viewByHeatmap")).toBeNull();
  });

  it("renders only the requested views when restricted", () => {
    renderHeader({ views: ["heatmap-month", "week", "resource-timeline", "agenda"] });
    expect(screen.getByLabelText("accessibility.viewByHeatmap")).toBeDefined();
    expect(screen.getByLabelText("accessibility.viewByResourceTimeline")).toBeDefined();
    expect(screen.queryByLabelText("accessibility.viewByDay")).toBeNull();
    expect(screen.queryByLabelText("accessibility.viewByMonth")).toBeNull();
  });

  it("hides the switcher for a single view but keeps year-granularity navigation", () => {
    renderHeader({ views: ["year"] }, "year");
    // Switcher hidden.
    expect(screen.queryByLabelText("accessibility.viewByYear")).toBeNull();
    // DateNavigator still renders: the title and the range label both carry
    // the year-only text in the year view.
    expect(screen.getAllByText("2026").length).toBeGreaterThanOrEqual(1);
  });
});
