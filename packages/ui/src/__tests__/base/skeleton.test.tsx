// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Skeleton } from "../../base/display/skeleton";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

describe("Skeleton", () => {
  it("renders a div element", () => {
    render(<Skeleton data-testid="sk" />);
    const sk = screen.getByTestId("sk");
    expect(sk.tagName).toBe("DIV");
  });

  it("applies base classes", () => {
    render(<Skeleton data-testid="sk" />);
    const sk = screen.getByTestId("sk");
    expect(drawnClasses(sk)).toContain("animate-pulse");
    expect(drawnClasses(sk)).toContain("rounded-md");
    expect(drawnClasses(sk)).toContain("bg-muted");
  });

  it("merges custom className", () => {
    render(<Skeleton data-testid="sk" className="h-4 w-32" />);
    const sk = screen.getByTestId("sk");
    expect(drawnClasses(sk)).toContain("h-4");
    expect(drawnClasses(sk)).toContain("w-32");
    expect(drawnClasses(sk)).toContain("animate-pulse");
  });

  it("passes through HTML attributes", () => {
    render(<Skeleton data-testid="sk" aria-label="Loading..." />);
    const sk = screen.getByTestId("sk");
    expect(sk.getAttribute("aria-label")).toBe("Loading...");
  });
});
