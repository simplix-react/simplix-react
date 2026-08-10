// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import React from "react";
import { CrudList } from "../../crud/list/crud-list";
import { MIN_COLUMN_WIDTH, KEYBOARD_STEP } from "../../crud/list/column-widths";

interface Row {
  code: string;
  name: string;
}

const rows: Row[] = [
  { code: "A-1", name: "First" },
  { code: "A-2", name: "Second" },
];

const STORE_KEY = "simplix.prefs:list-columns:probe";

/**
 * @param resizableColumns the list key, or undefined to leave the columns fixed
 * @returns the rendered list
 */
function renderList(resizableColumns?: string) {
  return render(
    <CrudList.Table<Row> data={rows} resizableColumns={resizableColumns} selectable>
      <CrudList.Column<Row> field="code" header="Code" sortable />
      <CrudList.Column<Row> field="name" header="Name" minWidth={120} />
    </CrudList.Table>,
  );
}

describe("List columns a reader can size", () => {
  beforeEach(() => localStorage.clear());

  it("grows no grab zone until a list says where widths are kept", () => {
    renderList();

    expect(screen.queryAllByRole("separator")).toHaveLength(0);
  });

  it("gives every field column a grab zone and the selection box none", () => {
    renderList("probe");

    // Two field columns; the selection box is the third header and carries no handle, because
    // it is as wide as its checkbox and no wider.
    expect(screen.getAllByRole("separator")).toHaveLength(2);
  });

  it("opens at the width the reader left, not at the one the screen declared", () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ name: 300 }));

    renderList("probe");

    const header = screen.getByText("Name").closest("th") as HTMLElement;
    // All three, because an auto-layout table treats width alone as a suggestion and hands back
    // the content's width instead.
    expect(header.style.width).toBe("300px");
    expect(header.style.minWidth).toBe("300px");
    expect(header.style.maxWidth).toBe("300px");
  });

  it("moves an edge with the arrow keys and keeps where it landed", () => {
    renderList("probe");

    const handle = screen.getAllByRole("separator")[1];
    fireEvent.keyDown(handle, { key: "ArrowRight" });

    const stored = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
    expect(Object.keys(stored)).toEqual(["name"]);
    expect(stored.name).toBeGreaterThanOrEqual(MIN_COLUMN_WIDTH);
    // jsdom lays nothing out, so the measured cell is 0 wide and the floor is what survives the
    // step. What this pins is that a key press commits a width at all, keyed by the field.
    expect(stored.name).toBe(Math.max(MIN_COLUMN_WIDTH, KEYBOARD_STEP));
  });

  it("gives a column back to the screen on Home, leaving nothing stored", () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ name: 300 }));
    renderList("probe");

    fireEvent.keyDown(screen.getAllByRole("separator")[1], { key: "Home" });

    expect(localStorage.getItem(STORE_KEY)).toBeNull();
  });

  it("keys the width by field so inserting a column does not move it to the neighbour", () => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ name: 300 }));

    render(
      <CrudList.Table<Row> data={rows} resizableColumns="probe">
        <CrudList.Column<Row> field="inserted" header="Inserted" />
        <CrudList.Column<Row> field="code" header="Code" />
        <CrudList.Column<Row> field="name" header="Name" />
      </CrudList.Table>,
    );

    expect((screen.getByText("Name").closest("th") as HTMLElement).style.width).toBe("300px");
    expect((screen.getByText("Inserted").closest("th") as HTMLElement).style.width).not.toBe("300px");
  });
});
