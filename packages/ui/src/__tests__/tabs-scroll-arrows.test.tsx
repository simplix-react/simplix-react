// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Tabs, TabsList, TabsTrigger } from "../base/navigation/tabs";

/** A ResizeObserver that fires only for the elements it was asked to observe. */
class FakeResizeObserver {
  static all: FakeResizeObserver[] = [];
  readonly targets = new Set<Element>();
  constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.all.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
  static resize(target: Element) {
    for (const observer of FakeResizeObserver.all) {
      if (observer.targets.has(target)) observer.callback([], observer as unknown as ResizeObserver);
    }
  }
}

describe("TabsList scrollArrows", () => {
  const original = globalThis.ResizeObserver;
  beforeEach(() => {
    FakeResizeObserver.all = [];
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  });
  afterEach(() => {
    cleanup();
    globalThis.ResizeObserver = original;
  });

  it("shows the arrow when a tab grows inside a strip whose own width does not change", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList scrollArrows>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const strip = screen.getByRole("tablist");
    expect(screen.queryByRole("button", { name: /next/i })).toBeNull();
    // The strip keeps its 300px box; the second tab grows past it.
    Object.defineProperty(strip, "clientWidth", { configurable: true, value: 300 });
    Object.defineProperty(strip, "scrollWidth", { configurable: true, value: 420 });
    act(() => FakeResizeObserver.resize(screen.getByRole("tab", { name: "B" })));
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });
});
