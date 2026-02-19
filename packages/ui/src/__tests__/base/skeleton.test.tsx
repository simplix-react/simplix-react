// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Skeleton } from "../../base/skeleton";

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
    expect(sk.className).toContain("animate-pulse");
    expect(sk.className).toContain("rounded-md");
    expect(sk.className).toContain("bg-muted");
  });

  it("merges custom className", () => {
    render(<Skeleton data-testid="sk" className="h-4 w-32" />);
    const sk = screen.getByTestId("sk");
    expect(sk.className).toContain("h-4");
    expect(sk.className).toContain("w-32");
    expect(sk.className).toContain("animate-pulse");
  });

  it("passes through HTML attributes", () => {
    render(<Skeleton data-testid="sk" aria-label="Loading..." />);
    const sk = screen.getByTestId("sk");
    expect(sk.getAttribute("aria-label")).toBe("Loading...");
  });
});
