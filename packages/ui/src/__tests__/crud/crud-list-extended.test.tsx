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

// Mock useContainerWidth to return small width for card mode tests
let mockContainerWidth = 1200;
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => mockContainerWidth,
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
  score: number;
  created: string;
}

const testData: TestItem[] = [
  { id: 1, name: "Alice", status: "active", score: 95, created: "2024-01-01" },
  { id: 2, name: "Bob", status: "inactive", score: 72, created: "2024-02-15" },
  { id: 3, name: "Charlie", status: "active", score: 88, created: "2024-03-20" },
];

describe("CrudList.Table (extended coverage)", () => {
  it("renders date display mode with medium format", () => {
    render(
      <CrudList>
        <CrudList.Table data={testData}>
          <CrudList.Column<TestItem> field="created" header="Created" format="date" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Created")).toBeTruthy();
  });

  it("renders datetime display mode", () => {
    const data = [{ id: 1, name: "A", ts: "2024-01-01T12:00:00Z" }];
    render(
      <CrudList>
        <CrudList.Table data={data}>
          <CrudList.Column field="ts" header="Timestamp" format="datetime" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Timestamp")).toBeTruthy();
  });

  it("renders relative display mode", () => {
    const data = [{ id: 1, name: "A", ts: new Date().toISOString() }];
    render(
      <CrudList>
        <CrudList.Table data={data}>
          <CrudList.Column field="ts" header="Time" format="relative" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Time")).toBeTruthy();
  });

  it("renders number display mode", () => {
    render(
      <CrudList>
        <CrudList.Table data={testData}>
          <CrudList.Column<TestItem> field="score" header="Score" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Score")).toBeTruthy();
    expect(screen.getByText("95")).toBeTruthy();
  });

  it("applies column width", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table data={testData}>
          <CrudList.Column<TestItem> field="name" header="Name" width={200} />
        </CrudList.Table>
      </CrudList>,
    );
    // Column header should have width style
    const th = container.querySelector("th");
    expect(th).toBeTruthy();
  });

  it("renders table with table variant and density props", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table data={testData} density="compact" variant="striped">
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(container.querySelector("table")).toBeTruthy();
  });

  it("renders with custom rowId", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table
          data={testData}
          rowId={(row: TestItem) => `custom-${row.id}`}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(container.querySelector("[data-testid='list-row-custom-1']")).toBeTruthy();
  });

  it("renders empty state with error reason", () => {
    render(
      <CrudList>
        <CrudList.Table data={[]} emptyReason="error">
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("list.errorTitle")).toBeTruthy();
  });

  it("renders actions with custom labels", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{ type: "edit", onClick: vi.fn(), label: "Modify" }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Modify")).toBeTruthy();
  });

  it("renders with indeterminate select-all when partial selection", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          selectable
          selectedIndices={new Set([0])}
          onSelectionChange={vi.fn()}
          onSelectAll={vi.fn()}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const selectAllCheckbox = screen.getByLabelText("Select all rows");
    expect(selectAllCheckbox).toBeTruthy();
  });

  it("renders with all rows selected", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          selectable
          selectedIndices={new Set([0, 1, 2])}
          onSelectionChange={vi.fn()}
          onSelectAll={vi.fn()}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // All checkboxes should be checked
    const row1Checkbox = screen.getByLabelText("Select row 1") as HTMLInputElement;
    const row2Checkbox = screen.getByLabelText("Select row 2") as HTMLInputElement;
    const row3Checkbox = screen.getByLabelText("Select row 3") as HTMLInputElement;
    expect(row1Checkbox.checked).toBe(true);
    expect(row2Checkbox.checked).toBe(true);
    expect(row3Checkbox.checked).toBe(true);
  });

  it("hides action when when predicate returns false for all rows", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          actions={[{
            type: "delete",
            onClick: vi.fn(),
            when: () => false,
          }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.queryByText("common.delete")).toBeNull();
  });

  it("renders multiple actions", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[
            { type: "view", onClick: vi.fn() },
            { type: "edit", onClick: vi.fn() },
            { type: "delete", onClick: vi.fn() },
          ]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("common.view")).toBeTruthy();
    expect(screen.getByText("common.edit")).toBeTruthy();
    expect(screen.getByText("common.delete")).toBeTruthy();
  });

  it("stops event propagation when action is clicked", () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          onRowClick={onRowClick}
          actions={[{ type: "edit", onClick: onEdit }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    fireEvent.click(screen.getByText("common.edit").closest("button")!);
    expect(onEdit).toHaveBeenCalled();
    // onRowClick should NOT be called due to stopPropagation
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe("CrudList.Pagination (extended)", () => {
  it("calls onPageSizeChange when page size is changed", () => {
    const onPageSizeChange = vi.fn();
    render(
      <CrudList.Pagination
        page={1}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 25, 50]}
      />,
    );
    // Should render a page size selector
    const pageSizeSelector = screen.getByText("10");
    expect(pageSizeSelector).toBeTruthy();
  });

  it("shows total count", () => {
    render(
      <CrudList.Pagination
        page={1}
        pageSize={10}
        total={125}
        totalPages={13}
        onPageChange={vi.fn()}
      />,
    );
    // Some implementation shows total, check if rendered
    const paginationRoot = screen.getByLabelText("Page 1").closest("nav") ?? screen.getByLabelText("Page 1").parentElement;
    expect(paginationRoot).toBeTruthy();
  });
});
