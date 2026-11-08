// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
  useGroupedFigure: () => (figure: number | undefined) => figure?.toLocaleString("en"),
}));

vi.mock("../../crud/list/use-container-width", () => ({
  useContainerWidth: () => 1200,
}));

import { CrudList } from "../../crud/list/crud-list";

interface Row {
  id: string;
  name: string;
}

function renderEmpty(props: Partial<React.ComponentProps<typeof CrudList.Table<Row>>>) {
  return render(
    <CrudList>
      <CrudList.Table<Row> data={[]} {...props}>
        <CrudList.Column<Row> field="name" header="Name" />
      </CrudList.Table>
    </CrudList>,
  );
}

const page = {
  emptyState: { title: "No accounts yet", description: "Invite the first one" },
  filteredEmptyState: { title: "No staff accounts", description: "Clear the chip to see every account" },
};

describe("CrudList.Table empty states by reason", () => {
  it("draws the page's no-data state for no-data", () => {
    renderEmpty({ emptyReason: "no-data", ...page });
    expect(screen.getByText("No accounts yet")).toBeTruthy();
    expect(screen.queryByText("No staff accounts")).toBeNull();
  });

  it("draws the page's filtered state for no-filter instead of the framework card", () => {
    renderEmpty({ emptyReason: "no-filter", ...page });
    expect(screen.getByText("No staff accounts")).toBeTruthy();
    expect(screen.getByText("Clear the chip to see every account")).toBeTruthy();
    expect(screen.queryByText("list.noFilterTitle")).toBeNull();
    expect(screen.queryByText("No accounts yet")).toBeNull();
  });

  it("keeps the framework text for no-filter when the page declares no filtered state", () => {
    renderEmpty({ emptyReason: "no-filter", emptyState: page.emptyState });
    expect(screen.getByText("list.noFilterTitle")).toBeTruthy();
    expect(screen.queryByText("No accounts yet")).toBeNull();
  });

  it("keeps the framework card for no-search and errors whatever the page declares", () => {
    renderEmpty({ emptyReason: "no-search", ...page });
    expect(screen.getByText("list.noSearchTitle")).toBeTruthy();
    cleanup();
    renderEmpty({ emptyReason: "error", ...page });
    expect(screen.getByText("list.errorTitle")).toBeTruthy();
    expect(screen.queryByText("No staff accounts")).toBeNull();
  });

  it("lets slots.empty replace the filtered state too", () => {
    renderEmpty({
      emptyReason: "no-filter",
      ...page,
      slots: { empty: ({ reason }) => <div>custom-empty:{reason}</div> },
    });
    expect(screen.getByText("custom-empty:no-filter")).toBeTruthy();
    expect(screen.queryByText("No staff accounts")).toBeNull();
  });
});
