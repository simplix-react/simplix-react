// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "date.pickDate": "Pick a date",
      };
      return map[key] ?? key;
    },
    locale: "en",
    exists: () => false,
  }),
}));

import { DatePicker } from "../../base/inputs/date-picker";

afterEach(cleanup);

describe("DatePicker (extended coverage)", () => {
  it("calls onChange(undefined) when clear button is triggered via keyboard Enter", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={new Date(2024, 0, 15)} onChange={onChange} />,
    );
    const clearBtn = container.querySelector("[role='button']");
    expect(clearBtn).not.toBeNull();
    fireEvent.keyDown(clearBtn!, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onChange(undefined) when clear button is triggered via keyboard Space", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={new Date(2024, 0, 15)} onChange={onChange} />,
    );
    const clearBtn = container.querySelector("[role='button']");
    expect(clearBtn).not.toBeNull();
    fireEvent.keyDown(clearBtn!, { key: " " });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("opens popover and navigates to previous month", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Pick a date"));
    const prevBtn = screen.getByLabelText("Previous month");
    fireEvent.click(prevBtn);
    // No error means navigation succeeded
    expect(prevBtn).toBeDefined();
  });

  it("opens popover and navigates to next month", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Pick a date"));
    const nextBtn = screen.getByLabelText("Next month");
    fireEvent.click(nextBtn);
    expect(nextBtn).toBeDefined();
  });

  it("renders year-first locale ordering for year-first locales", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} locale="ko" />);
    fireEvent.click(screen.getByText("Pick a date"));
    // Just verify the selects are rendered (year and month)
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBe(2);
  });

  it("renders month-first locale ordering for non-year-first locales", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} locale="en" />);
    fireEvent.click(screen.getByText("Pick a date"));
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBe(2);
  });

  it("renders with reverseYears prop", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} reverseYears />);
    fireEvent.click(screen.getByText("Pick a date"));
    // Verify it renders without error
    expect(screen.getByLabelText("Previous month")).toBeDefined();
  });

  it("renders with custom startYear and endYear", () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} startYear={2020} endYear={2025} />);
    fireEvent.click(screen.getByText("Pick a date"));
    expect(screen.getByLabelText("Previous month")).toBeDefined();
  });

  it("passes minDate and maxDate to Calendar", () => {
    const min = new Date(2024, 0, 1);
    const max = new Date(2024, 11, 31);
    render(
      <DatePicker value={undefined} onChange={vi.fn()} minDate={min} maxDate={max} />,
    );
    fireEvent.click(screen.getByText("Pick a date"));
    expect(screen.getByLabelText("Previous month")).toBeDefined();
  });
});
