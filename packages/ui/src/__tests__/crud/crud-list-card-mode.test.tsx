// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.count !== undefined) return `${opts.count} selected`;
      return key;
    },
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

// Mock useContainerWidth to return SMALL width for card mode
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => 400,
}));

// Mock @dnd-kit
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

interface TestItem {
  id: number;
  name: string;
  status: string;
}

const testData: TestItem[] = [
  { id: 1, name: "Alice", status: "active" },
  { id: 2, name: "Bob", status: "inactive" },
  { id: 3, name: "Charlie", status: "active" },
];

describe("CrudList.Table (card mode)", () => {
  it("renders card view when container is narrow", () => {
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
          cardContent={({ row }: { row: TestItem }) => <span>{row.status}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // Card mode should show card content
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getAllByText("active").length).toBe(2);
  });

  it("renders skeleton cards when loading and empty", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={[]}
          isLoading
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // Should render skeleton cards instead of table skeleton rows
    const skeletons = container.querySelectorAll("[class*='rounded-lg border']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state in card mode", () => {
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={[]}
          emptyReason="no-data"
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("list.noData")).toBeTruthy();
  });

  it("renders select-all in card mode", () => {
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          selectable
          selectedIndices={new Set<number>()}
          onSelectionChange={vi.fn()}
          onSelectAll={vi.fn()}
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByLabelText("Select all")).toBeTruthy();
  });

  it("calls onSelectAll in card mode", () => {
    const onSelectAll = vi.fn();
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          selectable
          selectedIndices={new Set<number>()}
          onSelectionChange={vi.fn()}
          onSelectAll={onSelectAll}
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it("renders row selection checkboxes in card mode", () => {
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          selectable
          selectedIndices={new Set([1])}
          onSelectionChange={vi.fn()}
          onSelectAll={vi.fn()}
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const row2Checkbox = screen.getByLabelText("Select row 2") as HTMLInputElement;
    expect(row2Checkbox.checked).toBe(true);
  });

  it("calls onSelectionChange in card mode", () => {
    const onSelectionChange = vi.fn();
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          selectable
          selectedIndices={new Set<number>()}
          onSelectionChange={onSelectionChange}
          onSelectAll={vi.fn()}
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    fireEvent.click(screen.getByLabelText("Select row 1"));
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it("calls onRowClick on card click", () => {
    const onRowClick = vi.fn();
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          rowId={(row: TestItem) => String(row.id)}
          onRowClick={onRowClick}
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
          cardContent={({ row }: { row: TestItem }) => <span>{row.status}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const card = screen.getByTestId("list-row-1");
    fireEvent.click(card);
    expect(onRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it("highlights active card", () => {
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          rowId={(row: TestItem) => String(row.id)}
          activeRowId="2"
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const activeCard = screen.getByTestId("list-row-2");
    expect(activeCard.className).toContain("bg-muted/50");
  });

  it("renders actions in card mode", () => {
    const onEdit = vi.fn();
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          actions={[{ type: "edit", onClick: onEdit }]}
          actionVariant="icon"
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders selected card with ring style", () => {
    render(
      <CrudList>
        <CrudList.Table cardBreakpoint={600}
          data={testData}
          rowId={(row: TestItem) => String(row.id)}
          selectable
          selectedIndices={new Set([0])}
          onSelectionChange={vi.fn()}
          onSelectAll={vi.fn()}
          cardTitle={({ row }: { row: TestItem }) => <span>{row.name}</span>}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const selectedCard = screen.getByTestId("list-row-1");
    expect(selectedCard.className).toContain("ring-2");
  });
});
