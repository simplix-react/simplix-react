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
}));

import React from "react";
import { CrudList } from "../../crud/list/crud-list";

interface Row {
  channel: string;
  status: string;
  note: string;
}

const rows: Row[] = [{ channel: "PowerPoint add-in channel", status: "ACTIVE", note: "plain text" }];

function renderList() {
  return render(
    <CrudList.Table<Row> data={rows}>
      <CrudList.Column<Row> field="channel" header="Channel" width={120} fitContent>
        {({ row }) => <span data-testid="channel-badge">{row.channel}</span>}
      </CrudList.Column>
      <CrudList.Column<Row> field="status" header="Status" width={96} display="badge" />
      <CrudList.Column<Row> field="note" header="Note" width={120} />
    </CrudList.Table>,
  );
}

describe("a column whose content is drawn whole", () => {
  it("keeps the declared width as a floor the content can widen", () => {
    renderList();
    const header = screen.getByText("Channel").closest("th");
    expect(header).not.toBeNull();
    expect(header!.style.width).toBe("120px");
    expect(header!.style.minWidth).toBe("120px");
    expect(header!.style.maxWidth).toBe("");
  });

  it("lets the cell's content reach the table's intrinsic width and never cuts it", () => {
    renderList();
    const cell = screen.getByTestId("channel-badge").closest("td");
    expect(cell).not.toBeNull();
    expect(cell!.style.maxWidth).toBe("");
    expect(cell!.className).not.toMatch(/\btruncate\b/);
    expect(cell!.className).toMatch(/\bwhitespace-nowrap\b/);
  });

  it("treats a column the list draws as badges as whole without being told", () => {
    renderList();
    const header = screen.getByText("Status").closest("th");
    expect(header!.style.maxWidth).toBe("");
    const cell = screen.getByText("ACTIVE").closest("td");
    expect(cell!.style.maxWidth).toBe("");
    expect(cell!.className).not.toMatch(/\btruncate\b/);
  });

  it("leaves a fixed text column pinned and truncating", () => {
    renderList();
    const header = screen.getByText("Note").closest("th");
    expect(header!.style.maxWidth).toBe("120px");
    const cell = screen.getByText("plain text").closest("td");
    expect(cell!.style.maxWidth).toBe("0px");
    expect(cell!.className).toMatch(/\btruncate\b/);
  });
});
