// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";

afterEach(cleanup);

import { SectionShell } from "../../crud/shared/section-shell";

describe("SectionShell", () => {
  it("renders children", () => {
    render(<SectionShell>Content inside</SectionShell>);
    expect(screen.getByText("Content inside")).toBeTruthy();
  });

  it("renders title as h3 by default", () => {
    render(<SectionShell title="My Title">Body</SectionShell>);
    const heading = screen.getByText("My Title");
    expect(heading.tagName).toBe("H3");
  });

  it("renders title as h4 when sectionTitle is provided", () => {
    render(
      <SectionShell title="Sub Title" sectionTitle="Group Title">
        Body
      </SectionShell>,
    );
    const subTitle = screen.getByText("Sub Title");
    expect(subTitle.tagName).toBe("H4");
    // sectionTitle should render as h3
    expect(screen.getByText("Group Title").tagName).toBe("H3");
  });

  it("renders description when provided", () => {
    render(
      <SectionShell title="Title" description="A helpful description">
        Body
      </SectionShell>,
    );
    expect(screen.getByText("A helpful description")).toBeTruthy();
  });

  it("renders trailing content", () => {
    render(
      <SectionShell title="Title" trailing={<span>Trailing</span>}>
        Body
      </SectionShell>,
    );
    expect(screen.getByText("Trailing")).toBeTruthy();
  });

  it("renders with card variant by default (has border and shadow)", () => {
    const { container } = render(
      <SectionShell title="Card Section">Body</SectionShell>,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("border");
    expect(section?.className).toContain("shadow");
  });

  it("renders with flat variant (no shadow)", () => {
    const { container } = render(
      <SectionShell title="Flat Section" variant="flat">
        Body
      </SectionShell>,
    );
    const section = container.querySelector("section");
    expect(section?.className).not.toContain("shadow");
  });

  it("renders with lined variant (border-l)", () => {
    const { container } = render(
      <SectionShell title="Lined Section" variant="lined">
        Body
      </SectionShell>,
    );
    // The body div should have border-l
    const body = container.querySelector(".border-l-2");
    expect(body).toBeTruthy();
  });

  it("renders collapsible toggle button when collapsible=true", () => {
    render(
      <SectionShell title="Collapsible" collapsible>
        Hidden content
      </SectionShell>,
    );
    // Should find the toggle button
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("starts open by default when collapsible", () => {
    render(
      <SectionShell title="Collapsible" collapsible>
        <span>Visible Content</span>
      </SectionShell>,
    );
    expect(screen.getByText("Visible Content")).toBeTruthy();
  });

  it("starts closed when collapsible with defaultOpen=false", () => {
    render(
      <SectionShell title="Collapsible" collapsible defaultOpen={false}>
        <span>Hidden Content</span>
      </SectionShell>,
    );
    // Content should be hidden (inside Collapsible.Content with state=closed)
    const content = screen.queryByText("Hidden Content");
    // Radix collapsible hides content via data-state attribute
    if (content) {
      const parent = content.closest("[data-state]");
      expect(parent?.getAttribute("data-state")).toBe("closed");
    }
  });

  it("applies custom className", () => {
    const { container } = render(
      <SectionShell title="Test" className="custom-class">
        Body
      </SectionShell>,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("custom-class");
  });

  it("does not render header when no title, trailing, or collapsible", () => {
    const { container } = render(<SectionShell>Body only</SectionShell>);
    // Header div with bg-muted should not exist
    const header = container.querySelector(".bg-muted\\/50");
    expect(header).toBeNull();
  });
});
