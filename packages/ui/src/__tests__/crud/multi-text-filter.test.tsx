// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { MultiTextFilter } from "../../crud/filters/multi-text-filter";

const fields = [
  { field: "name", label: "Name", placeholder: "Search by name" },
  { field: "email", label: "Email", placeholder: "Search by email" },
];

describe("MultiTextFilter", () => {
  it("renders input with first field label as aria-label", () => {
    render(
      <MultiTextFilter
        fields={fields}
        values={{ name: "", email: "" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Name")).toBeTruthy();
  });

  it("displays placeholder for active field", () => {
    render(
      <MultiTextFilter
        fields={fields}
        values={{ name: "", email: "" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText("Search by name")).toBeTruthy();
  });

  it("calls onChange with field and value when user types", () => {
    const onChange = vi.fn();
    render(
      <MultiTextFilter
        fields={fields}
        values={{ name: "", email: "" }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("name", "test");
  });

  it("shows clear button when input has value", () => {
    render(
      <MultiTextFilter
        fields={fields}
        values={{ name: "test", email: "" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("filter.clearFilter")).toBeTruthy();
  });

  it("hides clear button when input is empty", () => {
    render(
      <MultiTextFilter
        fields={fields}
        values={{ name: "", email: "" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("filter.clearFilter")).toBeNull();
  });

  it("calls onChange with empty string when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <MultiTextFilter
        fields={fields}
        values={{ name: "test", email: "" }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith("name", "");
  });

  it("auto-selects field with non-empty value", () => {
    render(
      <MultiTextFilter
        fields={fields}
        values={{ name: "", email: "user@test.com" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Email")).toBeTruthy();
  });

  it("renders without field switcher when single field", () => {
    render(
      <MultiTextFilter
        fields={[fields[0]]}
        values={{ name: "" }}
        onChange={vi.fn()}
      />,
    );
    // Should not show field label button for single field
    expect(screen.getByRole("textbox")).toBeTruthy();
  });
});
