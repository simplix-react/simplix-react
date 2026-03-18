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
}

const siblings: TreeNode[] = [
  { id: "1", name: "Item A" },
  { id: "2", name: "Item B" },
  { id: "3", name: "Item C" },
];

const defaultConfig = {
  orderField: "id" as const,
  idField: "id" as const,
  onReorder: vi.fn(),
};

describe("TreeReorderDialog (extended)", () => {
  it("resets items when siblings prop changes", () => {
    const { rerender } = render(
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

    const newSiblings = [
      { id: "4", name: "Item D" },
      { id: "5", name: "Item E" },
    ];
    rerender(
      <TreeReorderDialog
        open={true}
        onOpenChange={vi.fn()}
        parentId={null}
        siblings={newSiblings}
        config={defaultConfig}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    expect(screen.getByText("Item D")).toBeTruthy();
    expect(screen.getByText("Item E")).toBeTruthy();
    expect(screen.queryByText("Item A")).toBeNull();
  });

  it("passes parentId to onReorder on confirm", () => {
    const onReorder = vi.fn();
    render(
      <TreeReorderDialog
        open={true}
        onOpenChange={vi.fn()}
        parentId="parent-42"
        siblings={siblings}
        config={{ ...defaultConfig, onReorder }}
        getDisplayName={(item: TreeNode) => item.name}
      />,
    );
    fireEvent.click(screen.getByText("tree.confirm"));
    expect(onReorder).toHaveBeenCalledWith("parent-42", expect.any(Array));
  });

  it("renders sortable items with drag handles", () => {
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
    // Each sortable item has a grip button
    const buttons = screen.getAllByRole("button");
    // At minimum, 3 grip buttons + cancel + confirm = 5
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });

  it("renders all sibling labels", () => {
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
});
