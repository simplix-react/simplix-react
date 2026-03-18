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

describe("DateTimeField handleDateChange", () => {
  it("applies hours and minutes to selected date", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "14" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(14);
  });

  it("clamps hours to 23 max", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "99" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(23);
  });

  it("clamps minutes to 59 max", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[1], { target: { value: "99" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getMinutes()).toBe(59);
  });

  it("does not call onChange for time change when no date is selected", () => {
    const onChange = vi.fn();
    render(<DateTimeField label="Start" value={null} onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "10" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("hides time inputs when hideTime is true", () => {
    render(<DateTimeField label="Start" value={null} onChange={vi.fn()} hideTime />);
    const fieldset = screen.getByTestId("form-field-start");
    const timeInputs = fieldset.querySelectorAll("input[type='text']");
    expect(timeInputs.length).toBe(0);
  });

  it("syncs time when value changes externally", () => {
    const onChange = vi.fn();
    const date1 = new Date("2024-06-15T10:30:00");
    const { rerender } = render(<DateTimeField label="Start" value={date1} onChange={onChange} />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    expect((inputs[0] as HTMLInputElement).value).toBe(date1.getHours().toString().padStart(2, "0"));

    const date2 = new Date("2024-06-15T18:45:00");
    rerender(<DateTimeField label="Start" value={date2} onChange={onChange} />);
    const updatedInputs = fieldset.querySelectorAll("input[type='text']");
    expect((updatedInputs[0] as HTMLInputElement).value).toBe(date2.getHours().toString().padStart(2, "0"));
    expect((updatedInputs[1] as HTMLInputElement).value).toBe(date2.getMinutes().toString().padStart(2, "0"));
  });

  it("renders disabled state", () => {
    render(<DateTimeField label="Start" value={null} onChange={vi.fn()} disabled />);
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    for (const input of inputs) {
      expect((input as HTMLInputElement).disabled).toBe(true);
    }
  });
});
