// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Card } from "../../primitives/card";

afterEach(cleanup);

describe("Card", () => {
  it("renders a <div> by default", () => {
    render(<Card data-testid="card">content</Card>);
    const el = screen.getByTestId("card");
    expect(el.tagName).toBe("DIV");
    expect(el.textContent).toBe("content");
  });

  it("applies base and default variant classes", () => {
    render(<Card data-testid="card" />);
    const classes = screen.getByTestId("card").className;
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("border");
    expect(classes).toContain("bg-card");
    expect(classes).toContain("shadow-sm");
    expect(classes).toContain("px-6");
    expect(classes).toContain("py-4");
  });

  it("applies padding variants", () => {
    // Padding is set per axis: a card is wider than it is tall for the same step.
    const paddings = {
      sm: ["px-4", "py-3"],
      md: ["px-6", "py-4"],
      lg: ["px-8", "py-6"],
    } as const;

    for (const [padding, expected] of Object.entries(paddings)) {
      const { unmount } = render(
        <Card data-testid="card" padding={padding as keyof typeof paddings} />,
      );
      for (const cls of expected) expect(screen.getByTestId("card").className).toContain(cls);
      unmount();
    }
  });

  it("applies no padding class for 'none'", () => {
    render(<Card data-testid="card" padding="none" />);
    const classes = screen.getByTestId("card").className;
    expect(classes).not.toContain("px-");
    expect(classes).not.toContain("py-");
  });

  it("renders a <button> when interactive", () => {
    render(
      <Card data-testid="card" interactive>
        clickable
      </Card>,
    );
    const el = screen.getByTestId("card");
    expect(el.tagName).toBe("BUTTON");
    expect(el.className).toContain("cursor-pointer");
    expect(el.className).toContain("w-full");
    expect(el.className).toContain("text-left");
  });

  it("allows overriding tag with 'as' prop", () => {
    render(
      <Card data-testid="card" as="article">
        article card
      </Card>,
    );
    expect(screen.getByTestId("card").tagName).toBe("ARTICLE");
  });

  it("merges custom className", () => {
    render(<Card data-testid="card" className="extra" />);
    const classes = screen.getByTestId("card").className;
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<Card ref={ref}>child</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
