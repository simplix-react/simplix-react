// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Text } from "../../primitives/text";

afterEach(cleanup);

describe("Text", () => {
  it("renders a <p> element by default", () => {
    render(<Text>hello</Text>);
    const el = screen.getByText("hello");
    expect(el.tagName).toBe("P");
  });

  it("applies default variant classes", () => {
    render(<Text data-testid="t">text</Text>);
    const classes = screen.getByTestId("t").className;
    expect(classes).toContain("font-normal");
    expect(classes).toContain("text-base");
    expect(classes).toContain("text-foreground");
  });

  it("applies size variants", () => {
    const sizes = {
      lg: "text-lg",
      base: "text-base",
      sm: "text-sm",
      caption: "text-xs",
    } as const;

    for (const [size, expected] of Object.entries(sizes)) {
      const { unmount } = render(
        <Text data-testid="t" size={size as keyof typeof sizes}>
          text
        </Text>,
      );
      expect(screen.getByTestId("t").className).toContain(expected);
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
        <Text data-testid="t" tone={tone as keyof typeof tones}>
          text
        </Text>,
      );
      expect(screen.getByTestId("t").className).toContain(expected);
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
        <Text data-testid="t" font={font as keyof typeof fonts}>
          text
        </Text>,
      );
      expect(screen.getByTestId("t").className).toContain(expected);
      unmount();
    }
  });

  it("renders <code> when font is mono", () => {
    render(<Text font="mono">code snippet</Text>);
    expect(screen.getByText("code snippet").tagName).toBe("CODE");
  });

  it("allows overriding tag with 'as' prop", () => {
    render(<Text as="span">inline</Text>);
    expect(screen.getByText("inline").tagName).toBe("SPAN");
  });

  it("renders as <label> when as='label'", () => {
    render(<Text as="label">label text</Text>);
    expect(screen.getByText("label text").tagName).toBe("LABEL");
  });

  it("merges custom className", () => {
    render(
      <Text data-testid="t" className="extra">
        text
      </Text>,
    );
    const classes = screen.getByTestId("t").className;
    expect(classes).toContain("font-normal");
    expect(classes).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<Text ref={ref}>text</Text>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});
