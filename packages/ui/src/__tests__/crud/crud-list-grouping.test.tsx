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

// Table mode rather than cards: grouping is a property of the table, and a narrow container
// would test the branch that has none.
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => 1200,
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
  band: string | null;
}

/**
 * A rank catalogue whose bands are deliberately not contiguous.
 *
 * <p>`director` opens the list and comes back at the end, which is what a real catalogue sorted by
 * rank number does — and it is the case that separates bucketing from drawing a heading whenever
 * the key changes. Read the second way, this data prints `director` twice.
 */
const ranks: Rank[] = [
  { id: 1, name: "대표이사", band: "director" },
  { id: 2, name: "부장", band: "manager" },
  { id: 3, name: "직장", band: "field" },
  { id: 4, name: "고문", band: "director" },
  { id: 5, name: "촉탁", band: null },
];

/** The rows and headings in the order the table draws them. */
function drawn(container: HTMLElement): string[] {
  return [...container.querySelectorAll("tbody tr")].map((row) => {
    const group = row.getAttribute("data-testid");
    return group?.startsWith("list-group-")
      ? `# ${row.textContent?.trim()}`
      : (row.querySelector("td")?.textContent?.trim() ?? "");
  });
}

describe("CrudList.Table grouping", () => {
  it("draws every row in one run per group, whatever order the rows arrive in", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table
          data={ranks}
          groupBy={{ of: (row: Rank) => row.band, order: ["director", "manager", "field"] }}
        >
          <CrudList.Column<Rank> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );

    expect(drawn(container)).toEqual([
      "# director",
      "대표이사",
      "고문",
      "# manager",
      "부장",
      "# field",
      "직장",
      "촉탁",
    ]);
  });

  it("labels a heading with what the caller says rather than with the key", () => {
    render(
      <CrudList>
        <CrudList.Table
          data={ranks}
          groupBy={{
            of: (row: Rank) => row.band,
            label: (key: string) => ({ director: "임원", manager: "관리", field: "현장" })[key],
          }}
        >
          <CrudList.Column<Rank> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(screen.getByText("임원")).toBeTruthy();
    expect(screen.getByText("관리")).toBeTruthy();
    expect(screen.getByText("현장")).toBeTruthy();
  });

  it("gives the ungrouped rows a heading only when the caller names one", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table
          data={ranks}
          groupBy={{ of: (row: Rank) => row.band, order: ["director"], ungrouped: "쓰이지 않음" }}
        >
          <CrudList.Column<Rank> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    // Named first, the rest in first appearance, the ungrouped last however the list is ordered.
    expect(drawn(container)).toEqual([
      "# director",
      "대표이사",
      "고문",
      "# manager",
      "부장",
      "# field",
      "직장",
      "# 쓰이지 않음",
      "촉탁",
    ]);
  });

  it("draws a heading for a key the caller never named rather than dropping its rows", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table data={ranks} groupBy={{ of: (row: Rank) => row.band, order: ["field"] }}>
          <CrudList.Column<Rank> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(drawn(container).filter((line) => line.startsWith("# "))).toEqual([
      "# field",
      "# director",
      "# manager",
    ]);
    expect(screen.getByText("촉탁")).toBeTruthy();
  });

  it("draws no heading at all without the prop", () => {
    const { container } = render(
      <CrudList>
        <CrudList.Table data={ranks}>
          <CrudList.Column<Rank> field="name" header="Name" />
        </CrudList.Table>
      </CrudList>,
    );
    expect(container.querySelectorAll("[data-testid^='list-group-']").length).toBe(0);
    expect(drawn(container)).toEqual(["대표이사", "부장", "직장", "고문", "촉탁"]);
  });
});
