// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
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

// Mock useContainerWidth to simulate card mode
let mockContainerWidth = 1200;
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => mockContainerWidth,
}));

// Mock @dnd-kit/core and @dnd-kit/sortable
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
  isActive: boolean;
}

const testData: TestItem[] = [
  { id: 1, name: "Alice", status: "active", score: 95, created: "2024-01-01", isActive: true },
  { id: 2, name: "Bob", status: "inactive", score: 72, created: "2024-02-15", isActive: false },
  { id: 3, name: "Charlie", status: "active", score: 88, created: "2024-03-20", isActive: true },
];

describe("CrudList.Table (more coverage)", () => {
  it("renders format=date column", () => {
    render(
      <CrudList>
        <CrudList.Table data={testData}>
          <CrudList.Column<TestItem> field="created" header="Created" format="date" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Created")).toBeTruthy();
    // Should render formatted date (not raw string)
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("renders format=datetime column", () => {
    const data = [{ id: 1, name: "A", ts: "2024-01-15T12:00:00Z" }];
    render(
      <CrudList>
        <CrudList.Table data={data}>
          <CrudList.Column field="ts" header="Timestamp" format="datetime" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Timestamp")).toBeTruthy();
  });

  it("renders format=relative column", () => {
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

  it("renders null/undefined cell values as empty string", () => {
    const data = [{ id: 1, name: null, status: "" }];
    render(
      <CrudList>
        <CrudList.Table data={data}>
          <CrudList.Column field="name" header="Name" />
          <CrudList.Column field="status" header="Status" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Name")).toBeTruthy();
  });

  it("renders rowClassName callback", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table
          data={testData}
          rowId={(row: TestItem) => String(row.id)}
          rowClassName={(row: TestItem) => row.isActive ? "row-active" : "row-inactive"}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const activeRow = container.querySelector("[data-testid='list-row-1']");
    expect(activeRow?.className).toContain("row-active");
    const inactiveRow = container.querySelector("[data-testid='list-row-2']");
    expect(inactiveRow?.className).toContain("row-inactive");
  });

  it("renders no-data emptyReason as text in table cell", () => {
    render(
      <CrudList>
        <CrudList.Table data={[]} emptyReason="no-data">
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("list.noData")).toBeTruthy();
  });

  it("renders error reason with EmptyReasonCard", () => {
    render(
      <CrudList>
        <CrudList.Table data={[]} emptyReason="error">
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("list.errorTitle")).toBeTruthy();
    expect(screen.getByText("list.errorDescription")).toBeTruthy();
  });

  it("renders custom icon in action", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{
            type: "view",
            onClick: vi.fn(),
            icon: <span data-testid="custom-icon">!</span>,
          }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
  });

  it("renders dynamic icon function in action", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{
            type: "view",
            onClick: vi.fn(),
            icon: (row: TestItem) => <span data-testid={`icon-${row.id}`}>*</span>,
          }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByTestId("icon-1")).toBeTruthy();
  });

  it("renders ghost action variant", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{ type: "edit", onClick: vi.fn() }]}
          actionVariant="ghost"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("common.edit")).toBeTruthy();
  });

  it("renders delete action type", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{ type: "delete", onClick: vi.fn() }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("common.delete")).toBeTruthy();
  });

  it("renders locate action type", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{ type: "locate", onClick: vi.fn() }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("common.locate")).toBeTruthy();
  });

  it("renders table with loading skeleton when isLoading and empty data", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table data={[]} isLoading>
          <CrudList.Column<TestItem> field="name" header="Name" />
          <CrudList.Column<TestItem> field="status" header="Status" />
        </CrudList.Table>
      </CrudList>,
    );
    const skeletons = container.querySelectorAll("tbody tr");
    expect(skeletons.length).toBe(5);
  });

  it("renders table with data even when isLoading is true", () => {
    render(
      <CrudList>
        <CrudList.Table data={testData} isLoading>
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // Data should still be rendered
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("renders non-sortable header as plain text", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table
          data={testData}
          sort={{ field: null, direction: "asc" }}
          onSortChange={vi.fn()}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // Non-sortable header should not be wrapped in a button
    const th = container.querySelector("th");
    expect(th?.querySelector("button")).toBeNull();
  });

  it("renders with actionColumnWidth override", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{ type: "edit", onClick: vi.fn() }]}
          actionVariant="outline"
          actionColumnWidth={200}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("common.edit")).toBeTruthy();
  });
});

describe("CrudList.Pagination (more coverage)", () => {
  it("renders page size selector with onPageSizeChange", () => {
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
    // Should render the page size selector
    expect(screen.getByLabelText("Page size")).toBeTruthy();
  });

  it("renders with custom rowsLabel", () => {
    render(
      <CrudList.Pagination
        page={1}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        rowsLabel="Items:"
      />,
    );
    expect(screen.getByText("Items:")).toBeTruthy();
  });

  it("renders 7 or fewer pages without ellipsis", () => {
    const { container } = render(
      <CrudList.Pagination
        page={1}
        pageSize={10}
        total={30}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );
    // Should have 3 page buttons
    expect(screen.getByLabelText("Page 1")).toBeTruthy();
    expect(screen.getByLabelText("Page 2")).toBeTruthy();
    expect(screen.getByLabelText("Page 3")).toBeTruthy();
    // No ellipsis
    const spans = container.querySelectorAll("span");
    const hasEllipsis = Array.from(spans).some((el) => el.textContent?.includes("\u2026"));
    expect(hasEllipsis).toBe(false);
  });
});

describe("CrudList.Empty (extended)", () => {
  it("renders with no-filter reason showing specific message", () => {
    render(<CrudList.Empty reason="no-filter" />);
    expect(screen.getByText("list.noFilter")).toBeTruthy();
  });

  it("renders with error reason", () => {
    render(<CrudList.Empty reason="error" />);
    expect(screen.getByText("list.error")).toBeTruthy();
  });

  it("renders default messages for all reasons", () => {
    render(
      <CrudList.Empty
        reason="no-data"
        messages={{
          "no-data": "Empty",
          "no-filter": "No filters match",
          "no-search": "Search returned nothing",
          error: "Something went wrong",
        }}
      />,
    );
    expect(screen.getByText("Empty")).toBeTruthy();
  });
});
