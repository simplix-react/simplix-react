// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

vi.mock("../../crud/shared/column-context", () => ({
  useCrudListColumns: () => null,
}));

import { FilterBar, type FilterDef } from "../../crud/filters/filter-bar";
import { useFilterBarState } from "../../crud/filters/use-filter-bar-state";

const filters: FilterDef[] = [
  { type: "toggle", field: "active", label: "Active" },
  { type: "toggle", field: "locked", label: "Locked" },
];

function Harness({ defaults }: { defaults?: Record<string, unknown> }) {
  const state = useFilterBarState({ defaultFilters: defaults });
  return (
    <div>
      <input aria-label="keyword" value={state.search} onChange={(e) => state.setSearch(e.target.value)} />
      <output data-testid="committed">{JSON.stringify(state.committedValues)}</output>
      <FilterBar filters={filters} state={state} />
    </div>
  );
}

const committed = () => JSON.parse(screen.getByTestId("committed").textContent ?? "{}") as Record<string, unknown>;

describe("FilterBar clear-all button", () => {
  it("is absent while no filter is active", () => {
    render(<Harness />);
    expect(screen.queryByLabelText("filter.clearAll")).toBeNull();
  });

  it("shows while a filter is active and removes every filter on click", () => {
    render(<Harness defaults={{ "active.equals": true, "locked.equals": true }} />);
    const button = screen.getByLabelText("filter.clearAll");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("title")).toBe("filter.clearAll");
    expect(screen.getByLabelText("filter.label").textContent).toContain("2");

    fireEvent.click(button);

    expect(committed()).toEqual({});
    expect(screen.queryByLabelText("filter.clearAll")).toBeNull();
    expect(screen.getByLabelText("filter.label").textContent).not.toMatch(/\d/);
  });

  it("keeps the keyword search text", () => {
    render(<Harness defaults={{ "active.equals": true }} />);
    fireEvent.change(screen.getByLabelText("keyword"), { target: { value: "alpha" } });

    fireEvent.click(screen.getByLabelText("filter.clearAll"));

    expect((screen.getByLabelText("keyword") as HTMLInputElement).value).toBe("alpha");
    expect(committed()).toEqual({});
  });

  it("is keyboard operable: a button reached by Tab fires on click activation", () => {
    render(<Harness defaults={{ "active.equals": true }} />);
    const button = screen.getByLabelText("filter.clearAll") as HTMLButtonElement;
    act(() => button.focus());
    expect(document.activeElement).toBe(button);
    expect(button.tabIndex).toBeGreaterThanOrEqual(0);
  });
});
