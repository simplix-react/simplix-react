// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CalendarBody } from "../components/calendar-body";
import { CalendarProvider } from "../context/calendar-context";
import { FIXED_DATE, ITEMS, RESOURCES } from "./fixtures";

afterEach(cleanup);

describe("CalendarBody (month view)", () => {
  it("renders item titles that fall within the selected month", () => {
    render(
      <CalendarProvider items={ITEMS} resources={RESOURCES} defaultView="month" defaultDate={FIXED_DATE}>
        <CalendarBody />
      </CalendarProvider>
    );

    // Single-day items in the month render as badges carrying their title.
    expect(screen.getAllByText("Standup Sync").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Design Review").length).toBeGreaterThan(0);
    // Multi-day item spanning 07-18..07-20 also appears.
    expect(screen.getAllByText(/Release Window/).length).toBeGreaterThan(0);
  });
});
