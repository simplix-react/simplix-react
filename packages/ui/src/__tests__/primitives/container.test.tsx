// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Container } from "../../primitives/container";

afterEach(cleanup);

describe("Container", () => {
  it("renders a div with base classes", () => {
    render(<Container data-testid="ctr">content</Container>);
    const el = screen.getByTestId("ctr");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("mx-auto");
    expect(el.className).toContain("w-full");
    expect(el.className).toContain("px-4");
    expect(el.textContent).toBe("content");
  });

  it("applies default size (lg)", () => {
    render(<Container data-testid="ctr" />);
    expect(screen.getByTestId("ctr").className).toContain("max-w-screen-lg");
  });

  it("applies size variants", () => {
    const sizes = {
      "2xl": "max-w-2xl",
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      full: "max-w-full",
    } as const;

    for (const [size, expected] of Object.entries(sizes)) {
      const { unmount } = render(
        <Container data-testid="ctr" size={size as keyof typeof sizes} />,
      );
      expect(screen.getByTestId("ctr").className).toContain(expected);
      unmount();
    }
  });

  it("merges custom className", () => {
    render(<Container data-testid="ctr" className="extra" />);
    const classes = screen.getByTestId("ctr").className;
    expect(classes).toContain("mx-auto");
    expect(classes).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Container ref={ref}>child</Container>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
