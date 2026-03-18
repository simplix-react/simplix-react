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

vi.mock("../../utils/use-country-options", () => ({
  useCountryOptions: () => [
    {
      code: "US",
      localName: "United States",
      englishName: "United States",
      Flag: ({ className }: { className?: string }) => <span className={className}>US-flag</span>,
    },
    {
      code: "KR",
      localName: "South Korea",
      englishName: "South Korea",
      Flag: ({ className }: { className?: string }) => <span className={className}>KR-flag</span>,
    },
    {
      code: "JP",
      localName: "Japan",
      englishName: "Japan",
      Flag: ({ className }: { className?: string }) => <span className={className}>JP-flag</span>,
    },
  ],
}));

import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { CountryFormField } from "../../crud/filters/country-form-field";

function createMockState(values: Record<string, unknown> = {}): CrudListFilters {
  return {
    search: "",
    values,
    committedValues: values,
    setSearch: vi.fn(),
    setValue: vi.fn(),
    setValues: vi.fn(),
    commitValue: vi.fn(),
    commitValues: vi.fn(),
    setAll: vi.fn(),
    clear: vi.fn(),
    apply: vi.fn(),
    isPending: false,
  };
}

describe("CountryFormField", () => {
  it("renders label", () => {
    const state = createMockState();
    render(<CountryFormField field="country" label="Country" state={state} />);
    expect(screen.getByText("Country")).toBeTruthy();
  });

  it("renders country options", () => {
    const state = createMockState();
    render(<CountryFormField field="country" label="Country" state={state} />);
    expect(screen.getByText("United States")).toBeTruthy();
    expect(screen.getByText("South Korea")).toBeTruthy();
    expect(screen.getByText("Japan")).toBeTruthy();
  });

  it("renders flag icons", () => {
    const state = createMockState();
    render(<CountryFormField field="country" label="Country" state={state} />);
    expect(screen.getByText("US-flag")).toBeTruthy();
  });

  it("selects country when clicked", () => {
    const state = createMockState();
    render(<CountryFormField field="country" label="Country" state={state} />);
    // Click the US option (CommandItem)
    fireEvent.click(screen.getByText("United States"));
    expect(state.setValue).toHaveBeenCalledWith("country.in", ["US"]);
  });

  it("deselects country when already selected", () => {
    const state = createMockState({ "country.in": ["US"] });
    render(<CountryFormField field="country" label="Country" state={state} />);
    fireEvent.click(screen.getByText("United States"));
    expect(state.setValue).toHaveBeenCalledWith("country.in", undefined);
  });

  it("shows clear button when values are selected", () => {
    const state = createMockState({ "country.in": ["US", "KR"] });
    render(<CountryFormField field="country" label="Country" state={state} />);
    expect(screen.getByLabelText("Clear Country")).toBeTruthy();
  });

  it("hides clear button when no values selected", () => {
    const state = createMockState();
    render(<CountryFormField field="country" label="Country" state={state} />);
    expect(screen.queryByLabelText("Clear Country")).toBeNull();
  });

  it("clears values when clear button is clicked", () => {
    const state = createMockState({ "country.in": ["US"] });
    render(<CountryFormField field="country" label="Country" state={state} />);
    fireEvent.click(screen.getByLabelText("Clear Country"));
    expect(state.setValue).toHaveBeenCalledWith("country.in", undefined);
  });

  it("applies custom className", () => {
    const state = createMockState();
    const { container } = render(
      <CountryFormField field="country" label="Country" state={state} className="my-field" />,
    );
    expect(container.firstElementChild?.className).toContain("my-field");
  });
});
