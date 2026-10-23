// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Grid } from "../../primitives/grid";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

describe("Grid", () => {
  it("renders a div with grid class by default", () => {
    render(<Grid data-testid="grid">content</Grid>);
    const el = screen.getByTestId("grid");
    expect(el.tagName).toBe("DIV");
    expect(el.textContent).toBe("content");
  });

  it("applies default variant classes when columns=1", () => {
    render(<Grid data-testid="grid" />);
    const classes = drawnClasses(screen.getByTestId("grid"));
    expect(classes).toContain("grid-cols-1");
    expect(classes).toContain("gap-4");
  });

  it("applies fixed columns when responsive=false", () => {
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
        <Grid data-testid="grid" columns={Number(col) as 1 | 2 | 3 | 4 | 5 | 6} responsive={false} />,
      );
      expect(drawnClasses(screen.getByTestId("grid"))).toContain(expected);
      unmount();
    }
  });

  it("wraps in @container and uses responsive classes when columns > 1", () => {
    render(<Grid data-testid="grid" columns={2}>content</Grid>);
    const wrapper = screen.getByTestId("grid");
    // Wrapper has @container class
    expect(drawnClasses(wrapper)).toContain("@container");
    // Inner grid has responsive column classes
    const inner = wrapper.firstElementChild!;
    expect(drawnClasses(inner)).toContain("grid");
    expect(drawnClasses(inner)).toContain("grid-cols-1");
    expect(drawnClasses(inner)).toContain("@sm:grid-cols-2");
  });

  it("does not wrap when columns=1", () => {
    render(<Grid data-testid="grid" columns={1}>content</Grid>);
    const el = screen.getByTestId("grid");
    expect(drawnClasses(el)).toContain("grid");
    expect(drawnClasses(el)).toContain("grid-cols-1");
    expect(drawnClasses(el)).not.toContain("@container");
  });

  it("applies responsive classes for columns=3", () => {
    render(<Grid data-testid="grid" columns={3}>content</Grid>);
    const inner = screen.getByTestId("grid").firstElementChild!;
    expect(drawnClasses(inner)).toContain("@sm:grid-cols-2");
    expect(drawnClasses(inner)).toContain("@2xl:grid-cols-3");
  });

  it("applies gap variants", () => {
    const gaps = {
      none: "gap-0",
      px: "gap-px",
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
      expect(drawnClasses(screen.getByTestId("grid"))).toContain(expected);
      unmount();
    }
  });

  it("applies gap to inner grid when responsive", () => {
    render(<Grid data-testid="grid" columns={2} gap="lg">content</Grid>);
    const inner = screen.getByTestId("grid").firstElementChild!;
    expect(drawnClasses(inner)).toContain("gap-6");
  });

  it("applies gap='px' as gap-px", () => {
    render(<Grid data-testid="grid" gap="px" />);
    expect(drawnClasses(screen.getByTestId("grid"))).toContain("gap-px");
  });

  it("applies template as inline grid-template-columns and skips columns class", () => {
    render(
      <Grid data-testid="grid" template="200px 1fr">
        content
      </Grid>,
    );
    const el = screen.getByTestId("grid") as HTMLDivElement;
    expect(el.style.gridTemplateColumns).toBe("200px 1fr");
    expect(drawnClasses(el)).toContain("grid");
    // template path is flat: no @container wrapper and no columns enum class
    expect(drawnClasses(el)).not.toContain("@container");
    expect(drawnClasses(el)).not.toContain("grid-cols-1");
  });

  it("template path keeps the gap class", () => {
    render(
      <Grid data-testid="grid" template="repeat(2, 1fr)" gap="sm">
        content
      </Grid>,
    );
    const el = screen.getByTestId("grid");
    expect(drawnClasses(el)).toContain("gap-2");
  });

  it("template overrides columns and responsive path", () => {
    render(
      <Grid
        data-testid="grid"
        columns={3}
        template="repeat(auto-fill, minmax(12rem, 1fr))"
      >
        content
      </Grid>,
    );
    const el = screen.getByTestId("grid") as HTMLDivElement;
    expect(el.style.gridTemplateColumns).toBe(
      "repeat(auto-fill, minmax(12rem, 1fr))",
    );
    expect(drawnClasses(el)).not.toContain("@container");
  });

  it("merges custom style with template", () => {
    render(
      <Grid
        data-testid="grid"
        template="1fr 1fr"
        style={{ backgroundColor: "red" }}
      >
        content
      </Grid>,
    );
    const el = screen.getByTestId("grid") as HTMLDivElement;
    expect(el.style.gridTemplateColumns).toBe("1fr 1fr");
    expect(el.style.backgroundColor).toBe("red");
  });

  it("merges custom className", () => {
    render(<Grid data-testid="grid" className="custom" />);
    const classes = drawnClasses(screen.getByTestId("grid"));
    expect(classes).toContain("grid");
    expect(classes).toContain("custom");
  });

  it("merges custom className to inner grid when responsive", () => {
    render(<Grid data-testid="grid" columns={2} className="custom">content</Grid>);
    const inner = screen.getByTestId("grid").firstElementChild!;
    expect(drawnClasses(inner)).toContain("custom");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref}>child</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards ref to wrapper when responsive", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref} columns={2}>child</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(drawnClasses(ref.current)).toContain("@container");
  });
});

describe("Grid divider", () => {
  it("rules every cell that follows another in its row", () => {
    const { container } = render(
      <Grid columns={3} gap="md" responsive={false} divider>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </Grid>,
    );
    // The first cell of the row opens it; the other two each get the rule on their left edge.
    expect(container.querySelectorAll(".grid-column-rule")).toHaveLength(2);
    expect(drawnClasses(container.querySelector("[data-slot=grid]"))).toContain("[&>.grid-column-rule]:border-l");
  });

  it("leaves a cell spanning the row unruled, and reopens the rule after it", () => {
    const { container } = render(
      <Grid columns={2} gap="md" responsive={false} divider>
        <div>a</div>
        <div>b</div>
        <div className="col-span-full">wide</div>
        <div>c</div>
        <div>d</div>
      </Grid>,
    );
    const ruled = [...container.querySelectorAll(".grid-column-rule")].map((n) => n.textContent);
    expect(ruled).toEqual(["b", "d"]);
  });

  it("renders a collapsible separator for responsive two-column grids", () => {
    const { container } = render(
      <Grid columns={2} gap="md" divider>
        <div>a</div>
        <div>b</div>
      </Grid>,
    );
    const lines = container.querySelectorAll(".grid-column-rule");
    expect(lines).toHaveLength(1);
    // Collapsed to one column there is no gutter to rule, so the border is container-gated.
    expect(drawnClasses(container.querySelector("[data-slot=grid]"))).toContain("@sm:[&>.grid-column-rule]:border-l");
  });

  it("ignores divider for responsive grids with more than two columns", () => {
    const { container } = render(
      <Grid columns={3} gap="md" divider>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </Grid>,
    );
    expect(container.querySelectorAll("[aria-hidden].bg-border")).toHaveLength(0);
  });
});

describe("Grid per-axis gap", () => {
  it("applies gapX and gapY overrides on fixed grids", () => {
    const { container } = render(
      <Grid columns={2} gapX="lg" gapY="sm" responsive={false}>
        <div>a</div>
        <div>b</div>
      </Grid>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(drawnClasses(el)).toContain("gap-x-6");
    expect(drawnClasses(el)).toContain("gap-y-2");
  });
});

