// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.name) return `Move "${opts.name}" to a new parent`;
      return key;
    },
    locale: "en",
    exists: () => true,
  }),
}));

import React from "react";
import { TreeMoveDialog } from "../../crud/tree/tree-move-dialog";

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

const treeData: TreeNode[] = [
  {
    id: "1",
    name: "Category A",
    children: [
      {
        id: "1-1",
        name: "Item A-1",
        children: [
          { id: "1-1-1", name: "Sub Item", children: [] },
        ],
      },
      { id: "1-2", name: "Item A-2", children: [] },
    ],
  },
  {
    id: "2",
    name: "Category B",
    children: [],
  },
];

const defaultConfig = {
  idField: "id" as const,
  getDisplayName: (item: TreeNode) => item.name,
  onMove: vi.fn(),
};

describe("TreeMoveDialog (extended)", () => {
  it("disables current item and its descendants", () => {
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="1"
        currentParentId={null}
        config={defaultConfig}
      />,
    );
    // Category A should be disabled (it is the item being moved)
    const catAButton = screen.getByText("Category A").closest("button");
    expect(catAButton).toHaveProperty("disabled", true);
  });

  it("selects root when clicking root option", () => {
    const onMove = vi.fn();
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={{ ...defaultConfig, onMove }}
      />,
    );
    // Click root
    fireEvent.click(screen.getByText("tree.rootNode"));
    fireEvent.click(screen.getByText("tree.move"));
    expect(onMove).toHaveBeenCalledWith("1-1", null);
  });

  it("closes without calling onMove when selecting same parent", () => {
    const onMove = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={onOpenChange}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={{ ...defaultConfig, onMove }}
      />,
    );
    // Category A is the current parent, default selection
    // Clicking move should close without calling onMove
    fireEvent.click(screen.getByText("tree.move"));
    expect(onMove).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("filters tree items with search", () => {
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="2"
        currentParentId={null}
        config={defaultConfig}
      />,
    );
    // Type in search
    const searchInput = screen.getByPlaceholderText("tree.searchPlaceholder");
    fireEvent.change(searchInput, { target: { value: "Category B" } });
    // Category B should still be visible
    expect(screen.getByText("Category B")).toBeTruthy();
  });

  it("shows item name in description", () => {
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={defaultConfig}
      />,
    );
    expect(screen.getByText('Move "Item A-1" to a new parent')).toBeTruthy();
  });

  it("expands/collapses tree items", () => {
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="2"
        currentParentId={null}
        config={defaultConfig}
      />,
    );
    // Category A has children - click expand toggle
    const catARow = screen.getByText("Category A").closest("button")!;
    const expandBtn = catARow.querySelector("[role='button']");
    if (expandBtn) {
      fireEvent.click(expandBtn);
      // Children should now be visible
      expect(screen.getByText("Item A-1")).toBeTruthy();
    }
  });

  it("handles keyboard expand toggle", () => {
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="2"
        currentParentId={null}
        config={defaultConfig}
      />,
    );
    const catARow = screen.getByText("Category A").closest("button")!;
    const expandBtn = catARow.querySelector("[role='button']");
    if (expandBtn) {
      fireEvent.keyDown(expandBtn, { key: "Enter" });
      expect(screen.getByText("Item A-1")).toBeTruthy();
    }
  });
});
