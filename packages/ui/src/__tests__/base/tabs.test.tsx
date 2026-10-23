// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../base/navigation/tabs";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

describe("Tabs", () => {
  it("renders with default value", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Content 1")).toBeDefined();
  });

  it("renders correct active/inactive states", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Tab 1").getAttribute("data-state")).toBe("active");
    expect(screen.getByText("Tab 2").getAttribute("data-state")).toBe("inactive");
  });

  it("renders controlled value correctly", () => {
    render(
      <Tabs value="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">C1</TabsContent>
        <TabsContent value="tab2">C2</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Tab 2").getAttribute("data-state")).toBe("active");
    expect(screen.getByText("Tab 1").getAttribute("data-state")).toBe("inactive");
  });
});

describe("TabsList", () => {
  it("applies default variant (inline)", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector("[role='tablist']") as HTMLElement;
    expect(drawnClasses(list)).toContain("inline-flex");
  });

  it("applies full variant", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList variant="full">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector("[role='tablist']") as HTMLElement;
    expect(drawnClasses(list)).toContain("w-full");
    expect(drawnClasses(list)).toContain("mt-3");
  });

  it("applies bookmark variant", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList variant="bookmark">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector("[role='tablist']") as HTMLElement;
    // bottom line is an inset shadow (scroll-safe), not a border
    expect(drawnClasses(list)).toContain("shadow-[inset_0_-2px_0_0_var(--border)]");
    expect(drawnClasses(list)).toContain("items-end");
    // bookmark list drops the segmented-track background
    expect(drawnClasses(list)).not.toContain("bg-muted");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList className="my-list">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector("[role='tablist']") as HTMLElement;
    expect(drawnClasses(list)).toContain("my-list");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList ref={ref}>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("TabsTrigger", () => {
  it("renders a tab button", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const tab = screen.getByRole("tab");
    expect(tab).toBeDefined();
    expect(tab.tagName).toBe("BUTTON");
  });

  it("applies active state styling", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const activeTab = screen.getByText("A");
    expect(activeTab.getAttribute("data-state")).toBe("active");
    const inactiveTab = screen.getByText("B");
    expect(inactiveTab.getAttribute("data-state")).toBe("inactive");
  });

  it("merges custom className", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" className="my-trigger">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const tab = screen.getByRole("tab");
    expect(drawnClasses(tab)).toContain("my-trigger");
  });

  it("adapts styling to the bookmark list variant via context", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList variant="bookmark">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const tab = screen.getByRole("tab");
    // folder-shaped trigger: top-rounded, no bottom border
    expect(drawnClasses(tab)).toContain("rounded-t-lg");
    expect(drawnClasses(tab)).toContain("border-b-0");
    // segmented-control trigger classes are not applied in bookmark mode
    expect(drawnClasses(tab)).not.toContain("rounded-md");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger ref={ref} value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("supports disabled state", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const disabledTab = screen.getByText("B");
    expect(disabledTab).toHaveProperty("disabled", true);
  });
});

describe("TabsContent", () => {
  it("renders content for active tab", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Active Content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Active Content")).toBeDefined();
  });

  it("applies padded class when padded=true", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" padded>Padded</TabsContent>
      </Tabs>,
    );
    const content = screen.getByRole("tabpanel");
    // `py-4`, not the `pt-4 pb-8` this asserted before. A panel's top and bottom insets were once
    // set apart to keep the last row off the scroll container's edge; they are the same step now,
    // and the extra space under a panel comes from whatever the panel holds.
    expect(drawnClasses(content)).toContain("py-4");
  });

  it("does not apply padded class by default", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content</TabsContent>
      </Tabs>,
    );
    const content = screen.getByRole("tabpanel");
    expect(drawnClasses(content)).not.toContain("py-4");
  });

  it("merges custom className", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="my-content">Content</TabsContent>
      </Tabs>,
    );
    const content = screen.getByRole("tabpanel");
    expect(drawnClasses(content)).toContain("my-content");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent ref={ref} value="a">Content</TabsContent>
      </Tabs>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

});
