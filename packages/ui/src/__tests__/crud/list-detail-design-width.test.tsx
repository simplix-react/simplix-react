// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect } from "vitest";
import React from "react";

import { ListDetail } from "../../crud/patterns/list-detail";

// A design naming its own detail width, as clarity does.
beforeEach(() => document.documentElement.style.setProperty("--detail-panel-width", "440px"));
afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty("--detail-panel-width");
});

const columns = (props: { listWidth?: number; detailWidth?: number }) => {
  const { container } = render(
    <ListDetail variant="panel" activePanel="detail" {...(props as object)}>
      <ListDetail.List>List</ListDetail.List>
      <ListDetail.Detail>Detail</ListDetail.Detail>
    </ListDetail>,
  );
  return (container.querySelector("section") as HTMLElement).style.gridTemplateColumns;
};

describe("ListDetail width under a design that names one", () => {
  it("takes the design's width only where the screen names none", () => {
    expect(columns({})).toBe("1fr 17px 440px");
  });

  it("keeps the detail width the screen passes", () => {
    expect(columns({ detailWidth: 600 })).toBe("1fr 17px 600px");
  });

  it("keeps the list width the screen passes", () => {
    expect(columns({ listWidth: 500 })).toBe("500px 17px 1fr");
  });
});
