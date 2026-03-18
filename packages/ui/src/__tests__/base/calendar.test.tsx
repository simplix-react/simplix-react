// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => false,
  }),
}));

import { Calendar } from "../../base/controls/calendar";

afterEach(cleanup);

describe("Calendar", () => {
  it("renders with default single mode", () => {
    const { container } = render(<Calendar />);
    // Should have weekday headers
    const headers = container.querySelectorAll("header span");
    expect(headers.length).toBe(7);
  });

  it("renders day buttons", () => {
    render(<Calendar month={new Date(2024, 0, 1)} />);
    // January 2024 has 31 days
    const buttons = screen.getAllByRole("button");
    // Includes navigation buttons + day buttons
    expect(buttons.length).toBeGreaterThanOrEqual(31);
  });

  it("calls onSelect in single mode", () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        month={new Date(2024, 0, 1)}
        onSelect={onSelect}
      />,
    );
    // Click day "15"
    const day15 = screen.getByText("15");
    fireEvent.click(day15);
    expect(onSelect).toHaveBeenCalledOnce();
    const selectedDate = onSelect.mock.calls[0][0] as Date;
    expect(selectedDate.getDate()).toBe(15);
    expect(selectedDate.getMonth()).toBe(0);
    expect(selectedDate.getFullYear()).toBe(2024);
  });

  it("navigates to previous month", () => {
    render(<Calendar month={new Date(2024, 1, 1)} />);
    const prevBtn = screen.getByLabelText("Previous month");
    fireEvent.click(prevBtn);
    // After clicking prev, header should show January
    // The component uses Intl.DateTimeFormat, so look for month name
    const header = screen.getByText(/January|2024/i);
    expect(header).toBeDefined();
  });

  it("navigates to next month", () => {
    render(<Calendar month={new Date(2024, 0, 1)} />);
    const nextBtn = screen.getByLabelText("Next month");
    fireEvent.click(nextBtn);
    const header = screen.getByText(/February|2024/i);
    expect(header).toBeDefined();
  });

  it("disables dates before minDate", () => {
    render(
      <Calendar
        mode="single"
        month={new Date(2024, 0, 1)}
        minDate={new Date(2024, 0, 10)}
      />,
    );
    const day5 = screen.getByText("5");
    expect(day5).toHaveProperty("disabled", true);
  });

  it("disables dates after maxDate", () => {
    render(
      <Calendar
        mode="single"
        month={new Date(2024, 0, 1)}
        maxDate={new Date(2024, 0, 20)}
      />,
    );
    const day25 = screen.getByText("25");
    expect(day25).toHaveProperty("disabled", true);
  });

  it("highlights selected date in single mode", () => {
    render(
      <Calendar
        mode="single"
        selected={new Date(2024, 0, 15)}
        month={new Date(2024, 0, 1)}
      />,
    );
    const day15 = screen.getByText("15");
    expect(day15.className).toContain("bg-primary");
  });

  it("hides navigation when hideNavigation is true", () => {
    render(<Calendar hideNavigation />);
    expect(screen.queryByLabelText("Previous month")).toBeNull();
    expect(screen.queryByLabelText("Next month")).toBeNull();
  });

  it("hides header when hideHeader is true", () => {
    const { container } = render(<Calendar hideHeader />);
    const nav = container.querySelector("nav");
    expect(nav).toBeNull();
  });

  it("renders multiple months with numberOfMonths", () => {
    render(<Calendar numberOfMonths={2} month={new Date(2024, 0, 1)} />);
    // Should have 2 month grids
    const headers = screen.getAllByText(/January|February/i);
    expect(headers.length).toBe(2);
  });

  it("calls onSelectRange in range mode", () => {
    const onSelectRange = vi.fn();
    render(
      <Calendar
        mode="range"
        month={new Date(2024, 0, 1)}
        onSelectRange={onSelectRange}
      />,
    );
    // First click starts the range
    fireEvent.click(screen.getByText("10"));
    expect(onSelectRange).toHaveBeenCalledTimes(1);
    const firstCall = onSelectRange.mock.calls[0][0];
    expect(firstCall.from).toBeDefined();
    expect(firstCall.to).toBeUndefined();

    // Second click completes the range
    fireEvent.click(screen.getByText("20"));
    expect(onSelectRange).toHaveBeenCalledTimes(2);
    const secondCall = onSelectRange.mock.calls[1][0];
    expect(secondCall.from).toBeDefined();
    expect(secondCall.to).toBeDefined();
  });

  it("calls onSelectRange in week mode", () => {
    const onSelectRange = vi.fn();
    render(
      <Calendar
        mode="week"
        month={new Date(2024, 0, 1)}
        onSelectRange={onSelectRange}
      />,
    );
    fireEvent.click(screen.getByText("15"));
    expect(onSelectRange).toHaveBeenCalledOnce();
    const range = onSelectRange.mock.calls[0][0];
    expect(range.from).toBeDefined();
    expect(range.to).toBeDefined();
  });

  it("renders month grid in month mode", () => {
    const onSelectRange = vi.fn();
    render(
      <Calendar
        mode="month"
        month={new Date(2024, 0, 1)}
        onSelectRange={onSelectRange}
      />,
    );
    // Month mode uses year navigation
    expect(screen.getByLabelText("Previous year")).toBeDefined();
    expect(screen.getByLabelText("Next year")).toBeDefined();
    // Month names should be rendered
    expect(screen.getByText("Jan")).toBeDefined();
    expect(screen.getByText("Dec")).toBeDefined();
  });

  it("selects a month in month mode", () => {
    const onSelectRange = vi.fn();
    render(
      <Calendar
        mode="month"
        month={new Date(2024, 0, 1)}
        onSelectRange={onSelectRange}
      />,
    );
    fireEvent.click(screen.getByText("Mar"));
    expect(onSelectRange).toHaveBeenCalledOnce();
    const range = onSelectRange.mock.calls[0][0];
    expect(range.from.getMonth()).toBe(2); // March
    expect(range.to.getMonth()).toBe(2);
  });

  it("calls onMonthChange in controlled mode", () => {
    const onMonthChange = vi.fn();
    render(
      <Calendar
        month={new Date(2024, 0, 1)}
        onMonthChange={onMonthChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Next month"));
    expect(onMonthChange).toHaveBeenCalledOnce();
  });

  it("resets rangeStart when clicking earlier date in range mode", () => {
    const onSelectRange = vi.fn();
    render(
      <Calendar
        mode="range"
        month={new Date(2024, 0, 1)}
        onSelectRange={onSelectRange}
      />,
    );
    // Click day 20 first
    fireEvent.click(screen.getByText("20"));
    // Click day 5 (earlier) — should reset range start
    fireEvent.click(screen.getByText("5"));
    expect(onSelectRange).toHaveBeenCalledTimes(2);
    const secondCall = onSelectRange.mock.calls[1][0];
    expect(secondCall.from.getDate()).toBe(5);
    expect(secondCall.to).toBeUndefined();
  });
});
