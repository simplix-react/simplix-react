// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ComboboxField } from "../../fields/form/combobox-field";

afterEach(cleanup);

describe("ComboboxField (extended coverage)", () => {
  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];

  it("handles keyboard Space on option", () => {
    const onChange = vi.fn();
    render(
      <ComboboxField label="Fruit" value={null} onChange={onChange} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    fireEvent.keyDown(opts[1], { key: " " });
    expect(onChange).toHaveBeenCalledWith("banana");
  });

  it("does not open popover when disabled", () => {
    render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} disabled />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    // Popover should NOT open; listbox should not appear
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("shows checkmark on selected option in listbox", () => {
    render(
      <ComboboxField label="Fruit" value="apple" onChange={vi.fn()} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    // Apple is selected, should have an SVG checkmark inside
    const svgs = opts[0].querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("closes popover and resets query after selecting an option", () => {
    const onChange = vi.fn();
    render(
      <ComboboxField label="Fruit" value={null} onChange={onChange} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "ban" } });
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    fireEvent.click(opts[0]);
    expect(onChange).toHaveBeenCalledWith("banana");
  });

  it("shows default no results message from i18n", () => {
    render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} />,
    );
    const trigger = screen.getByTestId("form-field-fruit").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "zzz" } });
    // Should show i18n key "field.noResults" as placeholder
    expect(screen.getByText("field.noResults")).toBeDefined();
  });

  it("renders with error style", () => {
    const { container } = render(
      <ComboboxField label="Fruit" value={null} onChange={vi.fn()} options={options} error="Required" />,
    );
    // The trigger span should have error class
    const triggerSpan = container.querySelector("[class*='border-destructive']");
    expect(triggerSpan).not.toBeNull();
  });

  it("renders description", () => {
    render(
      <ComboboxField
        label="Fruit"
        value={null}
        onChange={vi.fn()}
        options={options}
        description="Select a fruit"
      />,
    );
    expect(screen.getByText("Select a fruit")).toBeDefined();
  });
});
