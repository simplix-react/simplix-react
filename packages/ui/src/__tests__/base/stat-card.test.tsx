// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatCard } from "../../base/charts/stat-card";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

describe("StatCard", () => {
  it("never cuts its figure: a value wider than the card wraps onto the lines it needs", () => {
    render(<StatCard title="Spent" value="US$0.000096" />);
    const figure = screen.getByText("US$0.000096").closest("[data-slot=stat-card-value]") as HTMLElement;
    const classes = figure.className.split(/\s+/);
    expect(classes).not.toContain("truncate");
    expect(classes.some((name) => /^(text-ellipsis|line-clamp-|overflow-hidden$|whitespace-nowrap$)/.test(name))).toBe(false);
    expect(classes).toContain("[overflow-wrap:anywhere]");
  });

  it("keeps the unit in one piece: the figure wraps anywhere, the unit never breaks inside", () => {
    render(<StatCard title="Credits" value="126,640" unit="credits" />);
    const unit = screen.getByText("credits");
    expect(unit.getAttribute("data-slot")).toBe("stat-card-unit");
    expect(drawnClasses(unit)).toMatch(/(^|\s)whitespace-nowrap(\s|$)/);
  });

  it("renders title and value", () => {
    render(<StatCard title="Revenue" value="$1,234" />);
    expect(screen.getByText("Revenue")).toBeDefined();
    expect(screen.getByText("$1,234")).toBeDefined();
  });

  it("renders numeric value", () => {
    render(<StatCard title="Count" value={42} />);
    expect(screen.getByText("42")).toBeDefined();
  });

  it("renders description when provided", () => {
    render(<StatCard title="Users" value={100} description="Active users" />);
    expect(screen.getByText("Active users")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<StatCard title="Users" value={100} />);
    const descriptions = container.querySelectorAll(".text-muted-foreground");
    // only the title should have muted foreground
    const texts = Array.from(descriptions).map((el) => el.textContent);
    expect(texts).not.toContain("Active users");
  });

  it("renders icon when provided", () => {
    render(
      <StatCard title="Sales" value={50} icon={<span data-testid="icon">IC</span>} />,
    );
    expect(screen.getByTestId("icon")).toBeDefined();
  });

  it("renders headerExtra when provided", () => {
    render(
      <StatCard title="Stats" value={10} headerExtra={<span data-testid="extra">E</span>} />,
    );
    expect(screen.getByTestId("extra")).toBeDefined();
  });

  it("renders positive trend with + prefix", () => {
    render(<StatCard title="Growth" value="10%" trend={{ value: 5, label: "vs last week" }} />);
    expect(screen.getByText("+5% vs last week")).toBeDefined();
  });

  it("renders negative trend without + prefix", () => {
    render(<StatCard title="Decline" value="8%" trend={{ value: -3 }} />);
    expect(screen.getByText("-3%")).toBeDefined();
  });

  it("renders trend with zero value as positive", () => {
    render(<StatCard title="Flat" value="0%" trend={{ value: 0 }} />);
    expect(screen.getByText("+0%")).toBeDefined();
  });

  it("applies positive trend color class with dark variant", () => {
    const { container } = render(
      <StatCard title="Up" value={10} trend={{ value: 5 }} />,
    );
    const trendEl = container.querySelector(".text-emerald-500");
    expect(trendEl).not.toBeNull();
    // dark-mode bug fix: tone-driven trend color now carries a dark: variant
    expect(drawnClasses(trendEl)).toContain("dark:text-emerald-400");
  });

  it("applies negative trend color class with dark variant", () => {
    const { container } = render(
      <StatCard title="Down" value={10} trend={{ value: -2 }} />,
    );
    const trendEl = container.querySelector(".text-red-500");
    expect(trendEl).not.toBeNull();
    // dark-mode bug fix: tone-driven trend color now carries a dark: variant
    expect(drawnClasses(trendEl)).toContain("dark:text-red-400");
  });

  it("merges custom className", () => {
    const { container } = render(
      <StatCard title="T" value={1} className="my-card" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(drawnClasses(root)).toContain("my-card");
    expect(drawnClasses(root)).toContain("rounded-lg");
  });

  it("uses bg-card by default", () => {
    const { container } = render(<StatCard title="T" value={1} />);
    const root = container.firstElementChild as HTMLElement;
    expect(drawnClasses(root)).toContain("bg-card");
  });

  it("applies tone surface classes when highlighted with tone", () => {
    const { container } = render(
      <StatCard title="T" value={1} tone="success" highlighted />,
    );
    const root = container.firstElementChild as HTMLElement;
    // success surface tint, including its dark: variants
    expect(drawnClasses(root)).toContain("bg-emerald-50/50");
    expect(drawnClasses(root)).toContain("border-emerald-200");
    expect(drawnClasses(root)).toContain("dark:bg-emerald-950/50");
    expect(drawnClasses(root)).toContain("dark:border-emerald-900");
    expect(drawnClasses(root)).not.toContain("bg-card");
  });

  it("applies danger tone surface classes when highlighted", () => {
    const { container } = render(
      <StatCard title="T" value={1} tone="danger" highlighted />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(drawnClasses(root)).toContain("bg-red-50/50");
    expect(drawnClasses(root)).toContain("dark:bg-red-950/50");
    expect(drawnClasses(root)).not.toContain("bg-card");
  });

  it("keeps bg-card when tone is set but not highlighted", () => {
    const { container } = render(
      <StatCard title="T" value={1} tone="success" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(drawnClasses(root)).toContain("bg-card");
    expect(drawnClasses(root)).not.toContain("bg-emerald-50/50");
  });

  it("keeps bg-card when highlighted but tone is omitted", () => {
    const { container } = render(
      <StatCard title="T" value={1} highlighted />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(drawnClasses(root)).toContain("bg-card");
  });

  it("merges custom className alongside tone surface", () => {
    const { container } = render(
      <StatCard title="T" value={1} tone="info" highlighted className="my-card" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(drawnClasses(root)).toContain("my-card");
    expect(drawnClasses(root)).toContain("bg-blue-50/50");
    expect(drawnClasses(root)).toContain("rounded-lg");
  });

  it("renders children", () => {
    render(
      <StatCard title="T" value={1}>
        <div data-testid="child">Chart</div>
      </StatCard>,
    );
    expect(screen.getByTestId("child")).toBeDefined();
  });
});
