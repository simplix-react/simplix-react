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

import { TimePicker } from "../../base/inputs/time-picker";

afterEach(cleanup);

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

describe("TimePicker", () => {
  it("renders hour/minute inputs and meridiem toggle", () => {
    render(<TimePicker value={{ hours: 15, minutes: 5 }} onChange={vi.fn()} />);

    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("03");
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).value).toBe("05");
    expect(screen.getByRole("button", { name: "date.pm" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("defaults to 00:00 without a value", () => {
    render(<TimePicker value={undefined} onChange={vi.fn()} hour12={false} />);
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).value).toBe("00");
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).value).toBe("00");
  });

  it("emits the new time when typing", () => {
    const onChange = vi.fn();
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={onChange} hour12={false} />);
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "14" },
    });
    expect(onChange).toHaveBeenCalledWith({ hours: 14, minutes: 30 });
  });

  it("emits even without an initial value", () => {
    const onChange = vi.fn();
    render(<TimePicker value={undefined} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "date.hour +" }));
    // 00:00 displays as 12 AM; +1 wraps the 12-hour display to 1 AM
    expect(onChange).toHaveBeenCalledWith({ hours: 1, minutes: 0 });
  });

  it("opens the option list on focus and commits a click", () => {
    const onChange = vi.fn();
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={onChange} />);

    fireEvent.click(within(openColumn("date.hour")).getByText("date.pm 03"));
    expect(onChange).toHaveBeenCalledWith({ hours: 15, minutes: 30 });

    fireEvent.click(within(openColumn("date.minute")).getByText("45"));
    expect(onChange).toHaveBeenCalledWith({ hours: 10, minutes: 45 });
  });

  it("switches meridiem with the toggle", () => {
    const onChange = vi.fn();
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "date.pm" }));
    expect(onChange).toHaveBeenCalledWith({ hours: 22, minutes: 30 });
  });

  it("hides the meridiem toggle in 24-hour mode", () => {
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={vi.fn()} hour12={false} />);
    expect(screen.queryByRole("button", { name: "date.am" })).toBeNull();
  });

  it("respects minuteStep in the option list", () => {
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={vi.fn()} minuteStep={15} />);
    const minuteButtons = within(openColumn("date.minute")).getAllByRole("button");
    expect(minuteButtons.map((b) => b.textContent)).toEqual(["00", "15", "30", "45"]);
  });

  it("disables out-of-range options and clamps commits", () => {
    const onChange = vi.fn();
    render(
      <TimePicker
        value={{ hours: 12, minutes: 0 }}
        onChange={onChange}
        hour12={false}
        minTime={{ hours: 9, minutes: 30 }}
        maxTime={{ hours: 18, minutes: 15 }}
      />,
    );

    const hourColumn = openColumn("date.hour");
    expect((within(hourColumn).getByText("08") as HTMLButtonElement).disabled).toBe(true);
    expect((within(hourColumn).getByText("09") as HTMLButtonElement).disabled).toBe(false);
    expect((within(hourColumn).getByText("19") as HTMLButtonElement).disabled).toBe(true);

    // Typing an out-of-range hour clamps to the bound
    fireEvent.change(screen.getByRole("textbox", { name: "date.hour" }), {
      target: { value: "20" },
    });
    expect(onChange).toHaveBeenCalledWith({ hours: 18, minutes: 15 });
  });

  it("supports disabled state", () => {
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={vi.fn()} disabled />);
    expect((screen.getByRole("textbox", { name: "date.hour" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("textbox", { name: "date.minute" }) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "date.am" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "date.hour +" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("stays open when a pointer interaction inside blurs the input (scrollbar drag)", () => {
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={vi.fn()} />);
    const column = openColumn("date.hour");

    // Dragging the list's scrollbar: pointer goes down inside the wrapper,
    // which blurs the input with no related target
    fireEvent.pointerDown(column);
    fireEvent.blur(screen.getByRole("textbox", { name: "date.hour" }));

    expect(getColumn("date.hour")).toBeDefined();
  });

  it("stays open when a scrollbar mousedown (no pointer event) blurs the input", () => {
    render(<TimePicker value={{ hours: 10, minutes: 30 }} onChange={vi.fn()} />);
    const column = openColumn("date.hour");

    // Chrome fires only mousedown (no pointerdown) for native scrollbar grabs
    fireEvent.mouseDown(column);
    fireEvent.blur(screen.getByRole("textbox", { name: "date.hour" }));

    expect(getColumn("date.hour")).toBeDefined();
  });

  it("closes on pointer down outside", () => {
    render(
      <div>
        <TimePicker value={{ hours: 10, minutes: 30 }} onChange={vi.fn()} />
        <span data-testid="outside">out</span>
      </div>,
    );
    openColumn("date.hour");
    fireEvent.pointerDown(screen.getByTestId("outside"));
    expect(screen.getAllByLabelText("date.hour").every((el) => el.tagName !== "DIV")).toBe(true);
  });

  it("closes the option list when focus leaves", () => {
    render(
      <div>
        <TimePicker value={{ hours: 10, minutes: 30 }} onChange={vi.fn()} />
        <button type="button">outside</button>
      </div>,
    );
    openColumn("date.hour");
    fireEvent.blur(screen.getByRole("textbox", { name: "date.hour" }), {
      relatedTarget: screen.getByRole("button", { name: "outside" }),
    });
    expect(screen.getAllByLabelText("date.hour").every((el) => el.tagName !== "DIV")).toBe(true);
  });
});
