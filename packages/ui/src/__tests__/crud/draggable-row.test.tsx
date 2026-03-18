// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

// Mock @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: { role: "button" },
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

// Mock drag-handle
vi.mock("../../crud/reorder/drag-handle", () => ({
  DragHandleCell: ({ disabled }: { disabled: boolean }) => (
    <span data-testid="drag-handle" data-disabled={disabled}>grip</span>
  ),
}));

// Mock @tanstack/react-table flexRender
vi.mock("@tanstack/react-table", () => ({
  flexRender: (content: unknown) => {
    if (typeof content === "function") return content();
    return content;
  },
}));

import React from "react";
import { DraggableRow } from "../../crud/reorder/draggable-row";

interface TestItem {
  id: string;
  name: string;
}

function createMockRow(item: TestItem, index: number) {
  return {
    id: `row-${index}`,
    original: item,
    index,
    getVisibleCells: () => [
      {
        id: `cell-name-${index}`,
        column: {
          columnDef: {
            cell: () => <span>{item.name}</span>,
          },
        },
        getContext: () => ({}),
      },
    ],
  };
}

describe("DraggableRow", () => {
  const item: TestItem = { id: "1", name: "Alice" };
  const config = {
    orderField: "displayOrder" as string,
    idField: "id" as keyof TestItem & string,
    onReorder: vi.fn(),
  };

  it("renders a table row with drag handle", () => {
    const row = createMockRow(item, 0);
    render(
      <table>
        <tbody>
          <DraggableRow
            row={row as never}
            rowId="1"
            isDragEnabled={true}
            reorderConfig={config}
          />
        </tbody>
      </table>,
    );
    expect(screen.getByTestId("drag-handle")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("renders with data-testid", () => {
    const row = createMockRow(item, 0);
    const { container } = render(
      <table>
        <tbody>
          <DraggableRow
            row={row as never}
            rowId="1"
            isDragEnabled={true}
            reorderConfig={config}
          />
        </tbody>
      </table>,
    );
    expect(container.querySelector("[data-testid='list-row-1']")).toBeTruthy();
  });

  it("applies active style", () => {
    const row = createMockRow(item, 0);
    const { container } = render(
      <table>
        <tbody>
          <DraggableRow
            row={row as never}
            rowId="1"
            isActive={true}
            isDragEnabled={true}
            reorderConfig={config}
          />
        </tbody>
      </table>,
    );
    const tr = container.querySelector("tr");
    expect(tr?.className).toContain("bg-muted/50");
  });

  it("applies selected style", () => {
    const row = createMockRow(item, 0);
    const { container } = render(
      <table>
        <tbody>
          <DraggableRow
            row={row as never}
            rowId="1"
            isSelected={true}
            isDragEnabled={true}
            reorderConfig={config}
          />
        </tbody>
      </table>,
    );
    const tr = container.querySelector("tr");
    expect(tr?.className).toContain("bg-muted/30");
  });

  it("calls onRowClick when clicked", () => {
    const onRowClick = vi.fn();
    const row = createMockRow(item, 0);
    const { container } = render(
      <table>
        <tbody>
          <DraggableRow
            row={row as never}
            rowId="1"
            isDragEnabled={true}
            reorderConfig={config}
            onRowClick={onRowClick}
          />
        </tbody>
      </table>,
    );
    fireEvent.click(container.querySelector("tr")!);
    expect(onRowClick).toHaveBeenCalledWith(item);
  });

  it("disables drag handle when canDrag returns false", () => {
    const row = createMockRow(item, 0);
    render(
      <table>
        <tbody>
          <DraggableRow
            row={row as never}
            rowId="1"
            isDragEnabled={true}
            reorderConfig={{ ...config, canDrag: () => false }}
          />
        </tbody>
      </table>,
    );
    const handle = screen.getByTestId("drag-handle");
    expect(handle.getAttribute("data-disabled")).toBe("true");
  });
});
