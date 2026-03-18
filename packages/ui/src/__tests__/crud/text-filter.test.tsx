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

import { TextFilter } from "../../crud/filters/text-filter";

describe("TextFilter", () => {
  it("renders with label as aria-label", () => {
    render(
      <TextFilter label="Search pets" value="" onChange={vi.fn()} />,
    );
    const input = screen.getByLabelText("Search pets");
    expect(input).toBeTruthy();
  });

  it("displays current value", () => {
    render(
      <TextFilter label="Search" value="hello" onChange={vi.fn()} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(
      <TextFilter label="Search" value="" onChange={onChange} />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("shows clear button when value is non-empty", () => {
    render(
      <TextFilter label="Search" value="test" onChange={vi.fn()} />,
    );
    const clearBtn = screen.getByLabelText("filter.clearFilter");
    expect(clearBtn).toBeTruthy();
  });

  it("does not show clear button when value is empty", () => {
    render(
      <TextFilter label="Search" value="" onChange={vi.fn()} />,
    );
    expect(screen.queryByLabelText("filter.clearFilter")).toBeNull();
  });

  it("calls onChange with empty string when clear is clicked", () => {
    const onChange = vi.fn();
    render(
      <TextFilter label="Search" value="test" onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("filter.clearFilter"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("uses custom placeholder", () => {
    render(
      <TextFilter
        label="Search"
        value=""
        onChange={vi.fn()}
        placeholder="Type to filter..."
      />,
    );
    expect(screen.getByPlaceholderText("Type to filter...")).toBeTruthy();
  });

  it("uses label as fallback placeholder", () => {
    render(
      <TextFilter label="Filter items" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByPlaceholderText("Filter items")).toBeTruthy();
  });
});
