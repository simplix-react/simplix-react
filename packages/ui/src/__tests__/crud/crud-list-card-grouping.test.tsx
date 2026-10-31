// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

// A phone-width container, below the card breakpoint the test passes: the rows are cards.
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => 360,
}));

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

interface Rank {
  id: number;
  name: string;
  band: string;
}

const ranks: Rank[] = [
  { id: 1, name: "CEO", band: "executive" },
  { id: 2, name: "Lead", band: "management" },
  { id: 3, name: "Advisor", band: "executive" },
];

describe("CrudList.Table grouping in card mode", () => {
  it("draws the group headings above the cards, so a phone keeps the bands a wide list shows", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table
          data={ranks}
          rowId={(row: Rank) => String(row.id)}
          cardBreakpoint={600}
          cardTitle={({ row }: { row: Rank }) => <span>{row.name}</span>}
          cardContent={() => null}
          groupBy={{ of: (row: Rank) => row.band, order: ["executive", "management"] }}
        >
          <CrudList.Column<Rank> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );

    expect(container.querySelector("table")).toBeNull();
    const drawn = [...container.querySelectorAll("[data-testid^=list-group-], [data-testid^=list-row-]")].map((el) =>
      el.getAttribute("data-testid")?.startsWith("list-group-") ? `# ${el.textContent?.trim()}` : (el.textContent?.trim() ?? ""),
    );
    expect(drawn).toEqual(["# executive", "CEO", "Advisor", "# management", "Lead"]);
  });
});
