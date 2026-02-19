// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Grid } from "../../primitives/grid";

afterEach(cleanup);

describe("Grid", () => {
  it("renders a div with grid class by default", () => {
    render(<Grid data-testid="grid">content</Grid>);
    const el = screen.getByTestId("grid");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("grid");
    expect(el.textContent).toBe("content");
  });

  it("applies default variant classes", () => {
    render(<Grid data-testid="grid" />);
    const classes = screen.getByTestId("grid").className;
    expect(classes).toContain("grid-cols-1");
    expect(classes).toContain("gap-4");
  });

  it("applies columns variants", () => {
    const cols = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    } as const;

    for (const [col, expected] of Object.entries(cols)) {
      const { unmount } = render(
        <Grid data-testid="grid" columns={Number(col) as 1 | 2 | 3 | 4 | 5 | 6} />,
      );
      expect(screen.getByTestId("grid").className).toContain(expected);
      unmount();
    }
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
        <Grid data-testid="grid" gap={gap as keyof typeof gaps} />,
      );
      expect(screen.getByTestId("grid").className).toContain(expected);
      unmount();
    }
  });

  it("merges custom className", () => {
    render(<Grid data-testid="grid" className="custom" />);
    const classes = screen.getByTestId("grid").className;
    expect(classes).toContain("grid");
    expect(classes).toContain("custom");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref}>child</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
