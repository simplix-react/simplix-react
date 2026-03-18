// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { DateField } from "../../fields/form/date-field";

afterEach(cleanup);

describe("DateField (extended coverage)", () => {
  it("renders with label and testid", () => {
    render(<DateField label="Birth Date" value={null} onChange={vi.fn()} />);
    expect(screen.getByText("Birth Date")).toBeDefined();
    expect(screen.getByTestId("form-field-birth-date")).toBeDefined();
  });

  it("renders date picker trigger button", () => {
    render(<DateField label="Date" value={null} onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button).not.toBeNull();
  });

  it("parses ISO string value", () => {
    render(
      <DateField label="Date" value="2024-06-15" onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button?.textContent).toContain("15");
  });

  it("parses numeric timestamp value", () => {
    const ts = new Date("2024-06-15T00:00:00").getTime();
    render(
      <DateField label="Date" value={ts} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button?.textContent).toContain("15");
  });

  it("parses Date object value", () => {
    const date = new Date("2024-06-15");
    render(
      <DateField label="Date" value={date} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button?.textContent).toContain("15");
  });

  it("renders with null value showing placeholder", () => {
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} placeholder="Select date" />,
    );
    expect(screen.getByText("Select date")).toBeDefined();
  });

  it("shows error", () => {
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} error="Required" />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("shows description", () => {
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} description="Pick a date" />,
    );
    expect(screen.getByText("Pick a date")).toBeDefined();
  });

  it("renders disabled state", () => {
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} disabled />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("forwards locale prop", () => {
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} locale="ko" />,
    );
    expect(screen.getByTestId("form-field-date")).toBeDefined();
  });

  it("forwards startYear, endYear, reverseYears props", () => {
    render(
      <DateField
        label="Date"
        value={null}
        onChange={vi.fn()}
        startYear={2020}
        endYear={2025}
        reverseYears
      />,
    );
    expect(screen.getByTestId("form-field-date")).toBeDefined();
  });

  it("forwards minDate and maxDate props", () => {
    const min = new Date(2024, 0, 1);
    const max = new Date(2024, 11, 31);
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} minDate={min} maxDate={max} />,
    );
    expect(screen.getByTestId("form-field-date")).toBeDefined();
  });
});
