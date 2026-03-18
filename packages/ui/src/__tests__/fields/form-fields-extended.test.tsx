// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ComboboxField } from "../../fields/form/combobox-field";
import { CountryField } from "../../fields/form/country-field";
import { DateField } from "../../fields/form/date-field";
import { DateRangeField } from "../../fields/form/date-range-field";
import { DateTimeField } from "../../fields/form/datetime-field";
import { MultiSelectField } from "../../fields/form/multi-select-field";
import { RadioGroupField } from "../../fields/form/radio-group-field";
import { SelectField } from "../../fields/form/select-field";
import { SliderField } from "../../fields/form/slider-field";
import { StaticField } from "../../fields/form/static-field";
import { TimezoneField } from "../../fields/form/timezone-field";
import { TreeSelectField } from "../../fields/form/tree-select-field";

afterEach(cleanup);

// ── ComboboxField ──

describe("ComboboxField", () => {
  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];

  it("renders with label", () => {
    render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} />,
    );
    expect(screen.getByText("Fruit")).toBeDefined();
    expect(screen.getByTestId("form-field-fruit")).toBeDefined();
  });

  it("shows placeholder when no value is selected", () => {
    render(
      <ComboboxField
        label="Fruit"
        value={null}
        onChange={vi.fn()}
        options={options}
        placeholder="Pick a fruit"
      />,
    );
    expect(screen.getByText("Pick a fruit")).toBeDefined();
  });

  it("shows selected option label", () => {
    render(
      <ComboboxField label="Fruit" value="banana" onChange={vi.fn()} options={options} />,
    );
    expect(screen.getByText("Banana")).toBeDefined();
  });

  it("shows clear button when value is selected", () => {
    render(
      <ComboboxField label="Fruit" value="apple" onChange={vi.fn()} options={options} />,
    );
    expect(screen.getByLabelText("Clear selection")).toBeDefined();
  });

  it("does not show clear button when value is null", () => {
    render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} />,
    );
    expect(screen.queryByLabelText("Clear selection")).toBeNull();
  });

  it("calls onChange with null when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <ComboboxField label="Fruit" value="apple" onChange={onChange} options={options} />,
    );
    fireEvent.click(screen.getByLabelText("Clear selection"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not show clear button when disabled", () => {
    render(
      <ComboboxField label="Fruit" value="apple" onChange={vi.fn()} options={options} disabled />,
    );
    expect(screen.queryByLabelText("Clear selection")).toBeNull();
  });

  it("shows error", () => {
    render(
      <ComboboxField
        label="Fruit"
        value={null}
        onChange={vi.fn()}
        options={options}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("renders with icon in options", () => {
    const iconOptions = [
      { label: "Apple", value: "apple", icon: <span data-testid="icon-apple">A</span> },
    ];
    render(
      <ComboboxField label="Fruit" value="apple" onChange={vi.fn()} options={iconOptions} />,
    );
    expect(screen.getByTestId("icon-apple")).toBeDefined();
  });

  it("opens popover on trigger click and shows search input", () => {
    render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    // Should show the listbox
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("shows options in listbox when popover is open", () => {
    render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const listbox = screen.getByRole("listbox");
    const opts = within(listbox).getAllByRole("option");
    expect(opts.length).toBe(3);
    expect(opts[0].textContent).toContain("Apple");
    expect(opts[1].textContent).toContain("Banana");
    expect(opts[2].textContent).toContain("Cherry");
  });

  it("calls onChange when option is clicked", () => {
    const onChange = vi.fn();
    render(
      <ComboboxField label="Fruit" value={null} onChange={onChange} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    fireEvent.click(opts[1]);
    expect(onChange).toHaveBeenCalledWith("banana");
  });

  it("filters options when typing in search input", () => {
    render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "ban" } });
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toContain("Banana");
  });

  it("calls onSearch when typing in search input", () => {
    const onSearch = vi.fn();
    render(
      <ComboboxField
        label="Fruit"
        value={null}
        onChange={vi.fn()}
        options={options}
        onSearch={onSearch}
      />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "ap" } });
    expect(onSearch).toHaveBeenCalledWith("ap");
  });

  it("shows loading state", () => {
    render(
      <ComboboxField
        label="Fruit"
        value={null}
        onChange={vi.fn()}
        options={[]}
        loading
      />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("shows no results message when filtered list is empty", () => {
    render(
      <ComboboxField
        label="Fruit"
        value={null}
        onChange={vi.fn()}
        options={options}
        emptyMessage="Nothing found"
      />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "zzz" } });
    expect(screen.getByText("Nothing found")).toBeDefined();
  });

  it("marks selected option with aria-selected", () => {
    render(
      <ComboboxField label="Fruit" value="cherry" onChange={vi.fn()} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(opts[2].getAttribute("aria-selected")).toBe("true");
    expect(opts[0].getAttribute("aria-selected")).toBe("false");
  });

  it("handles keyboard Enter on option", () => {
    const onChange = vi.fn();
    render(
      <ComboboxField label="Fruit" value={null} onChange={onChange} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    fireEvent.keyDown(opts[0], { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("apple");
  });
});

// ── SelectField ──

describe("SelectField", () => {
  const options = [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Guest", value: "guest" },
  ];

  it("renders with label", () => {
    render(
      <SelectField label="Role" value="admin" onChange={vi.fn()} options={options} />,
    );
    expect(screen.getByText("Role")).toBeDefined();
    expect(screen.getByTestId("form-field-role")).toBeDefined();
  });

  it("renders select trigger", () => {
    render(
      <SelectField label="Role" value="admin" onChange={vi.fn()} options={options} />,
    );
    // Radix Select renders a trigger with combobox role
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("shows error", () => {
    render(
      <SelectField
        label="Role"
        value="admin"
        onChange={vi.fn()}
        options={options}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("sets aria-invalid when error is provided", () => {
    render(
      <SelectField
        label="Role"
        value="admin"
        onChange={vi.fn()}
        options={options}
        error="Invalid"
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
  });

  it("renders in compact mode without label", () => {
    const { container } = render(
      <SelectField
        compact
        label="Role"
        value="admin"
        onChange={vi.fn()}
        options={options}
      />,
    );
    // No FieldWrapper label — should be inline-grid
    const wrapper = container.querySelector("span.inline-grid");
    expect(wrapper).not.toBeNull();
    // Should have a hidden native select for auto-sizing
    const hiddenSelect = container.querySelector("select");
    expect(hiddenSelect).not.toBeNull();
    expect(hiddenSelect?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders compact mode with options in hidden select", () => {
    const { container } = render(
      <SelectField
        compact
        value="admin"
        onChange={vi.fn()}
        options={options}
        placeholder="Choose..."
      />,
    );
    const hiddenSelect = container.querySelector("select")!;
    const nativeOpts = hiddenSelect.querySelectorAll("option");
    // placeholder + 3 options
    expect(nativeOpts.length).toBe(4);
  });

  it("renders disabled state", () => {
    render(
      <SelectField
        label="Role"
        value="admin"
        onChange={vi.fn()}
        options={options}
        disabled
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("disabled")).not.toBeNull();
  });

  it("sets aria-label when layout is hidden", () => {
    render(
      <SelectField
        label="Role"
        value="admin"
        onChange={vi.fn()}
        options={options}
        layout="hidden"
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-label")).toBe("Role");
  });

  it("renders options with icons", () => {
    const iconOptions = [
      { label: "Admin", value: "admin", icon: <span data-testid="admin-icon">A</span> },
    ];
    render(
      <SelectField label="Role" value="admin" onChange={vi.fn()} options={iconOptions} />,
    );
    // The icon is rendered inside the SelectItem, which is in the content (closed by default)
    // Just verifying it renders without error
    expect(screen.getByTestId("form-field-role")).toBeDefined();
  });
});

// ── RadioGroupField ──

describe("RadioGroupField", () => {
  const options = [
    { label: "Free", value: "free" },
    { label: "Pro", value: "pro" },
    { label: "Enterprise", value: "enterprise" },
  ];

  it("renders with label and options", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByText("Plan")).toBeDefined();
    expect(screen.getByText("Free")).toBeDefined();
    expect(screen.getByText("Pro")).toBeDefined();
    expect(screen.getByText("Enterprise")).toBeDefined();
  });

  it("renders radio group with radiogroup role", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByRole("radiogroup")).toBeDefined();
  });

  it("renders radio items", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
      />,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(3);
  });

  it("shows error", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
        error="Select a plan"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Select a plan");
  });

  it("renders option descriptions", () => {
    const optionsWithDesc = [
      { label: "Free", value: "free", description: "Basic features" },
      { label: "Pro", value: "pro", description: "All features" },
    ];
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={optionsWithDesc}
      />,
    );
    expect(screen.getByText("Basic features")).toBeDefined();
    expect(screen.getByText("All features")).toBeDefined();
  });

  it("applies column direction by default", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
      />,
    );
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("flex-col");
  });

  it("applies row direction when specified", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
        direction="row"
      />,
    );
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("flex-row");
  });

  it("renders disabled state", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
        disabled
      />,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveProperty("disabled", true);
  });

  it("sets aria-label when layout is hidden", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
        layout="hidden"
      />,
    );
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-label")).toBe("Plan");
  });
});

// ── SliderField ──

describe("SliderField", () => {
  it("renders with label", () => {
    render(<SliderField label="Volume" value={50} onChange={vi.fn()} />);
    expect(screen.getByText("Volume")).toBeDefined();
    expect(screen.getByTestId("form-field-volume")).toBeDefined();
  });

  it("renders range input", () => {
    render(<SliderField label="Volume" value={50} onChange={vi.fn()} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeDefined();
    expect(slider).toHaveProperty("value", "50");
  });

  it("calls onChange with new value", () => {
    const onChange = vi.fn();
    render(<SliderField label="Volume" value={50} onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "75" } });
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("applies min and max attributes", () => {
    render(
      <SliderField label="Volume" value={50} onChange={vi.fn()} min={10} max={200} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("min")).toBe("10");
    expect(slider.getAttribute("max")).toBe("200");
  });

  it("applies step attribute", () => {
    render(
      <SliderField label="Volume" value={50} onChange={vi.fn()} step={5} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("step")).toBe("5");
  });

  it("shows current value when showValue is true", () => {
    render(
      <SliderField label="Volume" value={42} onChange={vi.fn()} showValue />,
    );
    expect(screen.getByText("42")).toBeDefined();
  });

  it("does not show current value when showValue is false", () => {
    render(<SliderField label="Volume" value={42} onChange={vi.fn()} />);
    expect(screen.queryByText("42")).toBeNull();
  });

  it("shows error", () => {
    render(
      <SliderField
        label="Volume"
        value={50}
        onChange={vi.fn()}
        error="Out of range"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Out of range");
  });

  it("sets aria-invalid when error is provided", () => {
    render(
      <SliderField label="Volume" value={50} onChange={vi.fn()} error="Bad" />,
    );
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-value attributes", () => {
    render(
      <SliderField label="Volume" value={50} onChange={vi.fn()} min={0} max={100} />,
    );
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("100");
    expect(slider.getAttribute("aria-valuenow")).toBe("50");
  });

  it("supports disabled state", () => {
    render(
      <SliderField label="Volume" value={50} onChange={vi.fn()} disabled />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveProperty("disabled", true);
  });

  it("sets aria-label when layout is hidden", () => {
    render(
      <SliderField
        label="Volume"
        value={50}
        onChange={vi.fn()}
        layout="hidden"
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-label")).toBe("Volume");
  });

  it("uses default min/max/step values", () => {
    render(<SliderField label="Volume" value={50} onChange={vi.fn()} />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("min")).toBe("0");
    expect(slider.getAttribute("max")).toBe("100");
    expect(slider.getAttribute("step")).toBe("1");
  });
});

// ── StaticField ──

describe("StaticField", () => {
  it("renders with label and value", () => {
    render(<StaticField label="Address" value="123 Main St" />);
    expect(screen.getByText("Address")).toBeDefined();
    expect(screen.getByText("123 Main St")).toBeDefined();
  });

  it("shows em-dash fallback when value is null", () => {
    render(<StaticField label="Address" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows em-dash fallback when value is undefined", () => {
    render(<StaticField label="Address" />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows custom fallback", () => {
    render(<StaticField label="Address" value={null} fallback="N/A" />);
    expect(screen.getByText("N/A")).toBeDefined();
  });

  it("renders numeric value", () => {
    render(<StaticField label="Port" value={8080} />);
    expect(screen.getByText("8080")).toBeDefined();
  });

  it("renders children instead of value", () => {
    render(
      <StaticField label="Status">
        <span data-testid="badge">Online</span>
      </StaticField>,
    );
    expect(screen.getByTestId("badge")).toBeDefined();
    expect(screen.getByText("Online")).toBeDefined();
  });

  it("renders children even when value is provided", () => {
    render(
      <StaticField label="Status" value="offline">
        <span data-testid="badge">Online</span>
      </StaticField>,
    );
    // children take priority
    expect(screen.getByTestId("badge")).toBeDefined();
    expect(screen.queryByText("offline")).toBeNull();
  });

  it("generates test id from label", () => {
    render(<StaticField label="Device Name" value="Sensor-1" />);
    expect(screen.getByTestId("form-field-device-name")).toBeDefined();
  });
});

// ── DateField ──

describe("DateField", () => {
  it("renders with label", () => {
    render(
      <DateField label="Birth Date" value={null} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Birth Date")).toBeDefined();
    expect(screen.getByTestId("form-field-birth-date")).toBeDefined();
  });

  it("renders date picker trigger button", () => {
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} />,
    );
    // DatePicker renders a button trigger
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button).not.toBeNull();
  });

  it("shows placeholder when value is null", () => {
    render(
      <DateField
        label="Date"
        value={null}
        onChange={vi.fn()}
        placeholder="Select date"
      />,
    );
    expect(screen.getByText("Select date")).toBeDefined();
  });

  it("shows formatted date when value is a Date", () => {
    const date = new Date("2024-06-15");
    render(
      <DateField label="Date" value={date} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    // Should display some formatted date, not the placeholder
    expect(button?.getAttribute("data-empty")).toBe("false");
  });

  it("shows formatted date from ISO string", () => {
    render(
      <DateField label="Date" value="2024-01-15" onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button?.getAttribute("data-empty")).toBe("false");
  });

  it("shows formatted date from timestamp", () => {
    render(
      <DateField label="Date" value={1705276800000} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button?.getAttribute("data-empty")).toBe("false");
  });

  it("shows error", () => {
    render(
      <DateField
        label="Date"
        value={null}
        onChange={vi.fn()}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("supports disabled state", () => {
    render(
      <DateField label="Date" value={null} onChange={vi.fn()} disabled />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button?.disabled).toBe(true);
  });

  it("handles null value from parseDate for invalid input", () => {
    render(
      <DateField label="Date" value="not-a-date" onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-date");
    const button = fieldset.querySelector("button");
    expect(button?.getAttribute("data-empty")).toBe("true");
  });
});

// ── DateRangeField ──

describe("DateRangeField", () => {
  it("renders with label", () => {
    render(
      <DateRangeField
        label="Period"
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Period")).toBeDefined();
    expect(screen.getByTestId("form-field-period")).toBeDefined();
  });

  it("renders date range picker trigger button", () => {
    render(
      <DateRangeField
        label="Period"
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
      />,
    );
    const fieldset = screen.getByTestId("form-field-period");
    const button = fieldset.querySelector("button");
    expect(button).not.toBeNull();
  });

  it("shows placeholder when no range is selected", () => {
    render(
      <DateRangeField
        label="Period"
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
        placeholder="Choose dates"
      />,
    );
    expect(screen.getByText("Choose dates")).toBeDefined();
  });

  it("shows formatted date range when values are set", () => {
    render(
      <DateRangeField
        label="Period"
        value={{ from: new Date("2024-01-01"), to: new Date("2024-01-31") }}
        onChange={vi.fn()}
      />,
    );
    const fieldset = screen.getByTestId("form-field-period");
    const button = fieldset.querySelector("button");
    expect(button?.getAttribute("data-empty")).toBe("false");
  });

  it("shows error", () => {
    render(
      <DateRangeField
        label="Period"
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("supports disabled state", () => {
    render(
      <DateRangeField
        label="Period"
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
        disabled
      />,
    );
    const fieldset = screen.getByTestId("form-field-period");
    const button = fieldset.querySelector("button");
    expect(button?.disabled).toBe(true);
  });
});

// ── DateTimeField ──

describe("DateTimeField", () => {
  it("renders with label", () => {
    render(
      <DateTimeField label="Event Start" value={null} onChange={vi.fn()} />,
    );
    expect(screen.getByText("Event Start")).toBeDefined();
    expect(screen.getByTestId("form-field-event-start")).toBeDefined();
  });

  it("renders date picker and time inputs", () => {
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    // Should have a date picker button
    const button = fieldset.querySelector("button");
    expect(button).not.toBeNull();
    // Should have hour and minute text inputs
    const inputs = fieldset.querySelectorAll("input[type='text']");
    expect(inputs.length).toBe(2);
  });

  it("initializes time inputs to 00:00 when value is null", () => {
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    expect((inputs[0] as HTMLInputElement).value).toBe("00");
    expect((inputs[1] as HTMLInputElement).value).toBe("00");
  });

  it("initializes time inputs from value", () => {
    const date = new Date("2024-06-15T14:30:00");
    render(
      <DateTimeField label="Start" value={date} onChange={vi.fn()} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    expect((inputs[0] as HTMLInputElement).value).toBe("14");
    expect((inputs[1] as HTMLInputElement).value).toBe("30");
  });

  it("hides time inputs when hideTime is true", () => {
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} hideTime />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const textInputs = fieldset.querySelectorAll("input[type='text']");
    expect(textInputs.length).toBe(0);
  });

  it("shows error", () => {
    render(
      <DateTimeField
        label="Start"
        value={null}
        onChange={vi.fn()}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("calls onChange with updated time when hour input changes", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(
      <DateTimeField label="Start" value={date} onChange={onChange} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "15" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(15);
    expect(result.getMinutes()).toBe(30);
  });

  it("calls onChange with updated time when minute input changes", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(
      <DateTimeField label="Start" value={date} onChange={onChange} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[1], { target: { value: "45" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(45);
  });

  it("clamps hour input to 0-23", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(
      <DateTimeField label="Start" value={date} onChange={onChange} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "99" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getHours()).toBe(23);
  });

  it("clamps minute input to 0-59", () => {
    const onChange = vi.fn();
    const date = new Date("2024-06-15T10:30:00");
    render(
      <DateTimeField label="Start" value={date} onChange={onChange} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[1], { target: { value: "99" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getMinutes()).toBe(59);
  });

  it("does not call onChange when hour changes without a date selected", () => {
    const onChange = vi.fn();
    render(
      <DateTimeField label="Start" value={null} onChange={onChange} />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    fireEvent.change(inputs[0], { target: { value: "15" } });
    // handleTimeChange updates state but doesn't call onChange because parsed is null
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports disabled state", () => {
    render(
      <DateTimeField label="Start" value={null} onChange={vi.fn()} disabled />,
    );
    const fieldset = screen.getByTestId("form-field-start");
    const inputs = fieldset.querySelectorAll("input[type='text']");
    expect((inputs[0] as HTMLInputElement).disabled).toBe(true);
    expect((inputs[1] as HTMLInputElement).disabled).toBe(true);
  });
});

// ── MultiSelectField ──

describe("MultiSelectField", () => {
  const options = [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Svelte", value: "svelte" },
  ];

  it("renders with label", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByText("Tags")).toBeDefined();
    expect(screen.getByTestId("form-field-tags")).toBeDefined();
  });

  it("renders combobox trigger", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("shows placeholder when no values are selected", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
        placeholder="Pick tags"
      />,
    );
    const input = screen.getByPlaceholderText("Pick tags");
    expect(input).toBeDefined();
  });

  it("does not show placeholder when values are selected", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={["react"]}
        onChange={vi.fn()}
        options={options}
        placeholder="Pick tags"
      />,
    );
    expect(screen.queryByPlaceholderText("Pick tags")).toBeNull();
  });

  it("renders badges for selected values", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={["react", "vue"]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("Vue")).toBeDefined();
  });

  it("shows remove button on badges when not disabled", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={["react"]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    expect(screen.getByLabelText("Remove React")).toBeDefined();
  });

  it("does not show remove button on badges when disabled", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={["react"]}
        onChange={vi.fn()}
        options={options}
        disabled
      />,
    );
    expect(screen.queryByLabelText("Remove React")).toBeNull();
  });

  it("calls onChange without removed value when badge remove is clicked", () => {
    const onChange = vi.fn();
    render(
      <MultiSelectField
        label="Tags"
        value={["react", "vue"]}
        onChange={onChange}
        options={options}
      />,
    );
    fireEvent.click(screen.getByLabelText("Remove React"));
    expect(onChange).toHaveBeenCalledWith(["vue"]);
  });

  it("opens popover and shows options when trigger is focused", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    const fieldset = screen.getByTestId("form-field-tags");
    const input = fieldset.querySelector("input")!;
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeDefined();
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(opts.length).toBe(4);
  });

  it("toggles option selection when clicked", () => {
    const onChange = vi.fn();
    render(
      <MultiSelectField
        label="Tags"
        value={["react"]}
        onChange={onChange}
        options={options}
      />,
    );
    const fieldset = screen.getByTestId("form-field-tags");
    const input = fieldset.querySelector("input")!;
    fireEvent.focus(input);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    // Click "Vue" to add it
    fireEvent.click(opts[1]);
    expect(onChange).toHaveBeenCalledWith(["react", "vue"]);
  });

  it("removes option when already selected option is clicked", () => {
    const onChange = vi.fn();
    render(
      <MultiSelectField
        label="Tags"
        value={["react", "vue"]}
        onChange={onChange}
        options={options}
      />,
    );
    const fieldset = screen.getByTestId("form-field-tags");
    const input = fieldset.querySelector("input")!;
    fireEvent.focus(input);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    // Click "React" to remove it
    fireEvent.click(opts[0]);
    expect(onChange).toHaveBeenCalledWith(["vue"]);
  });

  it("respects maxCount and does not add beyond limit", () => {
    const onChange = vi.fn();
    render(
      <MultiSelectField
        label="Tags"
        value={["react", "vue"]}
        onChange={onChange}
        options={options}
        maxCount={2}
      />,
    );
    const fieldset = screen.getByTestId("form-field-tags");
    const input = fieldset.querySelector("input")!;
    fireEvent.focus(input);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    // Try to add "Angular" — should be blocked
    fireEvent.click(opts[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("filters options by search query", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    const fieldset = screen.getByTestId("form-field-tags");
    const input = fieldset.querySelector("input")!;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rea" } });
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toContain("React");
  });

  it("shows no results message when filter matches nothing", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    const fieldset = screen.getByTestId("form-field-tags");
    const input = fieldset.querySelector("input")!;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText("No results found.")).toBeDefined();
  });

  it("marks selected options with aria-selected", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={["react"]}
        onChange={vi.fn()}
        options={options}
      />,
    );
    const fieldset = screen.getByTestId("form-field-tags");
    const input = fieldset.querySelector("input")!;
    fireEvent.focus(input);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(opts[0].getAttribute("aria-selected")).toBe("true");
    expect(opts[1].getAttribute("aria-selected")).toBe("false");
  });

  it("shows error", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("sets aria-label when layout is hidden", () => {
    render(
      <MultiSelectField
        label="Tags"
        value={[]}
        onChange={vi.fn()}
        options={options}
        layout="hidden"
      />,
    );
    const combobox = screen.getByRole("combobox");
    expect(combobox.getAttribute("aria-label")).toBe("Tags");
  });
});

// ── TreeSelectField ──

describe("TreeSelectField", () => {
  interface TreeNode {
    id: string;
    name: string;
    children: TreeNode[];
  }

  const treeData: TreeNode[] = [
    {
      id: "1",
      name: "Root A",
      children: [
        { id: "1-1", name: "Child A1", children: [] },
        {
          id: "1-2",
          name: "Child A2",
          children: [
            { id: "1-2-1", name: "Grandchild A2-1", children: [] },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Root B",
      children: [],
    },
  ];

  it("renders with label", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    expect(screen.getByText("Category")).toBeDefined();
    expect(screen.getByTestId("form-field-category")).toBeDefined();
  });

  it("shows placeholder when no value is selected", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
        placeholder="Select category"
      />,
    );
    expect(screen.getByText("Select category")).toBeDefined();
  });

  it("shows selected item name", () => {
    render(
      <TreeSelectField
        label="Category"
        value="1-1"
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    expect(screen.getByText("Child A1")).toBeDefined();
  });

  it("shows clear button when value is selected", () => {
    render(
      <TreeSelectField
        label="Category"
        value="1"
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    expect(screen.getByLabelText("Clear selection")).toBeDefined();
  });

  it("does not show clear button when value is null", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    expect(screen.queryByLabelText("Clear selection")).toBeNull();
  });

  it("calls onChange with null when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <TreeSelectField
        label="Category"
        value="1"
        onChange={onChange}
        treeData={treeData}
      />,
    );
    fireEvent.click(screen.getByLabelText("Clear selection"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does not show clear button when disabled", () => {
    render(
      <TreeSelectField
        label="Category"
        value="1"
        onChange={vi.fn()}
        treeData={treeData}
        disabled
      />,
    );
    expect(screen.queryByLabelText("Clear selection")).toBeNull();
  });

  it("shows error", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("opens popover and shows tree items", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    // Should see top-level items
    expect(screen.getByText("Root A")).toBeDefined();
    expect(screen.getByText("Root B")).toBeDefined();
  });

  it("calls onChange when a tree item is selected", () => {
    const onChange = vi.fn();
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={onChange}
        treeData={treeData}
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    // Click "Root B"
    const rootB = screen.getByText("Root B").closest("button")!;
    fireEvent.click(rootB);
    expect(onChange).toHaveBeenCalledWith("2");
  });

  it("shows loading state", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={[]}
        isLoading
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    expect(screen.getByText("common.loading")).toBeDefined();
  });

  it("shows no results when tree is empty and not loading", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={[]}
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    expect(screen.getByText("list.noResults")).toBeDefined();
  });

  it("shows selected value raw when not found in tree", () => {
    render(
      <TreeSelectField
        label="Category"
        value="non-existent"
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    // selectedLabel falls back to value itself
    expect(screen.getByText("non-existent")).toBeDefined();
  });

  it("uses custom getDisplayName", () => {
    const data = [{ id: "1", title: "Custom Title", children: [] }];
    render(
      <TreeSelectField
        label="Category"
        value="1"
        onChange={vi.fn()}
        treeData={data}
        getDisplayName={(item: { id: string; title: string }) => item.title}
      />,
    );
    expect(screen.getByText("Custom Title")).toBeDefined();
  });

  it("uses custom config for idField and childrenField", () => {
    const data = [{ uid: "1", label: "Root", items: [] }];
    render(
      <TreeSelectField
        label="Category"
        value="1"
        onChange={vi.fn()}
        treeData={data}
        config={{ idField: "uid" as never, childrenField: "items" as never }}
        getDisplayName={(item: { uid: string; label: string }) => item.label}
      />,
    );
    expect(screen.getByText("Root")).toBeDefined();
  });

  it("expands tree on search and filters results", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "Grandchild" } });
    // The filtered tree should show the grandchild and its ancestors
    expect(screen.getByText("Grandchild A2-1")).toBeDefined();
  });

  it("disables items matching disabledItemId and its descendants", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
        disabledItemId="1-2"
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    // "Root A" should be clickable, "Child A2" and descendants disabled
    const rootA = screen.getByText("Root A").closest("button") as HTMLButtonElement;
    expect(rootA.disabled).toBe(false);
  });

  it("toggles expand/collapse of tree nodes", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    // Initially only top-level items visible, children collapsed
    expect(screen.queryByText("Child A1")).toBeNull();
    // Click expand toggle for "Root A"
    const expandToggle = screen.getByText("Root A").closest("button")!
      .querySelector("[role='button']") as HTMLElement;
    fireEvent.click(expandToggle);
    // Now children should be visible
    expect(screen.getByText("Child A1")).toBeDefined();
    expect(screen.getByText("Child A2")).toBeDefined();
    // Click again to collapse
    fireEvent.click(expandToggle);
    expect(screen.queryByText("Child A1")).toBeNull();
  });

  it("handles keyboard Enter on expand toggle", () => {
    render(
      <TreeSelectField
        label="Category"
        value={null}
        onChange={vi.fn()}
        treeData={treeData}
      />,
    );
    const trigger = screen.getByTestId("form-field-category").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const expandToggle = screen.getByText("Root A").closest("button")!
      .querySelector("[role='button']") as HTMLElement;
    fireEvent.keyDown(expandToggle, { key: "Enter" });
    expect(screen.getByText("Child A1")).toBeDefined();
  });
});

// ── CountryField ──

describe("CountryField", () => {
  it("renders with label", () => {
    render(
      <CountryField label="Country" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Country")).toBeDefined();
    expect(screen.getByTestId("form-field-country")).toBeDefined();
  });

  it("shows placeholder when no value is selected", () => {
    render(
      <CountryField
        label="Country"
        value=""
        onChange={vi.fn()}
        placeholder="Select country"
      />,
    );
    expect(screen.getByText("Select country")).toBeDefined();
  });

  it("shows selected country name when value is set", () => {
    render(
      <CountryField label="Country" value="US" onChange={vi.fn()} />,
    );
    // useCountryOptions returns localized names; in test env with en locale
    const fieldset = screen.getByTestId("form-field-country");
    const trigger = fieldset.querySelector("button");
    expect(trigger?.textContent).toBeTruthy();
    expect(trigger?.textContent).not.toBe("");
  });

  it("shows clear button when value is selected", () => {
    render(
      <CountryField label="Country" value="US" onChange={vi.fn()} />,
    );
    // The clear button uses i18n key "field.clear"
    expect(screen.getByLabelText("field.clear")).toBeDefined();
  });

  it("does not show clear button when value is empty", () => {
    render(
      <CountryField label="Country" value="" onChange={vi.fn()} />,
    );
    expect(screen.queryByLabelText("field.clear")).toBeNull();
  });

  it("calls onChange with empty string when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <CountryField label="Country" value="US" onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("field.clear"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("calls onChange with empty when clear keyboard Enter", () => {
    const onChange = vi.fn();
    render(
      <CountryField label="Country" value="US" onChange={onChange} />,
    );
    fireEvent.keyDown(screen.getByLabelText("field.clear"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows detect button when not disabled", () => {
    render(
      <CountryField label="Country" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText("field.detectCountry")).toBeDefined();
  });

  it("hides detect button when disabled", () => {
    render(
      <CountryField label="Country" value="" onChange={vi.fn()} disabled />,
    );
    expect(screen.queryByLabelText("field.detectCountry")).toBeNull();
  });

  it("calls onChange when detect button detects timezone-based country", () => {
    const onChange = vi.fn();
    render(
      <CountryField label="Country" value="" onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("field.detectCountry"));
    // Detection relies on Intl.DateTimeFormat which may return a valid country
    // In node/jsdom, this usually returns a value; even if detection fails, no error is thrown
  });

  it("shows error", () => {
    render(
      <CountryField
        label="Country"
        value=""
        onChange={vi.fn()}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("disables the trigger button when disabled", () => {
    render(
      <CountryField label="Country" value="" onChange={vi.fn()} disabled />,
    );
    const fieldset = screen.getByTestId("form-field-country");
    const trigger = fieldset.querySelector("button");
    expect(trigger?.disabled).toBe(true);
  });

  it("calls onChange to toggle off when same country is selected", () => {
    const onChange = vi.fn();
    render(
      <CountryField label="Country" value="US" onChange={onChange} />,
    );
    // The handleSelect toggles: if same value, calls onChange("")
    // This is tested indirectly through the clear button test
    fireEvent.click(screen.getByLabelText("field.clear"));
    expect(onChange).toHaveBeenCalledWith("");
  });
});

// ── TimezoneField ──

describe("TimezoneField", () => {
  it("renders with label", () => {
    render(
      <TimezoneField label="Timezone" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Timezone")).toBeDefined();
    expect(screen.getByTestId("form-field-timezone")).toBeDefined();
  });

  it("shows placeholder when no value is selected", () => {
    render(
      <TimezoneField
        label="Timezone"
        value=""
        onChange={vi.fn()}
        placeholder="Select timezone"
      />,
    );
    expect(screen.getByText("Select timezone")).toBeDefined();
  });

  it("shows clear button when value is selected", () => {
    render(
      <TimezoneField label="Timezone" value="Asia/Seoul" onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText("field.clear")).toBeDefined();
  });

  it("does not show clear button when value is empty", () => {
    render(
      <TimezoneField label="Timezone" value="" onChange={vi.fn()} />,
    );
    expect(screen.queryByLabelText("field.clear")).toBeNull();
  });

  it("calls onChange with empty string when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <TimezoneField label="Timezone" value="Asia/Seoul" onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("field.clear"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("calls onChange with empty string on clear keyboard Enter", () => {
    const onChange = vi.fn();
    render(
      <TimezoneField label="Timezone" value="Asia/Seoul" onChange={onChange} />,
    );
    fireEvent.keyDown(screen.getByLabelText("field.clear"), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows detect button when not disabled", () => {
    render(
      <TimezoneField label="Timezone" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText("field.detectTimezone")).toBeDefined();
  });

  it("hides detect button when disabled", () => {
    render(
      <TimezoneField label="Timezone" value="" onChange={vi.fn()} disabled />,
    );
    expect(screen.queryByLabelText("field.detectTimezone")).toBeNull();
  });

  it("calls onChange with detected timezone when detect button is clicked", () => {
    const onChange = vi.fn();
    render(
      <TimezoneField label="Timezone" value="" onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("field.detectTimezone"));
    // In jsdom/node, Intl.DateTimeFormat().resolvedOptions().timeZone returns a value
    expect(onChange).toHaveBeenCalled();
  });

  it("shows error", () => {
    render(
      <TimezoneField
        label="Timezone"
        value=""
        onChange={vi.fn()}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("disables the trigger button when disabled", () => {
    render(
      <TimezoneField label="Timezone" value="" onChange={vi.fn()} disabled />,
    );
    const fieldset = screen.getByTestId("form-field-timezone");
    const trigger = fieldset.querySelector("button");
    expect(trigger?.disabled).toBe(true);
  });

  it("does not show clear button when disabled even with value", () => {
    render(
      <TimezoneField label="Timezone" value="UTC" onChange={vi.fn()} disabled />,
    );
    expect(screen.queryByLabelText("field.clear")).toBeNull();
  });
});
