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

/** Press the Select button to commit the pending draft to the field. */
function commit() {
  fireEvent.click(screen.getByRole("button", { name: "common.select" }));
}

describe("DateTimeField time selection", () => {
  it("applies typed hours to the selected date on Select", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} hour12={false} />);
    openPicker();
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "14" },
    });
    // Editing the time stages the draft but does not touch the field yet
    expect(onChange).not.toHaveBeenCalled();
    commit();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(14);
  });

  it("clamps typed hours to 23 max in 24-hour mode", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} hour12={false} />);
    openPicker();
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "99" },
    });
    commit();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(23);
  });

  it("clamps typed minutes to 59 max", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(<DateTimeField label="Start" value={date} onChange={onChange} />);
    openPicker();
    fireEvent.change(screen.getByRole("textbox", { name: "date.minute" }), {
      target: { value: "99" },
    });
    commit();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getMinutes()).toBe(59);
  });

  it("does not call onChange for time change when no date is selected", () => {
    const onChange = vi.fn();
    render(<DateTimeField label="Start" value={null} onChange={onChange} />);
    openPicker();
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "10" },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("hides time inputs when hideTime is true", () => {
    render(<DateTimeField label="Start" value={null} onChange={vi.fn()} hideTime />);
    openPicker();
    // Calendar is shown, time inputs are not
    expect(screen.getByLabelText("Previous month")).toBeDefined();
    expect(screen.queryByRole("textbox", { name: "date.hour" })).toBeNull();
  });

  it("snapshots the value's time on open and picks up a new value on reopen", () => {
    const date1 = new Date("2024-06-15T10:30:00");
    const { rerender } = render(
      <DateTimeField label="Start" value={date1} onChange={vi.fn()} hour12={false} />,
    );
    openPicker();
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("10");

    // Close, change the value externally, reopen → the fresh time is shown.
    // While open, the draft is isolated, so an external change never clobbers it.
    fireEvent.click(screen.getByRole("button", { name: "common.close" }));
    const date2 = new Date("2024-06-15T18:45:00");
    rerender(<DateTimeField label="Start" value={date2} onChange={vi.fn()} hour12={false} />);
    openPicker();
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("18");
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).value).toBe("45");
  });

  it("renders disabled state", () => {
    render(<DateTimeField label="Start" value={null} onChange={vi.fn()} disabled />);
    const fieldset = screen.getByTestId("form-field-start");
    const trigger = fieldset.querySelector("button") as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
  });
});
