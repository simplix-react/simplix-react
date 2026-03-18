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

vi.mock("../../utils/use-timezone-options", () => ({
  useTimezoneOptions: () => ({
    groups: new Map([
      [
        "Americas",
        [
          { value: "America/New_York", label: "New York (UTC-5)", localizedName: "Eastern Time" },
          { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)", localizedName: "Pacific Time" },
        ],
      ],
      [
        "Asia",
        [
          { value: "Asia/Seoul", label: "Seoul (UTC+9)", localizedName: "Korean Standard Time" },
        ],
      ],
    ]),
  }),
}));

import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { TimezoneFormField } from "../../crud/filters/timezone-form-field";

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

describe("TimezoneFormField", () => {
  it("renders label", () => {
    const state = createMockState();
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    expect(screen.getByText("Timezone")).toBeTruthy();
  });

  it("renders timezone options grouped by region", () => {
    const state = createMockState();
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    expect(screen.getByText("Americas")).toBeTruthy();
    expect(screen.getByText("Asia")).toBeTruthy();
    expect(screen.getByText("New York (UTC-5)")).toBeTruthy();
    expect(screen.getByText("Seoul (UTC+9)")).toBeTruthy();
  });

  it("shows localized name when different from value", () => {
    const state = createMockState();
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    expect(screen.getByText("Eastern Time")).toBeTruthy();
    expect(screen.getByText("Korean Standard Time")).toBeTruthy();
  });

  it("selects timezone when clicked", () => {
    const state = createMockState();
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    fireEvent.click(screen.getByText("New York (UTC-5)"));
    expect(state.setValue).toHaveBeenCalledWith("timezone.in", ["America/New_York"]);
  });

  it("deselects timezone when already selected", () => {
    const state = createMockState({ "timezone.in": ["America/New_York"] });
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    fireEvent.click(screen.getByText("New York (UTC-5)"));
    expect(state.setValue).toHaveBeenCalledWith("timezone.in", undefined);
  });

  it("shows clear button when values are selected", () => {
    const state = createMockState({ "timezone.in": ["Asia/Seoul"] });
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    expect(screen.getByLabelText("Clear Timezone")).toBeTruthy();
  });

  it("hides clear button when no values selected", () => {
    const state = createMockState();
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    expect(screen.queryByLabelText("Clear Timezone")).toBeNull();
  });

  it("clears values when clear button is clicked", () => {
    const state = createMockState({ "timezone.in": ["Asia/Seoul"] });
    render(<TimezoneFormField field="timezone" label="Timezone" state={state} />);
    fireEvent.click(screen.getByLabelText("Clear Timezone"));
    expect(state.setValue).toHaveBeenCalledWith("timezone.in", undefined);
  });

  it("applies custom className", () => {
    const state = createMockState();
    const { container } = render(
      <TimezoneFormField field="timezone" label="Timezone" state={state} className="my-tz" />,
    );
    expect(container.firstElementChild?.className).toContain("my-tz");
  });
});
