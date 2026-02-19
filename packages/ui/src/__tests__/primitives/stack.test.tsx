// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Stack } from "../../primitives/stack";

afterEach(cleanup);

describe("Stack", () => {
  it("renders a div by default", () => {
    render(<Stack data-testid="stack">content</Stack>);
    const el = screen.getByTestId("stack");
    expect(el.tagName).toBe("DIV");
    expect(el.textContent).toBe("content");
  });

  it("applies default variant classes", () => {
    render(<Stack data-testid="stack" />);
    const el = screen.getByTestId("stack");
    expect(el.className).toContain("flex");
    expect(el.className).toContain("flex-col");
    expect(el.className).toContain("gap-4");
    expect(el.className).toContain("items-stretch");
  });

  it("applies direction variant", () => {
    render(<Stack data-testid="stack" direction="row" />);
    expect(screen.getByTestId("stack").className).toContain("flex-row");
  });

  it("applies gap variants", () => {
    const gaps = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    } as const;

    for (const [gap, expected] of Object.entries(gaps)) {
      const { unmount } = render(
        <Stack data-testid="stack" gap={gap as keyof typeof gaps} />,
      );
      expect(screen.getByTestId("stack").className).toContain(expected);
      unmount();
    }
  });

  it("applies align variants", () => {
    const aligns = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    } as const;

    for (const [align, expected] of Object.entries(aligns)) {
      const { unmount } = render(
        <Stack data-testid="stack" align={align as keyof typeof aligns} />,
      );
      expect(screen.getByTestId("stack").className).toContain(expected);
      unmount();
    }
  });

  it("applies justify variants", () => {
    const justifies = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    } as const;

    for (const [justify, expected] of Object.entries(justifies)) {
      const { unmount } = render(
        <Stack
          data-testid="stack"
          justify={justify as keyof typeof justifies}
        />,
      );
      expect(screen.getByTestId("stack").className).toContain(expected);
      unmount();
    }
  });

  it("applies wrap variant", () => {
    render(<Stack data-testid="stack" wrap={true} />);
    expect(screen.getByTestId("stack").className).toContain("flex-wrap");
  });

  it("merges custom className", () => {
    render(<Stack data-testid="stack" className="custom-class" />);
    const classes = screen.getByTestId("stack").className;
    expect(classes).toContain("flex");
    expect(classes).toContain("custom-class");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref}>child</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
