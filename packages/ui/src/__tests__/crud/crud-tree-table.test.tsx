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

import React from "react";
import { CrudTree } from "../../crud/tree/crud-tree";

interface TreeNode {
  id: string;
  name: string;
  status: string;
  children: TreeNode[];
}

const treeData: TreeNode[] = [
  {
    id: "1",
    name: "Category A",
    status: "active",
    children: [
      { id: "1-1", name: "Item A-1", status: "active", children: [] },
      { id: "1-2", name: "Item A-2", status: "draft", children: [] },
    ],
  },
  {
    id: "2",
    name: "Category B",
    status: "active",
    children: [
      { id: "2-1", name: "Item B-1", status: "active", children: [] },
    ],
  },
];

describe("CrudTree.Table", () => {
  it("renders tree data with column headers", () => {
    render(
      <CrudTree>
        <CrudTree.Table data={treeData}>
          <CrudTree.Column<TreeNode> field="name" header="Name" />
          <CrudTree.Column<TreeNode> field="status" header="Status" />
        </CrudTree.Table>
      </CrudTree>,
    );
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
    // Root nodes should be visible
    expect(screen.getByText("Category A")).toBeTruthy();
    expect(screen.getByText("Category B")).toBeTruthy();
  });

  it("shows children when node is expanded (default initialExpandedDepth=1)", () => {
    render(
      <CrudTree>
        <CrudTree.Table data={treeData}>
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    // With initialExpandedDepth=1, root level is expanded
    expect(screen.getByText("Item A-1")).toBeTruthy();
    expect(screen.getByText("Item B-1")).toBeTruthy();
  });

  it("renders skeleton rows when loading and data is empty", () => {
    const { container } = render(
      <CrudTree>
        <CrudTree.Table data={[]} isLoading>
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(5);
  });

  it("calls onRowClick when row is clicked", () => {
    const onRowClick = vi.fn();
    render(
      <CrudTree>
        <CrudTree.Table data={treeData} onRowClick={onRowClick}>
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    const row = screen.getByTestId("tree-row-2");
    fireEvent.click(row);
    expect(onRowClick).toHaveBeenCalled();
  });

  it("highlights active row", () => {
    render(
      <CrudTree>
        <CrudTree.Table data={treeData} activeRowId="2">
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    const row = screen.getByTestId("tree-row-2");
    expect(row.className).toContain("bg-muted/50");
  });

  it("renders sortable column header as button", () => {
    const onSortChange = vi.fn();
    render(
      <CrudTree>
        <CrudTree.Table
          data={treeData}
          sort={null}
          onSortChange={onSortChange}
        >
          <CrudTree.Column<TreeNode> field="name" header="Name" sortable />
        </CrudTree.Table>
      </CrudTree>,
    );
    const sortBtn = screen.getByText("Name").closest("button");
    expect(sortBtn).toBeTruthy();
    fireEvent.click(sortBtn!);
    expect(onSortChange).toHaveBeenCalledWith({ field: "name", direction: "asc" });
  });

  it("toggles sort direction on same column click", () => {
    const onSortChange = vi.fn();
    render(
      <CrudTree>
        <CrudTree.Table
          data={treeData}
          sort={{ field: "name", direction: "asc" }}
          onSortChange={onSortChange}
        >
          <CrudTree.Column<TreeNode> field="name" header="Name" sortable />
        </CrudTree.Table>
      </CrudTree>,
    );
    const sortBtn = screen.getByText("Name").closest("button");
    fireEvent.click(sortBtn!);
    expect(onSortChange).toHaveBeenCalledWith({ field: "name", direction: "desc" });
  });

  it("renders custom cell content via children", () => {
    render(
      <CrudTree>
        <CrudTree.Table data={treeData}>
          <CrudTree.Column<TreeNode> field="name" header="Name">
            {({ value }) => <strong>Custom: {String(value)}</strong>}
          </CrudTree.Column>
        </CrudTree.Table>
      </CrudTree>,
    );
    expect(screen.getByText("Custom: Category A")).toBeTruthy();
  });

  it("renders action column with buttons", () => {
    const onEdit = vi.fn();
    render(
      <CrudTree>
        <CrudTree.Table
          data={treeData}
          actions={[{ type: "edit" as const, onClick: onEdit }]}
          actionVariant="outline"
        >
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    const editButtons = screen.getAllByText("common.edit");
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("renders action column with icon variant", () => {
    const onView = vi.fn();
    render(
      <CrudTree>
        <CrudTree.Table
          data={treeData}
          actions={[{ type: "view" as const, onClick: onView }]}
          actionVariant="icon"
        >
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders headerActions in header when provided", () => {
    render(
      <CrudTree>
        <CrudTree.Table
          data={treeData}
          headerActions={<span>Header Action</span>}
        >
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    expect(screen.getByText("Header Action")).toBeTruthy();
  });

  it("filters tree by search from context", () => {
    render(
      <CrudTree>
        <CrudTree.Search value="B-1" onChange={() => {}} />
        <CrudTree.Table data={treeData} searchFields={["name"]}>
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    // "Item B-1" should be visible, "Item A-1" may be filtered out
    expect(screen.getByText("Item B-1")).toBeTruthy();
  });

  it("toggles node expansion on chevron click", () => {
    render(
      <CrudTree>
        <CrudTree.Table data={treeData} tree={{ initialExpandedDepth: 0 }}>
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
      </CrudTree>,
    );
    // With initialExpandedDepth=0, children are collapsed
    expect(screen.queryByText("Item A-1")).toBeNull();

    // Click expand button for Category A
    const expandBtn = screen.getAllByLabelText("Expand")[0];
    fireEvent.click(expandBtn);
    expect(screen.getByText("Item A-1")).toBeTruthy();
  });
});

describe("CrudTree.Empty", () => {
  it("renders default no-data message", () => {
    render(
      <CrudTree>
        <CrudTree.Empty />
      </CrudTree>,
    );
    expect(screen.getByText("list.noData")).toBeTruthy();
  });

  it("renders with specific reason", () => {
    render(
      <CrudTree>
        <CrudTree.Empty reason="no-search" />
      </CrudTree>,
    );
    expect(screen.getByText("list.noSearch")).toBeTruthy();
  });

  it("renders with custom messages", () => {
    render(
      <CrudTree>
        <CrudTree.Empty reason="no-data" messages={{ "no-data": "Empty tree" }} />
      </CrudTree>,
    );
    expect(screen.getByText("Empty tree")).toBeTruthy();
  });

  it("renders children as string", () => {
    render(
      <CrudTree>
        <CrudTree.Empty>No nodes found</CrudTree.Empty>
      </CrudTree>,
    );
    expect(screen.getByText("No nodes found")).toBeTruthy();
  });

  it("renders children as render function", () => {
    render(
      <CrudTree>
        <CrudTree.Empty reason="error">
          {({ reason }) => <span>Reason: {reason}</span>}
        </CrudTree.Empty>
      </CrudTree>,
    );
    expect(screen.getByText("Reason: error")).toBeTruthy();
  });
});

describe("CrudTree.HeaderActions", () => {
  it("renders expand/collapse buttons when expansion context available", () => {
    render(
      <CrudTree>
        <CrudTree.Table data={treeData}>
          <CrudTree.Column<TreeNode> field="name" header="Name" />
        </CrudTree.Table>
        <CrudTree.ExpandToggle />
      </CrudTree>,
    );
    // After TreeTable renders, expansion context is set
    // ExpandToggle should render buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
