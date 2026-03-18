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
import { AssignmentPanel } from "../../crud/assignment/assignment-panel";

interface TestItem {
  id: string;
  name: string;
}

const testData: TestItem[] = [
  { id: "1", name: "Item A" },
  { id: "2", name: "Item B" },
];

describe("AssignmentPanel", () => {
  it("renders title and count badge", () => {
    render(
      <AssignmentPanel title="Access Levels" count={2}>
        <div>Body</div>
      </AssignmentPanel>,
    );
    expect(screen.getByText("Access Levels")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders action slot", () => {
    render(
      <AssignmentPanel title="Groups" count={0} action={<button>Add</button>}>
        <div>Body</div>
      </AssignmentPanel>,
    );
    expect(screen.getByText("Add")).toBeTruthy();
  });

  it("renders children", () => {
    render(
      <AssignmentPanel title="Test" count={0}>
        <span>Custom Content</span>
      </AssignmentPanel>,
    );
    expect(screen.getByText("Custom Content")).toBeTruthy();
  });
});

describe("AssignmentPanel.Chips", () => {
  it("renders chips for each item", () => {
    render(
      <AssignmentPanel title="Tags" count={2}>
        <AssignmentPanel.Chips
          data={testData}
          renderItem={(item) => (
            <AssignmentPanel.Chip key={item.id} label={item.name} />
          )}
        />
      </AssignmentPanel>,
    );
    expect(screen.getByText("Item A")).toBeTruthy();
    expect(screen.getByText("Item B")).toBeTruthy();
  });

  it("renders empty state when data is empty", () => {
    render(
      <AssignmentPanel title="Tags" count={0}>
        <AssignmentPanel.Chips
          data={[]}
          renderItem={() => null}
        />
      </AssignmentPanel>,
    );
    expect(screen.getByText("list.noData")).toBeTruthy();
  });

  it("renders custom empty state", () => {
    render(
      <AssignmentPanel title="Tags" count={0}>
        <AssignmentPanel.Chips
          data={[]}
          emptyState={{ title: "No tags assigned" }}
          renderItem={() => null}
        />
      </AssignmentPanel>,
    );
    expect(screen.getByText("No tags assigned")).toBeTruthy();
  });
});

describe("AssignmentPanel.Chip", () => {
  it("renders label", () => {
    render(<AssignmentPanel.Chip label="Admin" />);
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("renders icon when provided", () => {
    render(
      <AssignmentPanel.Chip label="Admin" icon={<span data-testid="icon">I</span>} />,
    );
    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  it("renders remove button when onRemove is provided", () => {
    const onRemove = vi.fn();
    render(<AssignmentPanel.Chip label="Admin" onRemove={onRemove} />);
    const removeBtn = screen.getByRole("button");
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("hides remove button when onRemove is not provided", () => {
    render(<AssignmentPanel.Chip label="Admin" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("AssignmentPanel.Table", () => {
  it("renders table with data", () => {
    render(
      <AssignmentPanel title="Levels" count={2}>
        <AssignmentPanel.Table data={testData} rowId={(r) => r.id}>
          <AssignmentPanel.Column<TestItem> field="name" header="Name" />
        </AssignmentPanel.Table>
      </AssignmentPanel>,
    );
    expect(screen.getByText("Item A")).toBeTruthy();
    expect(screen.getByText("Item B")).toBeTruthy();
  });

  it("renders empty state when data is empty", () => {
    render(
      <AssignmentPanel title="Levels" count={0}>
        <AssignmentPanel.Table data={[]} rowId={(r: TestItem) => r.id}>
          <AssignmentPanel.Column<TestItem> field="name" header="Name" />
        </AssignmentPanel.Table>
      </AssignmentPanel>,
    );
    expect(screen.getByText("list.noData")).toBeTruthy();
  });

  it("renders custom empty state", () => {
    render(
      <AssignmentPanel title="Levels" count={0}>
        <AssignmentPanel.Table
          data={[]}
          rowId={(r: TestItem) => r.id}
          emptyState={{ title: "No levels", description: "Assign some levels" }}
        >
          <AssignmentPanel.Column<TestItem> field="name" header="Name" />
        </AssignmentPanel.Table>
      </AssignmentPanel>,
    );
    expect(screen.getByText("No levels")).toBeTruthy();
  });
});
