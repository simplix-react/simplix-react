// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => false,
  }),
}));

import { DatePicker } from "../../base/inputs/date-picker";

// First popover mount pays one-time Radix/jsdom initialization cost
vi.setConfig({ testTimeout: 20_000 });

afterEach(cleanup);

function openPicker(container: HTMLElement) {
  const trigger = container.querySelector("button") as HTMLButtonElement;
  fireEvent.click(trigger);
}

/** The option list carries the same aria-label as the spinner input; pick the div. */
function getColumn(label: string): HTMLElement {
  const column = screen
    .getAllByLabelText(label)
    .find((el) => el.tagName === "DIV");
  expect(column).toBeDefined();
  return column as HTMLElement;
}

/** Focus a time input so its option list drops open, then return the list. */
function openColumn(label: string): HTMLElement {
  fireEvent.focus(screen.getByRole("textbox", { name: label }));
  return getColumn(label);
}

describe("DatePicker showTime", () => {
  const value = new Date(2024, 5, 15, 10, 30);

  it("renders time inputs and meridiem toggle; option lists open on focus", () => {
    const { container } = render(
      <DatePicker value={value} onChange={vi.fn()} showTime />,
    );
    openPicker(container);

    expect(screen.getByRole("textbox", { name: "date.hour" })).toBeDefined();
    expect(screen.getByRole("textbox", { name: "date.minute" })).toBeDefined();
    expect(screen.getByRole("button", { name: "date.am" })).toBeDefined();
    expect(screen.getByRole("button", { name: "date.pm" })).toBeDefined();

    // Lists are closed until a time input takes focus
    expect(screen.getAllByLabelText("date.hour").every((el) => el.tagName !== "DIV")).toBe(true);
    expect(openColumn("date.hour")).toBeDefined();
    // Focusing the minute input switches the open list
    expect(openColumn("date.minute")).toBeDefined();
    expect(screen.getAllByLabelText("date.hour").every((el) => el.tagName !== "DIV")).toBe(true);
  });

  it("does not render time UI without showTime", () => {
    const { container } = render(<DatePicker value={value} onChange={vi.fn()} />);
    openPicker(container);
    expect(screen.queryByRole("textbox", { name: "date.hour" })).toBeNull();
  });

  it("shows 12-hour display values in inputs", () => {
    const { container } = render(
      <DatePicker value={new Date(2024, 5, 15, 15, 5)} onChange={vi.fn()} showTime />,
    );
    openPicker(container);
    const hourInput = screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement;
    const minuteInput = screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement;
    expect(hourInput.value).toBe("03");
    expect(minuteInput.value).toBe("05");
    expect(screen.getByRole("button", { name: "date.pm" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps the popover open and preserves time when a day is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(screen.getByText("5"));

    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getDate()).toBe(5);
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
    // Popover stays open
    expect(screen.getByLabelText("Previous month")).toBeDefined();
  });

  it("updates the hour when a scroll column item is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(within(openColumn("date.hour")).getByText("date.am 03"));

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(3);
    expect(result.getMinutes()).toBe(30);
  });

  it("lists the full day in the 12-hour scroll column and switches meridiem on click", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);

    const hourColumn = openColumn("date.hour");
    const hourButtons = within(hourColumn).getAllByRole("button");
    expect(hourButtons.length).toBe(24);
    expect(hourButtons[0].textContent).toBe("date.am 12");
    expect(hourButtons[12].textContent).toBe("date.pm 12");
    expect(hourButtons[23].textContent).toBe("date.pm 11");

    // Clicking a PM hour from an AM value switches the meridiem too
    fireEvent.click(within(hourColumn).getByText("date.pm 03"));
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(15);
  });

  it("updates the minute when a scroll column item is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(within(openColumn("date.minute")).getByText("45"));

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(45);
  });

  it("increments the hour with the spinner button", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(screen.getByRole("button", { name: "date.hour +" }));

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(11);
  });

  it("decrements the minute with the spinner button", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(screen.getByRole("button", { name: "date.minute -" }));

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getMinutes()).toBe(29);
  });

  it("wraps the minute spinner at the bounds", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={new Date(2024, 5, 15, 10, 59)} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(screen.getByRole("button", { name: "date.minute +" }));

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getMinutes()).toBe(0);
  });

  it("steps with ArrowUp/ArrowDown on the input", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "date.hour" }), { key: "ArrowUp" });

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(11);
  });

  it("commits typed minutes", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.change(screen.getByRole("textbox", { name: "date.minute" }), {
      target: { value: "45" },
    });

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getMinutes()).toBe(45);
  });

  it("allows typing a two-digit value digit by digit", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime hour12={false} />,
    );
    openPicker(container);
    const hourInput = screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement;

    fireEvent.focus(hourInput);
    fireEvent.change(hourInput, { target: { value: "1" } });
    // The first digit must stay raw ("1", not "01") so the second digit can follow
    expect(hourInput.value).toBe("1");
    fireEvent.change(hourInput, { target: { value: "10" } });
    fireEvent.change(hourInput, { target: { value: "108" } });
    // Extra digits beyond two are ignored
    expect(hourInput.value).toBe("10");

    const result = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(result.getHours()).toBe(10);

    fireEvent.blur(hourInput);
    expect(hourInput.value).toBe("10");
  });

  it("restores the padded value on blur after clearing the input", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={new Date(2024, 5, 15, 9, 5)} onChange={onChange} showTime hour12={false} />,
    );
    openPicker(container);
    const hourInput = screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement;

    fireEvent.focus(hourInput);
    fireEvent.change(hourInput, { target: { value: "" } });
    expect(hourInput.value).toBe("");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(hourInput);
    expect(hourInput.value).toBe("09");
  });

  it("clamps typed hours above the maximum (24-hour mode)", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime hour12={false} />,
    );
    openPicker(container);
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "99" },
    });

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(23);
  });

  it("switches meridiem with the toggle", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={value} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(screen.getByRole("button", { name: "date.pm" }));

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(22);
    expect(result.getMinutes()).toBe(30);
  });

  it("hides the meridiem toggle and lists 24 hours in 24-hour mode", () => {
    const { container } = render(
      <DatePicker value={value} onChange={vi.fn()} showTime hour12={false} />,
    );
    openPicker(container);

    expect(screen.queryByRole("button", { name: "date.am" })).toBeNull();
    const hourButtons = within(openColumn("date.hour")).getAllByRole("button");
    expect(hourButtons.length).toBe(24);
    expect(within(openColumn("date.hour")).getByText("23")).toBeDefined();
  });

  it("respects minuteStep in the scroll column", () => {
    const { container } = render(
      <DatePicker value={value} onChange={vi.fn()} showTime minuteStep={15} />,
    );
    openPicker(container);

    const minuteButtons = within(openColumn("date.minute")).getAllByRole("button");
    expect(minuteButtons.map((b) => b.textContent)).toEqual(["00", "15", "30", "45"]);
  });

  it("keeps an off-step selected minute visible in the column", () => {
    const { container } = render(
      <DatePicker value={new Date(2024, 5, 15, 10, 7)} onChange={vi.fn()} showTime minuteStep={15} />,
    );
    openPicker(container);

    const minuteButtons = within(openColumn("date.minute")).getAllByRole("button");
    expect(minuteButtons.map((b) => b.textContent)).toEqual(["00", "07", "15", "30", "45"]);
  });

  it("disables out-of-range hours in the scroll column", () => {
    const day = new Date(2024, 5, 15, 12, 0);
    const { container } = render(
      <DatePicker
        value={day}
        onChange={vi.fn()}
        showTime
        hour12={false}
        minDate={new Date(2024, 5, 15, 9, 30)}
        maxDate={new Date(2024, 5, 15, 18, 15)}
      />,
    );
    openPicker(container);

    const hourColumn = openColumn("date.hour");
    expect((within(hourColumn).getByText("08") as HTMLButtonElement).disabled).toBe(true);
    expect((within(hourColumn).getByText("09") as HTMLButtonElement).disabled).toBe(false);
    expect((within(hourColumn).getByText("18") as HTMLButtonElement).disabled).toBe(false);
    expect((within(hourColumn).getByText("19") as HTMLButtonElement).disabled).toBe(true);
  });

  it("sets the current date and time with the now button", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={undefined} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(screen.getByRole("button", { name: "date.now" }));

    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(Math.abs(result.getTime() - Date.now())).toBeLessThan(60_000);
    expect(result.getSeconds()).toBe(0);
  });

  it("does not fire onChange for time changes without a selected date", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={undefined} onChange={onChange} showTime />,
    );
    openPicker(container);
    fireEvent.click(screen.getByRole("button", { name: "date.hour +" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies the pending time when a day is then selected", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker value={undefined} onChange={onChange} showTime hour12={false} />,
    );
    openPicker(container);
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "14" },
    });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("5"));
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getDate()).toBe(5);
    expect(result.getHours()).toBe(14);
  });
});
