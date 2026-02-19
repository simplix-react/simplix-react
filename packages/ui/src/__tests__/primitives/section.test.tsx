// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Section } from "../../primitives/section";

afterEach(cleanup);

describe("Section", () => {
  it("renders a <section> element", () => {
    render(<Section data-testid="sec">content</Section>);
    const el = screen.getByTestId("sec");
    expect(el.tagName).toBe("SECTION");
    expect(el.className).toContain("space-y-4");
    expect(el.textContent).toBe("content");
  });

  it("renders title as h3", () => {
    render(<Section title="My Title" />);
    const heading = screen.getByText("My Title");
    expect(heading.tagName).toBe("H3");
  });

  it("renders description as p", () => {
    render(<Section title="T" description="desc text" />);
    const desc = screen.getByText("desc text");
    expect(desc.tagName).toBe("P");
    expect(desc.className).toContain("text-muted-foreground");
  });

  it("does not render header when no title or description", () => {
    const { container } = render(
      <Section data-testid="sec">child only</Section>,
    );
    expect(container.querySelector("h3")).toBeNull();
    expect(container.querySelector("p")).toBeNull();
  });

  it("merges custom className", () => {
    render(<Section data-testid="sec" className="extra" />);
    const classes = screen.getByTestId("sec").className;
    expect(classes).toContain("space-y-4");
    expect(classes).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<Section ref={ref}>child</Section>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("SECTION");
  });
});
