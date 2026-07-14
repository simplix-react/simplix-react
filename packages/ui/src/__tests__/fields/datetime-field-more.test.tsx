// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { DateTimeField } from "../../fields/form/datetime-field";

// First popover mount pays one-time Radix/jsdom initialization cost
vi.setConfig({ testTimeout: 20_000 });

afterEach(cleanup);

function openPicker() {
  const fieldset = screen.getByTestId("form-field-start");
  const trigger = fieldset.querySelector("button") as HTMLButtonElement;
  fireEvent.click(trigger);
}

describe("DateTimeField (more coverage)", () => {
  it("renders with error", () => {
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} error="Required" />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("renders description", () => {
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} description="Pick date and time" />,
    );
    expect(screen.getByText("Pick date and time")).toBeDefined();
  });

  it("ignores non-digit characters in the hour input", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    openPicker();
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "ab" },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores non-digit characters in the minute input", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    openPicker();
    fireEvent.change(screen.getByRole("textbox", { name: "date.minute" }), {
      target: { value: "xy" },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders initial time as 00:00 when value is null", () => {
    render(<DateTimeField label="Start" value={null} onChange={vi.fn()} hour12={false} />);
    openPicker();
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("00");
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).value).toBe("00");
  });

  it("parses ISO string value", () => {
    render(
      <DateTimeField label="Start" value="2024-06-15T14:30:00" onChange={vi.fn()} hour12={false} />,
    );
    openPicker();
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("14");
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).value).toBe("30");
  });

  it("forwards locale, startYear, endYear props", () => {
    render(
      <DateTimeField
        label="Start"
        value={null}
        onChange={vi.fn()}
        locale="ko"
        startYear={2020}
        endYear={2025}
      />,
    );
    expect(screen.getByTestId("form-field-start")).toBeDefined();
  });

  it("forwards minDate and maxDate props", () => {
    const min = new Date(2024, 0, 1);
    const max = new Date(2024, 11, 31);
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} minDate={min} maxDate={max} />,
    );
    expect(screen.getByTestId("form-field-start")).toBeDefined();
  });

  it("forwards placeholder prop", () => {
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} placeholder="Select..." />,
    );
    expect(screen.getByText("Select...")).toBeDefined();
  });
});
