// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

// The list's measured width: wide by default, narrow where a test needs the responsive fallback.
const width = vi.hoisted(() => ({ value: 1200 }));
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => width.value,
}));

import { FilterBar } from "../../crud/filters/filter-bar";
import { useFilterBarState } from "../../crud/filters/use-filter-bar-state";
import { CARD_GRID_TEMPLATE, CrudList, type ListProps } from "../../crud/list/crud-list";

interface Item {
  id: number;
  name: string;
  status: string;
}

const items: Item[] = [
  { id: 1, name: "Alice", status: "active" },
  { id: 2, name: "Bob", status: "inactive" },
  { id: 3, name: "Charlie", status: "active" },
];

const grid = () => document.querySelector("[data-testid='list-card-grid']") as HTMLElement | null;
const toggle = () => screen.queryByLabelText("list.viewGrid");

interface HarnessProps extends Pick<ListProps, "defaultViewMode" | "onViewModeChange"> {
  gridView?: boolean;
  withCards?: boolean;
  cardBreakpoint?: number;
  isLoading?: boolean;
  data?: Item[];
  groupBy?: boolean;
  /** Draws the toggle on its own instead of through the filter bar. */
  standaloneToggle?: boolean;
}

function Harness({ defaultViewMode, onViewModeChange, gridView, withCards = true, cardBreakpoint, isLoading, data = items, groupBy, standaloneToggle }: HarnessProps) {
  const state = useFilterBarState({});
  return (
    <CrudList defaultViewMode={defaultViewMode} onViewModeChange={onViewModeChange}>
      {standaloneToggle ? <CrudList.ViewToggle /> : <FilterBar filters={[]} state={state} />}
      <CrudList.Table<Item>
        data={data}
        isLoading={isLoading}
        gridView={gridView}
        cardBreakpoint={cardBreakpoint}
        rowId={(row) => String(row.id)}
        groupBy={groupBy ? { of: (row: Item) => row.status } : undefined}
        cardTitle={withCards ? ({ row }) => <span>{row.name}</span> : undefined}
        cardContent={withCards ? ({ row }) => <span>{`state ${row.status}`}</span> : undefined}
      >
        <CrudList.Column<Item> field="name" header="Name" />
      </CrudList.Table>
    </CrudList>
  );
}

beforeEach(() => {
  width.value = 1200;
});

describe("CrudList view mode", () => {
  it("draws the table by default and offers no toggle without gridView", () => {
    render(<Harness />);
    expect(document.querySelector("table")).not.toBeNull();
    expect(grid()).toBeNull();
    expect(toggle()).toBeNull();
  });

  it("opens in grid view when defaultViewMode is grid, with every row a card in the fit grid", () => {
    render(<Harness defaultViewMode="grid" />);
    expect(document.querySelector("table")).toBeNull();
    const cards = grid();
    expect(cards).not.toBeNull();
    expect(cards!.style.gridTemplateColumns).toBe(CARD_GRID_TEMPLATE);
    expect(cards!.querySelectorAll("[data-testid^='list-row-']").length).toBe(items.length);
  });

  it("draws the fit grid from the card minimum width token, falling back to a stated default", () => {
    expect(CARD_GRID_TEMPLATE).toContain("minmax(min(100%, var(--card-min-width, 20rem)), 1fr)");
    expect(CARD_GRID_TEMPLATE.startsWith("repeat(auto-fill,")).toBe(true);
  });

  it("offers no toggle when grid is only the default, so the default is the one view", () => {
    render(<Harness defaultViewMode="grid" />);
    expect(toggle()).toBeNull();
  });

  it("offers the toggle with gridView and opens in grid view through it", () => {
    render(<Harness defaultViewMode="grid" gridView />);
    expect(toggle()).not.toBeNull();
    expect(toggle()!.getAttribute("aria-pressed")).toBe("true");
    expect(grid()).not.toBeNull();
  });

  it("still opens as a table with gridView alone, and the toggle switches to the grid", () => {
    render(<Harness gridView />);
    expect(document.querySelector("table")).not.toBeNull();
    fireEvent.click(toggle()!);
    expect(grid()).not.toBeNull();
    expect(document.querySelector("table")).toBeNull();
  });

  it("tells the caller which view the reader switched to, and not for a press on the view already shown", () => {
    const onViewModeChange = vi.fn();
    render(<Harness defaultViewMode="grid" gridView onViewModeChange={onViewModeChange} />);
    fireEvent.click(toggle()!);
    expect(onViewModeChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("list.viewList"));
    expect(onViewModeChange).toHaveBeenCalledExactlyOnceWith("list");
    expect(document.querySelector("table")).not.toBeNull();
    fireEvent.click(toggle()!);
    expect(onViewModeChange).toHaveBeenLastCalledWith("grid");
  });

  it("draws the toggle on its own, outside the filter bar, and it switches the view", () => {
    render(<Harness gridView standaloneToggle />);
    expect(screen.queryByLabelText("filter.label")).toBeNull();
    expect(screen.getByLabelText("list.viewMode")).not.toBeNull();
    fireEvent.click(toggle()!);
    expect(grid()).not.toBeNull();
  });

  it("draws no standalone toggle for a table without gridView", () => {
    render(<Harness standaloneToggle />);
    expect(screen.queryByLabelText("list.viewMode")).toBeNull();
  });

  it("keeps the table when the table declares no card slots", () => {
    render(<Harness defaultViewMode="grid" withCards={false} />);
    expect(document.querySelector("table")).not.toBeNull();
    expect(grid()).toBeNull();
  });

  it("does not move when defaultViewMode changes after the first render", () => {
    const { rerender } = render(<Harness defaultViewMode="list" />);
    rerender(<Harness defaultViewMode="grid" />);
    expect(document.querySelector("table")).not.toBeNull();
    expect(grid()).toBeNull();
  });

  it("keeps the responsive fallback as one stacked column, not the grid", () => {
    width.value = 400;
    render(<Harness cardBreakpoint={600} />);
    expect(document.querySelector("table")).toBeNull();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(grid()).toBeNull();
  });

  it("hides the toggle while the responsive fallback forces cards", () => {
    width.value = 400;
    render(<Harness gridView cardBreakpoint={600} />);
    expect(toggle()).toBeNull();
  });

  it("draws loading placeholders inside the grid", () => {
    render(<Harness defaultViewMode="grid" isLoading data={[]} />);
    expect(grid()!.querySelectorAll("[data-slot='crud-card-skeleton']").length).toBeGreaterThan(0);
  });

  it("lets a group heading take the whole grid row", () => {
    render(<Harness defaultViewMode="grid" groupBy />);
    const headings = grid()!.querySelectorAll("[role='heading']");
    expect(headings.length).toBe(2);
    headings.forEach((heading) => expect(heading.classList.contains("col-span-full")).toBe(true));
  });

  it("leaves a group heading of the stacked cards without the grid class", () => {
    width.value = 400;
    render(<Harness cardBreakpoint={600} groupBy />);
    const headings = document.querySelectorAll("[role='heading']");
    expect(headings.length).toBe(2);
    headings.forEach((heading) => expect(heading.classList.contains("col-span-full")).toBe(false));
  });
});
