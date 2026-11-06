// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: "en", exists: () => true }),
}));

import { Table, TableBody, TableCell, TableRow } from "../../base/display/table";

afterEach(cleanup);

/** Gives the container the scroll geometry a layout engine would. */
function geometry(el: HTMLElement, scrollWidth: number, clientWidth: number, scrollLeft = 0) {
  Object.defineProperty(el, "scrollWidth", { configurable: true, get: () => scrollWidth });
  Object.defineProperty(el, "clientWidth", { configurable: true, get: () => clientWidth });
  Object.defineProperty(el, "scrollLeft", { configurable: true, get: () => scrollLeft, set: () => undefined });
}

function renderTable(props: { scrollLabel?: string } = {}) {
  const out = render(
    <Table {...props}>
      <TableBody>
        <TableRow>
          <TableCell>Cell</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  return out.container.querySelector<HTMLElement>("[data-slot=table-container]")!;
}

describe("a table that scrolls sideways", () => {
  it("is a plain box while its table fits", () => {
    const box = renderTable();
    geometry(box, 600, 600);
    act(() => {
      fireEvent.scroll(box);
    });
    expect(box.getAttribute("role")).toBeNull();
    expect(box.hasAttribute("tabindex")).toBe(false);
    expect(box.getAttribute("data-scroll-edge")).toBeNull();
  });

  it("becomes a named, focusable region with its overflowing edge marked once it overflows", () => {
    const box = renderTable();
    geometry(box, 900, 600, 0);
    act(() => {
      fireEvent.scroll(box);
    });
    expect(box.getAttribute("role")).toBe("region");
    expect(box.getAttribute("tabindex")).toBe("0");
    expect(box.getAttribute("aria-label")).toBe("table.scrollRegion");
    expect(box.getAttribute("data-scroll-edge")).toBe("end");
  });

  it("marks both edges mid-way and the start edge at the end", () => {
    const box = renderTable({ scrollLabel: "Consents" });
    geometry(box, 900, 600, 100);
    act(() => {
      fireEvent.scroll(box);
    });
    expect(box.getAttribute("data-scroll-edge")).toBe("both");
    expect(box.getAttribute("aria-label")).toBe("Consents");
    geometry(box, 900, 600, 300);
    act(() => {
      fireEvent.scroll(box);
    });
    expect(box.getAttribute("data-scroll-edge")).toBe("start");
  });
});

describe("a table whose overflow ends without a resize", () => {
  it("reads the box again when its cells change", async () => {
    const box = renderTable();
    geometry(box, 900, 600, 0);
    act(() => {
      fireEvent.scroll(box);
    });
    expect(box.getAttribute("data-scroll-edge")).toBe("end");
    // A column drops: the table now fits, and nothing scrolled or resized.
    geometry(box, 600, 600, 0);
    await act(async () => {
      box.querySelector("td")!.remove();
      await new Promise((done) => requestAnimationFrame(() => done(undefined)));
      await new Promise((done) => requestAnimationFrame(() => done(undefined)));
    });
    expect(box.getAttribute("data-scroll-edge")).toBeNull();
    expect(box.getAttribute("role")).toBeNull();
  });
});

describe("a table whose columns are still moving", () => {
  it("reads the box again once the running animations end", async () => {
    const box = renderTable();
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((done) => {
      finish = done;
    });
    const animations = [{ playState: "running", finished }];
    Object.defineProperty(box, "getAnimations", { configurable: true, value: () => animations });
    // Mid-slide the moving column pokes past the edge.
    geometry(box, 900, 600, 0);
    act(() => {
      fireEvent.scroll(box);
    });
    expect(box.getAttribute("data-scroll-edge")).toBe("end");
    // The slide ends: nothing resized, nothing changed in the cells, nothing scrolled.
    geometry(box, 600, 600, 0);
    animations.length = 0;
    await act(async () => {
      finish();
      await finished;
      await new Promise((done) => requestAnimationFrame(() => done(undefined)));
      await new Promise((done) => requestAnimationFrame(() => done(undefined)));
    });
    expect(box.getAttribute("data-scroll-edge")).toBeNull();
  });
});
