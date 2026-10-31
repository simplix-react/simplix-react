// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

import { ListDetail, type ListDetailVariant } from "../../crud/patterns/list-detail";

/** jsdom's window is 1024 wide, so a drawer has 960 and a dialog 992 of room. */
const WINDOW_WIDTH = 1024;

beforeEach(() => {
  vi.stubGlobal("innerWidth", WINDOW_WIDTH);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

interface Handlers {
  onDetailWidthChange?: (width: number) => void;
  onDetailWidthReset?: () => void;
}

function tree(variant: ListDetailVariant, handlers: Handlers = {}, extra: { detailWidth?: number; minDetailWidth?: number; maxDetailWidth?: number } = {}) {
  return (
    <ListDetail variant={variant} activePanel="detail" detailWidth={600} minDetailWidth={400} maxDetailWidth={800} {...extra} {...handlers}>
      <ListDetail.List>List</ListDetail.List>
      <ListDetail.Detail>Detail</ListDetail.Detail>
    </ListDetail>
  );
}

const handle = () => screen.getByRole("separator", { hidden: true });
const widthOf = () => Number(handle().getAttribute("aria-valuenow"));

for (const variant of ["panel", "drawer", "dialog"] as const) {
  describe(`ListDetail resize handle (${variant})`, () => {
    it("is a vertical separator that states its width and both bounds", () => {
      render(tree(variant));
      expect(handle().getAttribute("aria-orientation")).toBe("vertical");
      expect(handle().getAttribute("aria-valuenow")).toBe("600");
      expect(handle().getAttribute("aria-valuemin")).toBe("400");
      expect(handle().getAttribute("aria-valuemax")).toBe("800");
      expect(handle().getAttribute("aria-label")).toBeTruthy();
      expect(handle().tabIndex).toBe(0);
    });

    it("is hidden on a phone-sized window", () => {
      render(tree(variant));
      expect(handle().className).toContain("max-md:hidden");
    });

    it("moves by 20px per arrow key, 80px with Shift, and reports each width", () => {
      const onDetailWidthChange = vi.fn();
      render(tree(variant, { onDetailWidthChange }));
      // A dialog's handle sits on its right edge, so the right arrow widens it; the others sit on the left.
      const widen = variant === "dialog" ? "ArrowRight" : "ArrowLeft";
      const narrow = variant === "dialog" ? "ArrowLeft" : "ArrowRight";
      fireEvent.keyDown(handle(), { key: widen });
      expect(widthOf()).toBe(620);
      fireEvent.keyDown(handle(), { key: widen, shiftKey: true });
      expect(widthOf()).toBe(700);
      fireEvent.keyDown(handle(), { key: narrow });
      expect(widthOf()).toBe(680);
      expect(onDetailWidthChange.mock.calls.map(([width]) => width)).toEqual([620, 700, 680]);
    });

    it("goes to the bounds with Home and End and never past them", () => {
      render(tree(variant));
      const widen = variant === "dialog" ? "ArrowRight" : "ArrowLeft";
      const narrow = variant === "dialog" ? "ArrowLeft" : "ArrowRight";
      fireEvent.keyDown(handle(), { key: "End" });
      expect(widthOf()).toBe(800);
      fireEvent.keyDown(handle(), { key: widen });
      expect(widthOf()).toBe(800);
      fireEvent.keyDown(handle(), { key: "Home" });
      expect(widthOf()).toBe(400);
      fireEvent.keyDown(handle(), { key: narrow, shiftKey: true });
      expect(widthOf()).toBe(400);
    });

    it("follows the pointer, and reports the width once the drag ends", () => {
      const onDetailWidthChange = vi.fn();
      render(tree(variant, { onDetailWidthChange }));
      // Pointer travel per px of width: a dialog's two edges move together.
      const perPx = variant === "dialog" ? 2 : 1;
      const toward = variant === "dialog" ? 1 : -1;
      fireEvent.pointerDown(handle(), { clientX: 500, pointerId: 1 });
      fireEvent.pointerMove(handle(), { clientX: 500 + toward * 50 });
      expect(widthOf()).toBe(600 + 50 * perPx);
      fireEvent.pointerMove(handle(), { clientX: 500 + toward * 60 });
      expect(widthOf()).toBe(600 + 60 * perPx);
      expect(onDetailWidthChange).not.toHaveBeenCalled();
      fireEvent.pointerUp(handle());
      expect(onDetailWidthChange).toHaveBeenCalledTimes(1);
      expect(onDetailWidthChange).toHaveBeenCalledWith(600 + 60 * perPx);
    });

    it("holds at the bounds while the pointer keeps going", () => {
      render(tree(variant));
      const toward = variant === "dialog" ? 1 : -1;
      fireEvent.pointerDown(handle(), { clientX: 500, pointerId: 1 });
      fireEvent.pointerMove(handle(), { clientX: 500 + toward * 900 });
      expect(widthOf()).toBe(800);
      fireEvent.pointerMove(handle(), { clientX: 500 - toward * 900 });
      expect(widthOf()).toBe(400);
      fireEvent.pointerUp(handle());
      expect(widthOf()).toBe(400);
    });

    it("moves nothing when a pointer moves over it without a press", () => {
      render(tree(variant));
      fireEvent.pointerMove(handle(), { clientX: 100 });
      expect(widthOf()).toBe(600);
    });

    it("returns to the width it opened at on a double press, and says so", () => {
      const onDetailWidthReset = vi.fn();
      render(tree(variant, { onDetailWidthReset }));
      fireEvent.keyDown(handle(), { key: "End" });
      expect(widthOf()).toBe(800);
      fireEvent.doubleClick(handle());
      expect(widthOf()).toBe(600);
      expect(onDetailWidthReset).toHaveBeenCalledTimes(1);
    });

    it("draws an opened width that is out of bounds at the nearest bound", () => {
      const { unmount } = render(tree(variant, {}, { detailWidth: 900 }));
      expect(widthOf()).toBe(800);
      unmount();
      render(tree(variant, {}, { detailWidth: 300 }));
      expect(widthOf()).toBe(400);
    });

    it("draws a minimum that contradicts the maximum at the maximum", () => {
      render(tree(variant, {}, { minDetailWidth: 500, maxDetailWidth: 450 }));
      expect(widthOf()).toBe(450);
      expect(handle().getAttribute("aria-valuemin")).toBe("450");
      expect(handle().getAttribute("aria-valuemax")).toBe("450");
    });
  });
}

describe("ListDetail drawer width", () => {
  it("draws the sheet at the detail's width, and follows the handle", () => {
    render(tree("drawer"));
    const sheet = screen.getByRole("dialog");
    expect(sheet.style.width).toBe("600px");
    fireEvent.keyDown(handle(), { key: "ArrowLeft", shiftKey: true });
    expect(sheet.style.width).toBe("680px");
    expect(sheet.style.maxWidth).toBe("680px");
  });

  it("stops short of the window, leaving a strip of the list to press", () => {
    render(tree("drawer", {}, { maxDetailWidth: 2000 }));
    expect(handle().getAttribute("aria-valuemax")).toBe(String(WINDOW_WIDTH - 64));
    fireEvent.keyDown(handle(), { key: "End" });
    expect(widthOf()).toBe(WINDOW_WIDTH - 64);
  });

  it("lets the room beat the product's minimum in a narrow window, down to the framework's floor", () => {
    vi.stubGlobal("innerWidth", 600);
    render(tree("drawer", {}, { minDetailWidth: 480 }));
    // 600 less the margin is 536, so the minimum of 480 still holds; at 400 only 336 remains.
    expect(handle().getAttribute("aria-valuemin")).toBe("480");
    cleanup();
    vi.stubGlobal("innerWidth", 400);
    render(tree("drawer", {}, { minDetailWidth: 480 }));
    expect(handle().getAttribute("aria-valuemax")).toBe("336");
    expect(handle().getAttribute("aria-valuemin")).toBe("336");
    cleanup();
    vi.stubGlobal("innerWidth", 300);
    render(tree("drawer", {}, { minDetailWidth: 480 }));
    expect(handle().getAttribute("aria-valuemax")).toBe("280");
  });

  it("follows the window as it narrows", () => {
    render(tree("drawer", {}, { maxDetailWidth: 2000 }));
    fireEvent.keyDown(handle(), { key: "End" });
    act(() => {
      vi.stubGlobal("innerWidth", 800);
      window.dispatchEvent(new Event("resize"));
    });
    expect(widthOf()).toBe(736);
  });

  it("takes the focus last, so the detail's own first control receives the one the drawer moves in", () => {
    render(
      <ListDetail variant="drawer" activePanel="detail">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>
          <button type="button">First control</button>
        </ListDetail.Detail>
      </ListDetail>,
    );
    const sheet = screen.getByRole("dialog");
    const order = Array.from(sheet.querySelectorAll("button, [tabindex='0']"));
    expect(order[0]?.textContent).toBe("First control");
    expect(order[order.length - 1]).toBe(handle());
  });
});

describe("ListDetail dialog edges", () => {
  const edges = () => Array.from(document.querySelectorAll<HTMLElement>("[data-grows]"));

  it("draws a handle on each side edge, and only the right one is a control for the keyboard", () => {
    render(tree("dialog"));
    expect(edges().map((edge) => edge.dataset.grows)).toEqual(["left", "right"]);
    expect(screen.getAllByRole("separator", { hidden: true })).toHaveLength(1);
    const [left, right] = edges();
    expect(left?.getAttribute("role")).toBeNull();
    expect(left?.getAttribute("aria-hidden")).toBe("true");
    expect(left?.tabIndex).toBe(-1);
    expect(right?.getAttribute("role")).toBe("separator");
  });

  it("widens the dialog from the left edge too, at two px of width for each px dragged", () => {
    render(tree("dialog"));
    const [left] = edges();
    if (!left) throw new Error("no left handle");
    fireEvent.pointerDown(left, { clientX: 400, pointerId: 1 });
    fireEvent.pointerMove(left, { clientX: 360 });
    expect(widthOf()).toBe(680);
    fireEvent.pointerUp(left);
    expect(widthOf()).toBe(680);
  });

  it("takes no key press on the left edge", () => {
    render(tree("dialog"));
    const [left] = edges();
    if (!left) throw new Error("no left handle");
    fireEvent.keyDown(left, { key: "End" });
    expect(widthOf()).toBe(600);
  });
});

describe("ListDetail dialog width", () => {
  it("states the width on the dialog under a name of its own", () => {
    render(tree("dialog"));
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.getPropertyValue("--detail-open-width")).toBe("600px");
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    expect(dialog.style.getPropertyValue("--detail-open-width")).toBe("620px");
  });

  it("stops short of the window by the frame's own margin", () => {
    render(tree("dialog", {}, { maxDetailWidth: 2000 }));
    expect(handle().getAttribute("aria-valuemax")).toBe(String(WINDOW_WIDTH - 32));
  });
});

describe("ListDetail panel columns", () => {
  it("draws the detail column at the width of the handle", () => {
    const { container } = render(tree("panel"));
    const section = container.querySelector("section") as HTMLElement;
    expect(section.style.gridTemplateColumns).toBe("1fr 17px 600px");
    fireEvent.keyDown(handle(), { key: "ArrowLeft" });
    expect(section.style.gridTemplateColumns).toBe("1fr 17px 620px");
  });

  it("keeps the handle out of the tab order while the detail is closed", () => {
    render(
      <ListDetail variant="panel" activePanel="list">
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    expect(handle().tabIndex).toBe(-1);
  });

  it("moves the list's width when the list is pinned, and keeps the detail's bounds", () => {
    const { container } = render(
      <ListDetail variant="panel" activePanel="detail" listWidth={500} minDetailWidth={400} maxDetailWidth={800}>
        <ListDetail.List>List</ListDetail.List>
        <ListDetail.Detail>Detail</ListDetail.Detail>
      </ListDetail>,
    );
    const section = container.querySelector("section") as HTMLElement;
    expect(section.style.gridTemplateColumns).toBe("500px 17px 1fr");
    // jsdom has no layout, so the section's width is never measured and the list's own is not moved;
    // the detail's width is still chosen and clamped to its bounds.
    fireEvent.keyDown(handle(), { key: "End" });
    expect(widthOf()).toBe(800);
  });
});

describe("ListDetail width by presentation", () => {
  it("keeps a width chosen in one presentation out of the others", () => {
    const { rerender } = render(tree("panel"));
    fireEvent.keyDown(handle(), { key: "End" });
    expect(widthOf()).toBe(800);
    rerender(tree("drawer"));
    expect(widthOf()).toBe(600);
    fireEvent.keyDown(handle(), { key: "Home" });
    expect(widthOf()).toBe(400);
    rerender(tree("panel"));
    expect(widthOf()).toBe(800);
  });

  it("forgets only the presentation it was reset in", () => {
    const { rerender } = render(tree("panel"));
    fireEvent.keyDown(handle(), { key: "End" });
    rerender(tree("drawer"));
    fireEvent.keyDown(handle(), { key: "Home" });
    fireEvent.doubleClick(handle());
    expect(widthOf()).toBe(600);
    rerender(tree("panel"));
    expect(widthOf()).toBe(800);
  });
});

describe("ListDetail panel room", () => {
  /** A ResizeObserver the test drives, remembering what it watches. */
  class FakeResizeObserver {
    static watching: { owner: FakeResizeObserver; element: Element; report: (width: number) => void }[] = [];
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(element: Element) {
      FakeResizeObserver.watching.push({
        owner: this,
        element,
        report: (width) => this.callback([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver),
      });
    }
    disconnect() {
      FakeResizeObserver.watching = FakeResizeObserver.watching.filter((entry) => entry.owner !== this);
    }
    unobserve() {}
  }

  beforeEach(() => {
    FakeResizeObserver.watching = [];
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  it("leaves the list its minimum beside the panel, whatever the product asks of the detail", () => {
    render(tree("panel", {}, { maxDetailWidth: 2000 }));
    const section = document.querySelector("section");
    const watched = FakeResizeObserver.watching.find((entry) => entry.element === section);
    expect(watched).toBeTruthy();
    act(() => watched?.report(800));
    // 800 less the 17px divider and the list's 280.
    expect(handle().getAttribute("aria-valuemax")).toBe("503");
    fireEvent.keyDown(handle(), { key: "End" });
    expect(widthOf()).toBe(503);
  });

  it("measures the panel's section after a presentation switch from a drawer", () => {
    const { rerender } = render(tree("drawer", {}, { maxDetailWidth: 2000 }));
    rerender(tree("panel", {}, { maxDetailWidth: 2000 }));
    const section = document.querySelector("section");
    const watched = FakeResizeObserver.watching.find((entry) => entry.element === section);
    expect(watched).toBeTruthy();
    act(() => watched?.report(800));
    expect(handle().getAttribute("aria-valuemax")).toBe("503");
  });
});
