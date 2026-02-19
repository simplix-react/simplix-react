// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Badge } from "../../base/badge";

afterEach(cleanup);

describe("Badge", () => {
  it("renders with default props", () => {
    render(<Badge>Status</Badge>);
    const badge = screen.getByText("Status");
    expect(badge).toBeDefined();
    expect(badge.tagName).toBe("SPAN");
  });

  it("applies default variant classes", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("bg-primary");
    expect(badge.className).toContain("text-primary-foreground");
  });

  it("applies default rounded='full'", () => {
    render(<Badge>Round</Badge>);
    const badge = screen.getByText("Round");
    expect(badge.className).toContain("rounded-full");
  });

  it("applies variant='secondary'", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.className).toContain("bg-secondary");
  });

  it("applies variant='destructive'", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-destructive");
  });

  it("applies variant='outline'", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("text-foreground");
    expect(badge.className).not.toContain("bg-primary");
  });

  it("applies variant='success'", () => {
    render(<Badge variant="success">OK</Badge>);
    const badge = screen.getByText("OK");
    expect(badge.className).toContain("bg-green-100");
    expect(badge.className).toContain("text-green-800");
  });

  it("applies variant='warning'", () => {
    render(<Badge variant="warning">Warn</Badge>);
    const badge = screen.getByText("Warn");
    expect(badge.className).toContain("bg-yellow-100");
    expect(badge.className).toContain("text-yellow-800");
  });

  it("applies color variant='blue'", () => {
    render(<Badge variant="blue">Blue</Badge>);
    const badge = screen.getByText("Blue");
    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-800");
  });

  it("applies rounded='md'", () => {
    render(<Badge rounded="md">MD</Badge>);
    const badge = screen.getByText("MD");
    expect(badge.className).toContain("rounded-md");
  });

  it("applies rounded='none'", () => {
    render(<Badge rounded="none">None</Badge>);
    const badge = screen.getByText("None");
    expect(badge.className).toContain("rounded-none");
  });

  it("merges custom className", () => {
    render(<Badge className="my-badge">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("my-badge");
    expect(badge.className).toContain("inline-flex");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Ref</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
