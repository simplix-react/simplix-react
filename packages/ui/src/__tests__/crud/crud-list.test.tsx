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

// Mock useContainerWidth to always return a large width (table mode)
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => 1200,
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

// Mock reorder dependencies
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

// ── ListRoot ──

describe("CrudList (ListRoot)", () => {
  it("renders with data-testid", () => {
    render(<CrudList>Content</CrudList>);
    expect(screen.getByTestId("crud-list")).toBeTruthy();
  });

  it("renders children", () => {
    render(<CrudList>Hello List</CrudList>);
    expect(screen.getByText("Hello List")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(<CrudList className="my-list">Content</CrudList>);
    const el = container.querySelector("[data-testid='crud-list']");
    expect(el?.className).toContain("my-list");
  });
});

// ── List.Toolbar ──

describe("CrudList.Toolbar", () => {
  it("renders children", () => {
    render(
      <CrudList.Toolbar>
        <button>Create</button>
      </CrudList.Toolbar>,
    );
    expect(screen.getByText("Create")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(
      <CrudList.Toolbar className="my-toolbar">
        Content
      </CrudList.Toolbar>,
    );
    expect(container.firstElementChild?.className).toContain("my-toolbar");
  });
});

// ── List.Search ──

describe("CrudList.Search", () => {
  it("renders search input with placeholder", () => {
    render(
      <CrudList.Search value="" onChange={vi.fn()} placeholder="Search..." />,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
  });

  it("uses default placeholder from i18n when not provided", () => {
    render(<CrudList.Search value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("list.searchPlaceholder")).toBeTruthy();
  });

  it("displays current value", () => {
    render(<CrudList.Search value="hello" onChange={vi.fn()} />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(<CrudList.Search value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });
});

// ── List.Column ──

describe("CrudList.Column", () => {
  it("renders null (declaration-only component)", () => {
    const { container } = render(<CrudList.Column field="name" header="Name" />);
    expect(container.innerHTML).toBe("");
  });
});

// ── List.Table ──

describe("CrudList.Table", () => {
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

  it("renders table with column headers and row data", () => {
    render(
      <CrudList>
        <CrudList.Table data={testData}>
          <CrudList.Column<TestItem> field="name" header="Name" />
          <CrudList.Column<TestItem> field="status" header="Status" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("Charlie")).toBeTruthy();
  });

  it("renders skeleton rows when isLoading and data is empty", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table data={[]} isLoading>
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // 5 skeleton rows
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(5);
  });

  it("renders empty message when emptyReason='no-data' and data is empty", () => {
    render(
      <CrudList>
        <CrudList.Table data={[]} emptyReason="no-data">
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("list.noData")).toBeTruthy();
  });

  it("renders EmptyReasonCard for no-filter reason when empty", () => {
    render(
      <CrudList>
        <CrudList.Table data={[]} emptyReason="no-filter">
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("list.noFilterTitle")).toBeTruthy();
  });

  it("renders EmptyReasonCard for no-search reason when empty", () => {
    render(
      <CrudList>
        <CrudList.Table data={[]} emptyReason="no-search">
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("list.noSearchTitle")).toBeTruthy();
  });

  it("renders custom emptyState for no-data reason", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[]}
          emptyReason="no-data"
          emptyState={{ title: "Nothing here", description: "Add some items" }}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Nothing here")).toBeTruthy();
    expect(screen.getByText("Add some items")).toBeTruthy();
  });

  it("handles sortable column click", () => {
    const onSortChange = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          sort={null}
          onSortChange={onSortChange}
        >
          <CrudList.Column<TestItem> field="name" header="Name" sortable />
        </CrudList.Table>
      </CrudList>,
    );
    // Click on sortable header
    const sortBtn = screen.getByText("Name").closest("button");
    expect(sortBtn).toBeTruthy();
    fireEvent.click(sortBtn!);
    expect(onSortChange).toHaveBeenCalledWith({ field: "name", direction: "asc" });
  });

  it("toggles sort direction when clicking same column", () => {
    const onSortChange = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          sort={{ field: "name", direction: "asc" }}
          onSortChange={onSortChange}
        >
          <CrudList.Column<TestItem> field="name" header="Name" sortable />
        </CrudList.Table>
      </CrudList>,
    );
    const sortBtn = screen.getByText("Name").closest("button");
    fireEvent.click(sortBtn!);
    expect(onSortChange).toHaveBeenCalledWith({ field: "name", direction: "desc" });
  });

  it("renders selectable checkboxes", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          selectable
          selectedIndices={new Set([1])}
          onSelectionChange={vi.fn()}
          onSelectAll={vi.fn()}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const selectAllCheckbox = screen.getByLabelText("Select all rows");
    expect(selectAllCheckbox).toBeTruthy();
    const row2Checkbox = screen.getByLabelText("Select row 2") as HTMLInputElement;
    expect(row2Checkbox.checked).toBe(true);
  });

  it("calls onSelectAll when header checkbox clicked", () => {
    const onSelectAll = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          selectable
          selectedIndices={new Set()}
          onSelectionChange={vi.fn()}
          onSelectAll={onSelectAll}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    fireEvent.click(screen.getByLabelText("Select all rows"));
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectionChange when row checkbox clicked", () => {
    const onSelectionChange = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          selectable
          selectedIndices={new Set()}
          onSelectionChange={onSelectionChange}
          onSelectAll={vi.fn()}
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    fireEvent.click(screen.getByLabelText("Select row 1"));
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it("calls onRowClick when a row is clicked", () => {
    const onRowClick = vi.fn();
    render(
      <CrudList>
        <CrudList.Table data={testData} onRowClick={onRowClick}>
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    fireEvent.click(screen.getByText("Alice").closest("tr")!);
    expect(onRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it("renders action column with buttons", () => {
    const onEdit = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          actions={[{ type: "edit", onClick: onEdit }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const editButtons = screen.getAllByText("common.edit");
    expect(editButtons.length).toBe(3);
    fireEvent.click(editButtons[0].closest("button")!);
    expect(onEdit).toHaveBeenCalledWith(testData[0]);
  });

  it("renders action column with icon variant", () => {
    const onView = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          actions={[{ type: "view", onClick: onView }]}
          actionVariant="icon"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // Icon variant uses tooltips, just check buttons exist
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("hides action when 'when' returns false", () => {
    const onEdit = vi.fn();
    render(
      <CrudList>
        <CrudList.Table
          data={testData}
          actions={[{ type: "edit", onClick: onEdit, when: (row: TestItem) => row.status === "active" }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // Only Alice and Charlie are active, so 2 edit buttons
    const editButtons = screen.getAllByText("common.edit");
    expect(editButtons.length).toBe(2);
  });

  it("disables action when disabled returns true", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={[testData[0]]}
          actions={[{ type: "edit", onClick: vi.fn(), disabled: () => true }]}
          actionVariant="outline"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const editBtn = screen.getByText("common.edit").closest("button");
    expect(editBtn?.disabled).toBe(true);
  });

  it("renders badge display mode", () => {
    render(
      <CrudList>
        <CrudList.Table data={testData}>
          <CrudList.Column<TestItem>
            field="status"
            header="Status"
            display="badge"
            variants={{ active: "default", inactive: "secondary" }}
          />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getAllByText("active").length).toBe(2);
    expect(screen.getByText("inactive")).toBeTruthy();
  });

  it("renders boolean display mode", () => {
    const boolData = [
      { id: 1, name: "A", enabled: true },
      { id: 2, name: "B", enabled: false },
    ];
    render(
      <CrudList>
        <CrudList.Table data={boolData}>
          <CrudList.Column field="enabled" header="Enabled" display="boolean" />
        </CrudList.Table>
      </CrudList>,
    );
    // BooleanBadge renders true/false values
    expect(screen.getByText("Enabled")).toBeTruthy();
  });

  it("renders custom cell renderer via children", () => {
    render(
      <CrudList>
        <CrudList.Table data={testData}>
          <CrudList.Column<TestItem> field="name" header="Name">
            {({ value }) => <strong>Custom: {String(value)}</strong>}
          </CrudList.Column>
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("Custom: Alice")).toBeTruthy();
    expect(screen.getByText("Custom: Bob")).toBeTruthy();
  });

  it("highlights active row", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table
          data={testData}
          rowId={(row: TestItem) => String(row.id)}
          activeRowId="2"
        >
          <CrudList.Column<TestItem> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    const activeRow = container.querySelector("[data-testid='list-row-2']");
    expect(activeRow?.className).toContain("bg-muted/50");
  });
});

// ── List.Pagination ──

describe("CrudList.Pagination", () => {
  it("renders page numbers", () => {
    render(
      <CrudList.Pagination
        page={1}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Page 1")).toBeTruthy();
    expect(screen.getByLabelText("Page 5")).toBeTruthy();
  });

  it("calls onPageChange when page button is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <CrudList.Pagination
        page={1}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Page 3"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables previous button on first page", () => {
    render(
      <CrudList.Pagination
        page={1}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );
    const prevBtn = screen.getByLabelText("Previous page");
    expect(prevBtn).toHaveProperty("disabled", true);
  });

  it("disables next button on last page", () => {
    render(
      <CrudList.Pagination
        page={5}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );
    const nextBtn = screen.getByLabelText("Next page");
    expect(nextBtn).toHaveProperty("disabled", true);
  });

  it("calls onPageChange with page-1 when prev is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <CrudList.Pagination
        page={3}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page+1 when next is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <CrudList.Pagination
        page={3}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("shows ellipsis for large page counts", () => {
    const { container } = render(
      <CrudList.Pagination
        page={5}
        pageSize={10}
        total={200}
        totalPages={20}
        onPageChange={vi.fn()}
      />,
    );
    // Should render at least one hellip
    const ellipses = container.querySelectorAll("span");
    const hasEllipsis = Array.from(ellipses).some((el) => el.textContent?.includes("\u2026"));
    expect(hasEllipsis).toBe(true);
  });

  it("highlights current page", () => {
    render(
      <CrudList.Pagination
        page={3}
        pageSize={10}
        total={50}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );
    const currentBtn = screen.getByLabelText("Page 3");
    expect(currentBtn.getAttribute("aria-current")).toBe("page");
  });
});

// ── List.BulkActions ──

describe("CrudList.BulkActions", () => {
  it("renders nothing when selectedCount is 0", () => {
    const { container } = render(
      <CrudList.BulkActions selectedCount={0}>
        <button>Delete</button>
      </CrudList.BulkActions>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders selected count label", () => {
    render(
      <CrudList.BulkActions selectedCount={3}>
        <button>Delete</button>
      </CrudList.BulkActions>,
    );
    expect(screen.getByText("3 selected")).toBeTruthy();
  });

  it("renders clear button when onClear is provided", () => {
    const onClear = vi.fn();
    render(
      <CrudList.BulkActions selectedCount={2} onClear={onClear}>
        <button>Delete</button>
      </CrudList.BulkActions>,
    );
    fireEvent.click(screen.getByText("common.clear"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("uses custom selectedLabel", () => {
    render(
      <CrudList.BulkActions
        selectedCount={5}
        selectedLabel={(count) => `${count} items chosen`}
      >
        <button>Delete</button>
      </CrudList.BulkActions>,
    );
    expect(screen.getByText("5 items chosen")).toBeTruthy();
  });

  it("uses custom clearLabel", () => {
    render(
      <CrudList.BulkActions selectedCount={2} onClear={vi.fn()} clearLabel="Deselect">
        <button>Delete</button>
      </CrudList.BulkActions>,
    );
    expect(screen.getByText("Deselect")).toBeTruthy();
  });
});

// ── List.BulkAction ──

describe("CrudList.BulkAction", () => {
  it("renders label and calls onClick", () => {
    const onClick = vi.fn();
    render(<CrudList.BulkAction label="Delete All" onClick={onClick} />);
    fireEvent.click(screen.getByText("Delete All"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    const { container } = render(
      <CrudList.BulkAction label="Action" onClick={vi.fn()} className="my-action" />,
    );
    expect(container.firstElementChild?.className).toContain("my-action");
  });
});

// ── List.Empty ──

describe("CrudList.Empty", () => {
  it("renders default no-data message", () => {
    render(<CrudList.Empty />);
    expect(screen.getByText("list.noData")).toBeTruthy();
  });

  it("renders with specific reason", () => {
    render(<CrudList.Empty reason="no-search" />);
    expect(screen.getByText("list.noSearch")).toBeTruthy();
  });

  it("renders with custom messages", () => {
    render(
      <CrudList.Empty reason="no-data" messages={{ "no-data": "Custom empty" }} />,
    );
    expect(screen.getByText("Custom empty")).toBeTruthy();
  });

  it("renders children as string", () => {
    render(<CrudList.Empty>Nothing found</CrudList.Empty>);
    expect(screen.getByText("Nothing found")).toBeTruthy();
  });

  it("renders children as render function", () => {
    render(
      <CrudList.Empty reason="no-filter">
        {({ reason }) => <span>Reason: {reason}</span>}
      </CrudList.Empty>,
    );
    expect(screen.getByText("Reason: no-filter")).toBeTruthy();
  });
});
