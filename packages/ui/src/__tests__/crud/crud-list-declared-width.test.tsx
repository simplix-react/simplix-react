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
  instant: string;
  changes: string;
}

const rows: Row[] = [{ instant: "2026-08-06T03:42:00Z", changes: "분류 — → MANAGEMENT" }];

/**
 * The shape the defect needed: one column asking for exactly the table library's default size,
 * beside one that asked for a floor.
 *
 * @returns the rendered list
 */
function renderList() {
  return render(
    <CrudList.Table<Row> data={rows}>
      {/* 150 is TanStack's own default, so a size comparison cannot tell this from a column that
          declared nothing — and a column that declared nothing is the one an auto table layout
          hands its whole remainder to. */}
      <CrudList.Column<Row> field="instant" header="Instant" width={150} />
      <CrudList.Column<Row> field="changes" header="Changed" minWidth={256} />
    </CrudList.Table>,
  );
}

describe("a column's declared width", () => {
  it("pins a fixed column at exactly the width it asked for, 150 included", () => {
    renderList();
    const header = screen.getByText("Instant").closest("th");
    expect(header).not.toBeNull();
    expect(header!.style.width).toBe("150px");
    // The half that stops the auto layout spending the table's spare room here.
    expect(header!.style.maxWidth).toBe("150px");
  });

  it("leaves a flexible column its floor and nothing above it", () => {
    renderList();
    const header = screen.getByText("Changed").closest("th");
    expect(header).not.toBeNull();
    expect(header!.style.width).toBe("256px");
    expect(header!.style.maxWidth).toBe("");
  });

  it("keeps a fixed column's cell out of the table's intrinsic width, caps and all", () => {
    renderList();
    const cell = screen.getByText("2026-08-06T03:42:00Z").closest("td");
    expect(cell).not.toBeNull();
    expect(cell!.style.maxWidth).toBe("0px");
    // The release is for a column whose width can move under the reader; this one's cannot.
    expect(cell!.hasAttribute("data-column-sized")).toBe(false);
  });

  it("releases a flexible column's own caps, because its width does move", () => {
    renderList();
    const cell = screen.getByText("분류 — → MANAGEMENT").closest("td");
    expect(cell).not.toBeNull();
    expect(cell!.style.maxWidth).toBe("0px");
    expect(cell!.hasAttribute("data-column-sized")).toBe(true);
  });
});
