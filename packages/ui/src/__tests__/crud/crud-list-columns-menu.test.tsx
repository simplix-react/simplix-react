// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: "en", exists: () => true }),
  useLocale: () => "en",
}));

let mockContainerWidth = 1200;
vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => mockContainerWidth,
}));

import type { CrudListFilters } from "../../crud/list/use-crud-list";
import { FilterBar } from "../../crud/filters/filter-bar";
import { CrudList } from "../../crud/list/crud-list";

afterEach(() => {
  cleanup();
  mockContainerWidth = 1200;
});

const state: CrudListFilters = {
  search: "",
  values: {},
  committedValues: {},
  setSearch: vi.fn(),
  setValue: vi.fn(),
  setValues: vi.fn(),
  commitValue: vi.fn(),
  commitValues: vi.fn(),
  setAll: vi.fn(),
  clear: vi.fn(),
  apply: vi.fn(),
  isPending: false,
};

const data = [{ id: 1, name: "Alice", email: "alice@example.test", note: "kept" }];

const list = () => (
  <CrudList>
    <FilterBar filters={[]} state={state} />
    <CrudList.Table data={data}>
      <CrudList.Column field="name" header="Name" />
      <CrudList.Column field="email" header="Email" minTableWidth={800} />
      <CrudList.Column field="note" header="Note" minTableWidth={1000} />
    </CrudList.Table>
  </CrudList>
);

/** A computed column has no field, so it is known by its id. */
const computedList = () => (
  <CrudList>
    <FilterBar filters={[]} state={state} />
    <CrudList.Table data={data}>
      <CrudList.Column field="name" header="Name" />
      <CrudList.Column<(typeof data)[number]> id="contact" header="Contact" minTableWidth={800}>
        {({ row }) => `${row.name} <${row.email}>`}
      </CrudList.Column>
    </CrudList.Table>
  </CrudList>
);

function openMenu() {
  fireEvent.keyDown(screen.getByLabelText("list.toggleColumns"), { key: "Enter" });
}

describe("the columns menu", () => {
  it("offers every declared column, with the ones the width dropped unchecked", () => {
    mockContainerWidth = 520;
    render(list());
    // Neither tiered column is drawn at this width.
    expect(screen.queryByText("alice@example.test")).toBeNull();
    openMenu();
    const items = screen.getAllByRole("menuitemcheckbox");
    expect(items.map((item) => item.textContent)).toEqual(["Name", "Email", "Note"]);
    expect(items.map((item) => item.getAttribute("aria-checked"))).toEqual(["true", "false", "false"]);
  });

  it("draws a dropped column once the reader switches it on, and hands it back when switched off", () => {
    mockContainerWidth = 520;
    render(list());
    openMenu();
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Email" }));
    expect(screen.getByText("alice@example.test")).toBeTruthy();
    // Only the column asked for is brought back.
    expect(screen.queryByText("kept")).toBeNull();
    openMenu();
    expect(screen.getByRole("menuitemcheckbox", { name: "Email" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Email" }));
    expect(screen.queryByText("alice@example.test")).toBeNull();
  });

  it("lists a drawn column checked and lets the reader hide it", () => {
    mockContainerWidth = 1200;
    render(list());
    openMenu();
    expect(screen.getAllByRole("menuitemcheckbox").map((item) => item.getAttribute("aria-checked"))).toEqual(["true", "true", "true"]);
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Email" }));
    expect(screen.queryByText("alice@example.test")).toBeNull();
    expect(screen.getByText("kept")).toBeTruthy();
  });

  it("offers a column that has no field by its id, and draws it when switched on at a narrow width", () => {
    mockContainerWidth = 520;
    render(computedList());
    expect(screen.queryByText("Alice <alice@example.test>")).toBeNull();
    openMenu();
    expect(screen.getAllByRole("menuitemcheckbox").map((item) => `${item.textContent}:${item.getAttribute("aria-checked")}`)).toEqual(["Name:true", "Contact:false"]);
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Contact" }));
    expect(screen.getByText("Alice <alice@example.test>")).toBeTruthy();
  });
});
