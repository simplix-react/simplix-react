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

import React from "react";
import { DraggableCard } from "../../crud/reorder/draggable-card";

interface TestItem {
  id: string;
  name: string;
}

describe("DraggableCard", () => {
  const item: TestItem = { id: "1", name: "Alice" };
  const config = {
    orderField: "displayOrder" as string,
    idField: "id" as keyof TestItem & string,
    onReorder: vi.fn(),
  };

  it("renders card with title and content", () => {
    render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
        cardTitle={<span>Title: Alice</span>}
        cardContent={<span>Content here</span>}
      />,
    );
    expect(screen.getByText("Title: Alice")).toBeTruthy();
    expect(screen.getByText("Content here")).toBeTruthy();
  });

  it("renders with data-testid", () => {
    const { container } = render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
        cardTitle={<span>Title</span>}
      />,
    );
    expect(container.querySelector("[data-testid='list-row-1']")).toBeTruthy();
  });

  it("renders drag handle", () => {
    render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
        cardTitle={<span>Title</span>}
      />,
    );
    expect(screen.getByTestId("drag-handle")).toBeTruthy();
  });

  it("applies active style", () => {
    const { container } = render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isActive={true}
        isDragEnabled={true}
        reorderConfig={config}
        cardTitle={<span>Title</span>}
      />,
    );
    const card = container.querySelector("[data-testid='list-row-1']");
    expect(card?.className).toContain("bg-muted/50");
  });

  it("applies selected style", () => {
    const { container } = render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isSelected={true}
        isDragEnabled={true}
        reorderConfig={config}
        cardTitle={<span>Title</span>}
      />,
    );
    const card = container.querySelector("[data-testid='list-row-1']");
    expect(card?.className).toContain("ring-2");
  });

  it("calls onRowClick when clicked", () => {
    const onRowClick = vi.fn();
    render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
        onRowClick={onRowClick}
        cardTitle={<span>Title</span>}
      />,
    );
    fireEvent.click(screen.getByTestId("list-row-1"));
    expect(onRowClick).toHaveBeenCalledWith(item);
  });

  it("renders checkbox when selectable", () => {
    render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
        selectable
        isSelected={false}
        onSelectionChange={vi.fn()}
        cardTitle={<span>Title</span>}
      />,
    );
    expect(screen.getByLabelText("Select row 1")).toBeTruthy();
  });

  it("calls onSelectionChange when checkbox is clicked", () => {
    const onSelectionChange = vi.fn();
    render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
        selectable
        isSelected={false}
        onSelectionChange={onSelectionChange}
        cardTitle={<span>Title</span>}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select row 1"));
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it("renders card actions", () => {
    render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
        cardTitle={<span>Title</span>}
        cardActions={<button>Edit</button>}
      />,
    );
    expect(screen.getByText("Edit")).toBeTruthy();
  });

  it("renders nothing when no cardTitle or cardContent", () => {
    const { container } = render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={config}
      />,
    );
    // Only the outer div is rendered, no title or content areas
    expect(container.querySelector("[data-testid='list-row-1']")).toBeTruthy();
    expect(container.querySelector(".border-b")).toBeNull();
  });

  it("disables drag when canDrag returns false", () => {
    render(
      <DraggableCard
        row={item}
        rowId="1"
        index={0}
        isDragEnabled={true}
        reorderConfig={{ ...config, canDrag: () => false }}
        cardTitle={<span>Title</span>}
      />,
    );
    const handle = screen.getByTestId("drag-handle");
    expect(handle.getAttribute("data-disabled")).toBe("true");
  });
});
