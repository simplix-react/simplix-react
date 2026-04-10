// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ComboboxField } from "../../fields/form/combobox-field";

afterEach(cleanup);

describe("ComboboxField — serverSearch prop", () => {
  const options = [
    { label: "Alpha", value: "alpha" },
    { label: "Beta", value: "beta" },
  ];

  // C1: prop accepted by interface without error
  it("renders with serverSearch=true without error", () => {
    render(
      <ComboboxField
        label="Test"
        value={null}
        onChange={() => {}}
        options={options}
        serverSearch
      />,
    );
  });

  // C2: server mode bypasses local filter
  it("skips local filtering when serverSearch=true", () => {
    const onSearch = vi.fn();
    render(
      <ComboboxField
        label="Test"
        value={null}
        onChange={() => {}}
        options={options}
        onSearch={onSearch}
        serverSearch
      />,
    );
    const trigger = screen.getByTestId("form-field-test").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    // Type "alp" — normally only "Alpha" would pass local filter
    fireEvent.change(searchInput, { target: { value: "alp" } });
    // All options should still be visible (server mode bypasses local filter)
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(opts).toHaveLength(2);
  });

  // C3: clear calls onSearch("") in server mode
  it("calls onSearch with empty string on clear when serverSearch=true", () => {
    const onSearch = vi.fn();
    const onChange = vi.fn();
    render(
      <ComboboxField
        label="Test"
        value="alpha"
        onChange={onChange}
        options={options}
        onSearch={onSearch}
        serverSearch
      />,
    );
    const clearBtn = screen.getByRole("button", { name: "Clear selection" });
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(onSearch).toHaveBeenCalledWith("");
  });

  // C4a: backward compat — local filter still works without serverSearch
  it("still applies local filtering when serverSearch is not set", () => {
    render(
      <ComboboxField
        label="Test"
        value={null}
        onChange={() => {}}
        options={options}
      />,
    );
    const trigger = screen.getByTestId("form-field-test").querySelector("span[class]")!;
    fireEvent.click(trigger);
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "alp" } });
    const opts = within(screen.getByRole("listbox")).getAllByRole("option");
    // Only "Alpha" should pass local filter
    expect(opts).toHaveLength(1);
    expect(opts[0].textContent).toContain("Alpha");
  });

  // C4b: backward compat — onSearch NOT called on clear without serverSearch
  it("does not call onSearch on clear when serverSearch is not set", () => {
    const onSearch = vi.fn();
    const onChange = vi.fn();
    render(
      <ComboboxField
        label="Test"
        value="alpha"
        onChange={onChange}
        options={options}
        onSearch={onSearch}
      />,
    );
    const clearBtn = screen.getByRole("button", { name: "Clear selection" });
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(onSearch).not.toHaveBeenCalled();
  });
});
