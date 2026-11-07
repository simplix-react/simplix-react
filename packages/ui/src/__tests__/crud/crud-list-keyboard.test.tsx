// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
  useGroupedFigure: () => (figure: number | undefined) => figure?.toLocaleString("en"),
}));

// Table mode rather than cards: grouping is a property of the table, and a narrow container
// would test the branch that has none.
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => 1200,
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
}));
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}));
vi.mock("../../crud/reorder/use-reorder", () => ({
  useReorder: () => ({
    sensors: [],
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    isDragEnabled: false,
    activeId: null,
    activateOrderSort: vi.fn(),
    getRowId: (row: Record<string, unknown>) => String(row.id),
    optimisticData: [],
  }),
}));
vi.mock("../../crud/reorder/drag-handle", () => ({
  DragHandleHeader: () => <span>DragHeader</span>,
  DragHandleCell: () => <span>DragHandle</span>,
}));
vi.mock("../../crud/reorder/draggable-row", () => ({
  DraggableRow: () => <tr><td>DraggableRow</td></tr>,
}));
vi.mock("../../crud/reorder/draggable-card", () => ({
  DraggableCard: () => <div>DraggableCard</div>,
}));

import React from "react";
import { CrudList } from "../../crud/list/crud-list";

interface Person {
  id: string;
  name: string;
  band: string;
}

// Drawn grouped, so the drawn order (a, c, b) differs from the data order (a, b, c).
const people: Person[] = [
  { id: "a", name: "Ann", band: "one" },
  { id: "b", name: "Bob", band: "two" },
  { id: "c", name: "Cid", band: "one" },
];

function Table(props: { onRowClick?: (row: Person) => void; onSelectionChange?: (index: number) => void; selected?: Set<number> }) {
  return (
    <CrudList>
      <CrudList.Table<Person>
        data={people}
        rowId={(row) => row.id}
        keyboardNav
        selectable
        selectedIndices={props.selected ?? new Set()}
        onSelectionChange={props.onSelectionChange}
        onSelectAll={() => undefined}
        onRowClick={props.onRowClick}
        groupBy={{ of: (row) => row.band, order: ["one", "two"] }}
      >
        <CrudList.Column<Person> field="name" header="Name" />
      </CrudList.Table>
    </CrudList>
  );
}

const focused = () => document.querySelector("[data-part-focused=true]")?.getAttribute("data-testid");

describe("CrudList.Table keyboard navigation", () => {
  it("steps along the rows in the order they are drawn and stops at either end", () => {
    render(<Table />);
    expect(focused()).toBeUndefined();
    fireEvent.keyDown(document.body, { key: "j" });
    expect(focused()).toBe("list-row-a");
    fireEvent.keyDown(document.body, { key: "j" });
    expect(focused()).toBe("list-row-c");
    fireEvent.keyDown(document.body, { key: "j" });
    fireEvent.keyDown(document.body, { key: "j" });
    expect(focused()).toBe("list-row-b");
    fireEvent.keyDown(document.body, { key: "k" });
    expect(focused()).toBe("list-row-c");
  });

  it("selects the marked row with x and opens it with Enter", () => {
    const onRowClick = vi.fn();
    const onSelectionChange = vi.fn();
    render(<Table onRowClick={onRowClick} onSelectionChange={onSelectionChange} />);
    fireEvent.keyDown(document.body, { key: "j" });
    fireEvent.keyDown(document.body, { key: "j" });
    fireEvent.keyDown(document.body, { key: "x" });
    expect(onSelectionChange).toHaveBeenCalledWith(2);
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalledWith(people[2]);
  });

  it("leaves the keys alone while the reader types in a field", () => {
    render(
      <>
        <input aria-label="elsewhere" />
        <Table />
      </>,
    );
    fireEvent.keyDown(screen.getByLabelText("elsewhere"), { key: "j" });
    expect(focused()).toBeUndefined();
  });

  it("marks the select-all box as partly checked when some rows but not all are selected", () => {
    render(<Table selected={new Set([1])} />);
    const all = screen.getByLabelText("list.selectAllRows") as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    expect(all.checked).toBe(false);
  });

  it("counts each group's records beside its heading", () => {
    render(<Table />);
    expect(screen.getByTestId("list-group-one").querySelector("[data-count]")?.getAttribute("data-count")).toBe("2");
    expect(screen.getByTestId("list-group-two").querySelector("[data-count]")?.getAttribute("data-count")).toBe("1");
  });
});

describe("CrudList.Search shortcut", () => {
  it("moves the focus into the field when its key is pressed on the page", () => {
    render(<CrudList.Search value="" onChange={() => undefined} shortcut="/" />);
    fireEvent.keyDown(document.body, { key: "/" });
    expect(document.activeElement).toBe(screen.getByRole("searchbox"));
  });
});

describe("CrudList.Pagination range", () => {
  it("says which rows are on show out of all of them", () => {
    render(<CrudList.Pagination page={2} pageSize={10} total={25} totalPages={3} onPageChange={() => undefined} />);
    expect(document.querySelector("[data-slot=crud-list-pagination-range]")?.textContent).toBe("11-20 / 25");
  });
});
