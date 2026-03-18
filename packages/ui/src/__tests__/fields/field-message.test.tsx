// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FieldMessage } from "../../fields/shared/field-message";

afterEach(cleanup);

describe("FieldMessage", () => {
  it("renders error with role=alert and icon", () => {
    render(<FieldMessage variant="error">This field is required</FieldMessage>);
    const el = screen.getByRole("alert");
    expect(el.textContent).toBe("This field is required");
    // Should have an alert icon (svg with aria-hidden)
    const svg = el.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders warning with role=status and icon", () => {
    render(<FieldMessage variant="warning">Already in use</FieldMessage>);
    const el = screen.getByRole("status");
    expect(el.textContent).toBe("Already in use");
    const svg = el.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("renders info with role=status and no icon", () => {
    render(<FieldMessage variant="info">Range: 1-1024</FieldMessage>);
    const el = screen.getByRole("status");
    expect(el.textContent).toBe("Range: 1-1024");
    // Info variant should not have an icon
    const svg = el.querySelector("svg");
    expect(svg).toBeNull();
  });

  it("renders description with no role and no icon", () => {
    render(<FieldMessage variant="description">Help text</FieldMessage>);
    const el = screen.getByText("Help text");
    expect(el.getAttribute("role")).toBeNull();
    const svg = el.querySelector("svg");
    expect(svg).toBeNull();
  });

  it("applies error text class", () => {
    render(<FieldMessage variant="error">Error</FieldMessage>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("text-destructive");
  });

  it("applies warning text class", () => {
    render(<FieldMessage variant="warning">Warning</FieldMessage>);
    const el = screen.getByRole("status");
    expect(el.className).toContain("text-warning");
  });

  it("applies info text class", () => {
    render(<FieldMessage variant="info">Info</FieldMessage>);
    const el = screen.getByRole("status");
    expect(el.className).toContain("text-info");
  });

  it("applies description text class", () => {
    render(<FieldMessage variant="description">Description</FieldMessage>);
    const el = screen.getByText("Description");
    expect(el.className).toContain("text-muted-foreground");
  });

  it("defaults to error styling when no variant is specified", () => {
    render(<FieldMessage>Default error</FieldMessage>);
    const el = screen.getByText("Default error");
    expect(el.className).toContain("text-destructive");
    // When variant is undefined, role is not set
    expect(el.getAttribute("role")).toBeNull();
  });

  it("merges custom className", () => {
    render(
      <FieldMessage variant="error" className="my-custom">
        Error
      </FieldMessage>,
    );
    const el = screen.getByRole("alert");
    expect(el.className).toContain("my-custom");
  });

  it("applies flex layout for error and warning (icon variants)", () => {
    render(<FieldMessage variant="error">Error</FieldMessage>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("flex");
    expect(el.className).toContain("items-center");
    expect(el.className).toContain("gap-1");
  });

  it("does not apply flex layout for description", () => {
    render(<FieldMessage variant="description">Desc</FieldMessage>);
    const el = screen.getByText("Desc");
    expect(el.className).not.toContain("flex");
  });
});
