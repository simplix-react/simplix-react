// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

// Table mode rather than cards: the cells under test are table cells.
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => 1200,
}));

import React, { useEffect, useState } from "react";
import { CrudList } from "../../crud/list/crud-list";
import { CrudTree } from "../../crud/tree/crud-tree";

interface Item {
  id: string;
  name: string;
  children: Item[];
}

const items: Item[] = [
  { id: "1", name: "Alpha", children: [] },
  { id: "2", name: "Beta", children: [] },
];

let mounts: Record<string, number> = {};
let unmounts: Record<string, number> = {};

beforeEach(() => {
  mounts = {};
  unmounts = {};
});

/**
 * A cell body that remembers being mounted and holds state of its own.
 *
 * <p>A remount shows three ways at once: the mount count climbs, the element is a new node, and
 * the click count starts over. The label is the part the parent is expected to change.
 */
function Probe({ id, label }: { id: string; label: string }) {
  const [clicks, setClicks] = useState(0);
  useEffect(() => {
    mounts[id] = (mounts[id] ?? 0) + 1;
    return () => {
      unmounts[id] = (unmounts[id] ?? 0) + 1;
    };
  }, [id]);
  return (
    <button type="button" data-testid={id} onClick={() => setClicks((c) => c + 1)}>
      {label}:{clicks}
    </button>
  );
}

/**
 * A screen whose parent re-renders on a tick, as a live screen does several times a second.
 *
 * <p>Each render declares its columns afresh, which is what a JSX child list always does.
 */
function ListScreen({ field = "name", withColumn = true }: { field?: "name" | "id"; withColumn?: boolean }) {
  const [tick, setTick] = useState(0);
  return (
    <>
      <button type="button" data-testid="tick" onClick={() => setTick((t) => t + 1)}>
        tick
      </button>
      <CrudList>
        <CrudList.Table
          data={items}
          selectable
          selectedIndices={new Set<number>()}
          onSelectionChange={() => {}}
          onSelectAll={() => {}}
          sort={{ field: "name", direction: "asc" }}
          onSortChange={() => {}}
          slots={{
            rowActions: ({ row }) => <Probe id={`action-${row.id}`} label={`act-${tick}`} />,
          }}
        >
          {withColumn && (
            <CrudList.Column<Item> field={field} header="Name" sortable>
              {({ row }) => <Probe id={`${field}-${row.id}`} label={`${row.name}-${tick}`} />}
            </CrudList.Column>
          )}
          <CrudList.Column<Item> field="children" header="Other" />
        </CrudList.Table>
      </CrudList>
    </>
  );
}

function tick() {
  act(() => {
    fireEvent.click(screen.getByTestId("tick"));
  });
}

describe("CrudList.Table cell identity across parent renders", () => {
  it("keeps a column's cell mounted while the parent re-renders", () => {
    render(<ListScreen />);
    const before = screen.getByTestId("name-1");
    fireEvent.click(before);
    expect(before.textContent).toBe("Alpha-0:1");

    tick();
    tick();
    tick();

    const after = screen.getByTestId("name-1");
    expect(after).toBe(before);
    expect(mounts["name-1"]).toBe(1);
    expect(unmounts["name-1"]).toBeUndefined();
    // The cell's own state survives, and the parent's new output reaches it.
    expect(after.textContent).toBe("Alpha-3:1");
  });

  it("keeps the row action cell mounted while the parent re-renders", () => {
    render(<ListScreen />);
    const before = screen.getByTestId("action-2");

    tick();
    tick();

    expect(screen.getByTestId("action-2")).toBe(before);
    expect(mounts["action-2"]).toBe(1);
    expect(before.textContent).toBe("act-2:0");
  });

  it("keeps the sort header and the selection boxes as the same nodes", () => {
    const { container } = render(<ListScreen />);
    const sortButton = container.querySelector("thead button");
    const selectAll = container.querySelector("thead input[type=checkbox]");
    const selectRow = container.querySelector("tbody input[type=checkbox]");
    expect(sortButton).not.toBeNull();
    expect(selectAll).not.toBeNull();
    expect(selectRow).not.toBeNull();

    tick();

    expect(container.querySelector("thead button")).toBe(sortButton);
    expect(container.querySelector("thead input[type=checkbox]")).toBe(selectAll);
    expect(container.querySelector("tbody input[type=checkbox]")).toBe(selectRow);
  });

  it("gives a column a fresh cell when its id changes", () => {
    const { rerender } = render(<ListScreen field="name" />);
    expect(mounts["name-1"]).toBe(1);

    rerender(<ListScreen field="id" />);

    expect(unmounts["name-1"]).toBe(1);
    expect(screen.queryByTestId("name-1")).toBeNull();
    expect(mounts["id-1"]).toBe(1);
  });

  it("unmounts a column's cell when the column is removed", () => {
    const { rerender } = render(<ListScreen withColumn />);
    expect(mounts["name-1"]).toBe(1);

    rerender(<ListScreen withColumn={false} />);

    expect(unmounts["name-1"]).toBe(1);
    expect(screen.queryByTestId("name-1")).toBeNull();
    // The column that stayed keeps its header.
    expect(screen.getByText("Other")).toBeTruthy();
  });
});

function TreeScreen() {
  const [tick, setTick] = useState(0);
  return (
    <>
      <button type="button" data-testid="tick" onClick={() => setTick((t) => t + 1)}>
        tick
      </button>
      <CrudTree>
        <CrudTree.Table data={items}>
          <CrudTree.Column<Item> field="name" header="Name">
            {({ row }) => <Probe id={`tree-${row.id}`} label={`${row.name}-${tick}`} />}
          </CrudTree.Column>
        </CrudTree.Table>
      </CrudTree>
    </>
  );
}

describe("CrudTree.Table cell identity across parent renders", () => {
  it("keeps a tree cell mounted while the parent re-renders", () => {
    render(<TreeScreen />);
    const before = screen.getByTestId("tree-1");
    fireEvent.click(before);

    tick();
    tick();

    const after = screen.getByTestId("tree-1");
    expect(after).toBe(before);
    expect(mounts["tree-1"]).toBe(1);
    expect(after.textContent).toBe("Alpha-2:1");
  });
});
