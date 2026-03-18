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

afterEach(cleanup);

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

  it("strips non-digit characters from hour input", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "ab" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    // "ab" stripped to "" -> parseInt("") is NaN -> Math.max(0, NaN||0) = 0
    expect(result.getHours()).toBe(0);
  });

  it("strips non-digit characters from minute input", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[1], { target: { value: "xy" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getMinutes()).toBe(0);
  });

  it("renders initial hours/minutes as 00/00 when value is null", () => {
    render(<DateTimeField label="Start" value={null} onChange={vi.fn()} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    expect((inputs[0] as HTMLInputElement).value).toBe("00");
    expect((inputs[1] as HTMLInputElement).value).toBe("00");
  });

  it("parses ISO string value", () => {
    render(
      <DateTimeField label="Start" value="2024-06-15T14:30:00" onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    expect((inputs[0] as HTMLInputElement).value).toBe("14");
    expect((inputs[1] as HTMLInputElement).value).toBe("30");
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
