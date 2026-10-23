// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Stack } from "../../primitives/stack";
import { drawnClasses } from "../helpers/drawn-classes";

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
    expect(drawnClasses(el)).toContain("flex");
    expect(drawnClasses(el)).toContain("flex-col");
    expect(drawnClasses(el)).toContain("gap-4");
    expect(drawnClasses(el)).toContain("items-stretch");
  });

  it("applies direction variant", () => {
    render(<Stack data-testid="stack" direction="row" />);
    expect(drawnClasses(screen.getByTestId("stack"))).toContain("flex-row");
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
      expect(drawnClasses(screen.getByTestId("stack"))).toContain(expected);
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
      expect(drawnClasses(screen.getByTestId("stack"))).toContain(expected);
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
      expect(drawnClasses(screen.getByTestId("stack"))).toContain(expected);
      unmount();
    }
  });

  it("applies wrap variant", () => {
    render(<Stack data-testid="stack" wrap={true} />);
    expect(drawnClasses(screen.getByTestId("stack"))).toContain("flex-wrap");
  });

  it("applies shrink={false} as shrink-0", () => {
    render(<Stack data-testid="stack" shrink={false} />);
    expect(drawnClasses(screen.getByTestId("stack"))).toContain("shrink-0");
  });

  it("applies overflow variants", () => {
    const overflows = {
      visible: "overflow-visible",
      hidden: "overflow-hidden",
      auto: "overflow-auto",
      scroll: "overflow-scroll",
    } as const;

    for (const [overflow, expected] of Object.entries(overflows)) {
      const { unmount } = render(
        <Stack
          data-testid="stack"
          overflow={overflow as keyof typeof overflows}
        />,
      );
      expect(drawnClasses(screen.getByTestId("stack"))).toContain(expected);
      unmount();
    }
  });

  it("applies overflow='auto' as overflow-auto", () => {
    render(<Stack data-testid="stack" overflow="auto" />);
    expect(drawnClasses(screen.getByTestId("stack"))).toContain("overflow-auto");
  });

  it("applies minSize as min-w-0 and min-h-0", () => {
    render(<Stack data-testid="stack" minSize={true} />);
    const classes = drawnClasses(screen.getByTestId("stack"));
    expect(classes).toContain("min-w-0");
    expect(classes).toContain("min-h-0");
  });

  it("merges custom className", () => {
    render(<Stack data-testid="stack" className="custom-class" />);
    const classes = drawnClasses(screen.getByTestId("stack"));
    expect(classes).toContain("flex");
    expect(classes).toContain("custom-class");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref}>child</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
