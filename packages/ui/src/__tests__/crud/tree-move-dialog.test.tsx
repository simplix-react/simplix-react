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
      { id: "1-1", name: "Item A-1", children: [] },
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

describe("TreeMoveDialog", () => {
  it("renders dialog when open", () => {
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
    expect(screen.getByText("tree.moveTitle")).toBeTruthy();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <TreeMoveDialog
        open={false}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={defaultConfig}
      />,
    );
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("shows custom title and description", () => {
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={defaultConfig}
        title="Move Item"
        description="Select a new parent"
      />,
    );
    expect(screen.getByText("Move Item")).toBeTruthy();
    expect(screen.getByText("Select a new parent")).toBeTruthy();
  });

  it("renders root option", () => {
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
    expect(screen.getByText("tree.rootNode")).toBeTruthy();
  });

  it("renders custom root label", () => {
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={defaultConfig}
        rootLabel="Top Level"
      />,
    );
    expect(screen.getByText("Top Level")).toBeTruthy();
  });

  it("renders tree items", () => {
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
    expect(screen.getByText("Category A")).toBeTruthy();
    expect(screen.getByText("Category B")).toBeTruthy();
  });

  it("renders cancel and move buttons", () => {
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
    expect(screen.getByText("common.cancel")).toBeTruthy();
    expect(screen.getByText("tree.move")).toBeTruthy();
  });

  it("calls onOpenChange(false) when cancel is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={onOpenChange}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={defaultConfig}
      />,
    );
    fireEvent.click(screen.getByText("common.cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls config.onMove when selecting a different parent", () => {
    const onMove = vi.fn();
    const config = { ...defaultConfig, onMove };
    render(
      <TreeMoveDialog
        open={true}
        onOpenChange={vi.fn()}
        treeData={treeData}
        currentItemId="1-1"
        currentParentId="1"
        config={config}
      />,
    );
    // Select Category B as new parent
    fireEvent.click(screen.getByText("Category B"));
    // Click move
    fireEvent.click(screen.getByText("tree.move"));
    expect(onMove).toHaveBeenCalledWith("1-1", "2");
  });

  it("renders search input", () => {
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
    expect(screen.getByPlaceholderText("tree.searchPlaceholder")).toBeTruthy();
  });
});
