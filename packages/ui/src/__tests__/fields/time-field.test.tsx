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

import { TimeField } from "../../fields/form/time-field";

afterEach(cleanup);

describe("TimeField", () => {
  it("renders with label and time inputs", () => {
    render(
      <TimeField label="Opening Time" value={{ hours: 9, minutes: 30 }} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Opening Time")).toBeDefined();
    expect(screen.getByTestId("form-field-opening-time")).toBeDefined();
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("09");
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).value).toBe("30");
  });

  it("displays 12 AM when value is null", () => {
    render(<TimeField label="Start" value={null} onChange={vi.fn()} />);
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("12");
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).value).toBe("00");
    expect(screen.getByRole("button", { name: "date.am" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("emits the new time when typing", () => {
    const onChange = vi.fn();
    render(
      <TimeField label="Start" value={{ hours: 10, minutes: 30 }} onChange={onChange} hour12={false} />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "14" },
    });
    expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 30 });
  });

  it("clamps commits into [minTime, maxTime]", () => {
    const onChange = vi.fn();
    render(
      <TimeField
        label="Start"
        value={{ hours: 12, minutes: 0 }}
        onChange={onChange}
        hour12={false}
        minTime={{ hours: 9, minutes: 30 }}
        maxTime={{ hours: 18, minutes: 15 }}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "20" },
    });
    expect(onChange).toHaveBeenCalledWith({ hours: 18, minutes: 15 });
  });

  it("renders with error", () => {
    render(
      <TimeField label="Start" value={null} onChange={vi.fn()} error="Required" />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("renders description", () => {
    render(
      <TimeField label="Start" value={null} onChange={vi.fn()} description="Local time" />,
    );
    expect(screen.getByText("Local time")).toBeDefined();
  });

  it("supports disabled state", () => {
    render(<TimeField label="Start" value={null} onChange={vi.fn()} disabled />);
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).disabled).toBe(true);
  });
});
