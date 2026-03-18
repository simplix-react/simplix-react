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

// Mock @dnd-kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  MouseSensor: class {},
  TouchSensor: class {},
  useSensor: vi.fn().mockReturnValue({}),
  useSensors: vi.fn().mockReturnValue([]),
}));
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));
vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

import React from "react";
import { TreeReorderDialog } from "../../crud/tree/tree-reorder-dialog";

interface TreeNode {
  id: string;
  name: string;
  displayOrder: number;
}

const siblings: TreeNode[] = [
  { id: "1", name: "Item A", displayOrder: 1 },
  { id: "2", name: "Item B", displayOrder: 2 },
  { id: "3", name: "Item C", displayOrder: 3 },
];

const defaultConfig = {
  idField: "id" as const,
  onReorder: vi.fn(),
};

describe("TreeReorderDialog", () => {
  it("renders dialog when open", () => {
    render(
      <TreeReorderDialog
        open={true}
        onOpenChange={vi.fn()}
        parentId={null}
        siblings={siblings}
        config={defaultConfig}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    expect(screen.getByText("tree.reorderTitle")).toBeTruthy();
    expect(screen.getByText("tree.reorderDescription")).toBeTruthy();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <TreeReorderDialog
        open={false}
        onOpenChange={vi.fn()}
        parentId={null}
        siblings={siblings}
        config={defaultConfig}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("renders sortable items", () => {
    render(
      <TreeReorderDialog
        open={true}
        onOpenChange={vi.fn()}
        parentId={null}
        siblings={siblings}
        config={defaultConfig}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    expect(screen.getByText("Item A")).toBeTruthy();
    expect(screen.getByText("Item B")).toBeTruthy();
    expect(screen.getByText("Item C")).toBeTruthy();
  });

  it("shows custom title and description", () => {
    render(
      <TreeReorderDialog
        open={true}
        onOpenChange={vi.fn()}
        parentId={null}
        siblings={siblings}
        config={defaultConfig}
        getDisplayName={(item: TreeNode) => item.name}
        title="Reorder Items"
        description="Drag to reorder"
      />,
    );
    expect(screen.getByText("Reorder Items")).toBeTruthy();
    expect(screen.getByText("Drag to reorder")).toBeTruthy();
  });

  it("renders cancel and confirm buttons", () => {
    render(
      <TreeReorderDialog
        open={true}
        onOpenChange={vi.fn()}
        parentId={null}
        siblings={siblings}
        config={defaultConfig}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    expect(screen.getByText("common.cancel")).toBeTruthy();
    expect(screen.getByText("tree.confirm")).toBeTruthy();
  });

  it("calls onOpenChange(false) when cancel is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <TreeReorderDialog
        open={true}
        onOpenChange={onOpenChange}
        parentId={null}
        siblings={siblings}
        config={defaultConfig}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    fireEvent.click(screen.getByText("common.cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls config.onReorder and closes on confirm", () => {
    const onReorder = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TreeReorderDialog
        open={true}
        onOpenChange={onOpenChange}
        parentId="parent-1"
        siblings={siblings}
        config={{ ...defaultConfig, onReorder }}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    fireEvent.click(screen.getByText("tree.confirm"));
    expect(onReorder).toHaveBeenCalledWith("parent-1", siblings);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
