// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Badge } from "../../base/display/badge";
import { drawnClasses } from "../helpers/drawn-classes";

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
    expect(drawnClasses(badge)).toContain("bg-primary");
    expect(drawnClasses(badge)).toContain("text-primary-foreground");
  });

  it("applies default rounded='xl'", () => {
    render(<Badge>Round</Badge>);
    const badge = screen.getByText("Round");
    expect(drawnClasses(badge)).toContain("rounded-xl");
  });

  it("applies rounded='full'", () => {
    render(<Badge rounded="full">Full</Badge>);
    const badge = screen.getByText("Full");
    expect(drawnClasses(badge)).toContain("rounded-full");
  });

  it("applies variant='secondary'", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(drawnClasses(badge)).toContain("bg-secondary");
  });

  it("applies variant='destructive'", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(drawnClasses(badge)).toContain("bg-destructive");
  });

  it("applies variant='outline'", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(drawnClasses(badge)).toContain("text-foreground");
    expect(drawnClasses(badge)).not.toContain("bg-primary");
  });

  it("applies variant='success'", () => {
    render(<Badge variant="success">OK</Badge>);
    const badge = screen.getByText("OK");
    expect(drawnClasses(badge)).toContain("bg-green-100");
    expect(drawnClasses(badge)).toContain("text-green-800");
  });

  it("applies variant='warning'", () => {
    render(<Badge variant="warning">Warn</Badge>);
    const badge = screen.getByText("Warn");
    expect(drawnClasses(badge)).toContain("bg-yellow-100");
    expect(drawnClasses(badge)).toContain("text-yellow-800");
  });

  it("applies color variant='blue'", () => {
    render(<Badge variant="blue">Blue</Badge>);
    const badge = screen.getByText("Blue");
    expect(drawnClasses(badge)).toContain("bg-blue-100");
    expect(drawnClasses(badge)).toContain("text-blue-800");
  });

  it("applies rounded='md'", () => {
    render(<Badge rounded="md">MD</Badge>);
    const badge = screen.getByText("MD");
    expect(drawnClasses(badge)).toContain("rounded-md");
  });

  it("applies rounded='none'", () => {
    render(<Badge rounded="none">None</Badge>);
    const badge = screen.getByText("None");
    expect(drawnClasses(badge)).toContain("rounded-none");
  });

  it("shows a pressable cursor when interactive", () => {
    render(<Badge interactive>Press</Badge>);
    const badge = screen.getByText("Press");
    expect(drawnClasses(badge)).toContain("cursor-pointer");
    expect(badge.hasAttribute("interactive")).toBe(false);
  });

  it("is not interactive by default", () => {
    render(<Badge>Still</Badge>);
    expect(drawnClasses(screen.getByText("Still"))).not.toContain("cursor-pointer");
  });

  it("merges custom className", () => {
    render(<Badge className="my-badge">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(drawnClasses(badge)).toContain("my-badge");
    expect(drawnClasses(badge)).toContain("inline-flex");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Ref</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
