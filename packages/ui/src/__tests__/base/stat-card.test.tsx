// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatCard } from "../../base/charts/stat-card";

afterEach(cleanup);

describe("StatCard", () => {
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

  it("applies positive trend color class", () => {
    const { container } = render(
      <StatCard title="Up" value={10} trend={{ value: 5 }} />,
    );
    const trendEl = container.querySelector(".text-emerald-600");
    expect(trendEl).not.toBeNull();
  });

  it("applies negative trend color class", () => {
    const { container } = render(
      <StatCard title="Down" value={10} trend={{ value: -2 }} />,
    );
    const trendEl = container.querySelector(".text-red-600");
    expect(trendEl).not.toBeNull();
  });

  it("merges custom className", () => {
    const { container } = render(
      <StatCard title="T" value={1} className="my-card" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("my-card");
    expect(root.className).toContain("rounded-lg");
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
