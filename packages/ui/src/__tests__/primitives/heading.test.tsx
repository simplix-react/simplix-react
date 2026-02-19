// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Heading } from "../../primitives/heading";

afterEach(cleanup);

describe("Heading", () => {
  it("renders h1 by default", () => {
    render(<Heading>Title</Heading>);
    const el = screen.getByText("Title");
    expect(el.tagName).toBe("H1");
  });

  it("applies default variant classes (level 1)", () => {
    render(<Heading data-testid="h">Title</Heading>);
    const classes = screen.getByTestId("h").className;
    expect(classes).toContain("tracking-tight");
    expect(classes).toContain("text-4xl");
    expect(classes).toContain("font-bold");
    expect(classes).toContain("text-foreground");
  });

  it("renders correct tag for each level", () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    for (const level of levels) {
      const { unmount } = render(
        <Heading level={level}>L{level}</Heading>,
      );
      expect(screen.getByText(`L${level}`).tagName).toBe(`H${level}`);
      unmount();
    }
  });

  it("applies level variant classes", () => {
    const levelClasses = {
      1: "text-4xl",
      2: "text-3xl",
      3: "text-2xl",
      4: "text-xl",
      5: "text-lg",
      6: "text-base",
    } as const;

    for (const [level, expected] of Object.entries(levelClasses)) {
      const { unmount } = render(
        <Heading data-testid="h" level={Number(level) as 1 | 2 | 3 | 4 | 5 | 6}>
          text
        </Heading>,
      );
      expect(screen.getByTestId("h").className).toContain(expected);
      unmount();
    }
  });

  it("applies tone variants", () => {
    const tones = {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    } as const;

    for (const [tone, expected] of Object.entries(tones)) {
      const { unmount } = render(
        <Heading data-testid="h" tone={tone as keyof typeof tones}>
          text
        </Heading>,
      );
      expect(screen.getByTestId("h").className).toContain(expected);
      unmount();
    }
  });

  it("applies font variants", () => {
    const fonts = {
      sans: "font-sans",
      display: "font-display",
      mono: "font-mono",
    } as const;

    for (const [font, expected] of Object.entries(fonts)) {
      const { unmount } = render(
        <Heading data-testid="h" font={font as keyof typeof fonts}>
          text
        </Heading>,
      );
      expect(screen.getByTestId("h").className).toContain(expected);
      unmount();
    }
  });

  it("allows overriding tag with 'as' prop", () => {
    render(
      <Heading level={5} as="h2">
        Override
      </Heading>,
    );
    const el = screen.getByText("Override");
    expect(el.tagName).toBe("H2");
    expect(el.className).toContain("text-lg");
  });

  it("merges custom className", () => {
    render(
      <Heading data-testid="h" className="extra">
        text
      </Heading>,
    );
    const classes = screen.getByTestId("h").className;
    expect(classes).toContain("tracking-tight");
    expect(classes).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<Heading ref={ref}>Title</Heading>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe("H1");
  });
});
