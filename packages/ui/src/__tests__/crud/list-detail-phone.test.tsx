// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { ListDetail } from "../../crud/patterns/list-detail";

/** A window whose width matches `(max-width: 767px)` when `phone` is set. */
function stubWindow(phone: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: phone && query.includes("max-width: 767px"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe("ListDetail on a phone", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  for (const variant of ["drawer", "dialog"] as const) {
    describe(`asked for ${variant}`, () => {
      beforeEach(() => stubWindow(true));

      it("opens the detail as the page, in place of the list", () => {
        const { container } = render(
          <ListDetail variant={variant} activePanel="detail">
            <ListDetail.List>List</ListDetail.List>
            <ListDetail.Detail>Detail</ListDetail.Detail>
          </ListDetail>,
        );
        expect(document.querySelector("[role='dialog']")).toBeNull();
        const detail = Array.from(container.querySelectorAll("article")).find((a) =>
          a.className.includes("order-3"),
        );
        expect(detail?.textContent).toBe("Detail");
        expect(container.querySelector("[data-panel='list']")?.className).toContain("md:order-1");
      });
    });
  }

  it("keeps the asked-for presentation on a wider window", () => {
    stubWindow(false);
    const { container } = render(
      <ListDetail variant="dialog">
        <ListDetail.List>List</ListDetail.List>
      </ListDetail>,
    );
    expect(container.querySelector("[data-panel='list']")?.className).not.toContain("md:order-1");
  });
});
