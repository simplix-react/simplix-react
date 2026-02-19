// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FieldWrapper } from "../../fields/shared/field-wrapper";

afterEach(cleanup);

describe("FieldWrapper", () => {
  // ── Label position: top (default) ──

  it("renders label in top position by default", () => {
    render(<FieldWrapper label="Username">input</FieldWrapper>);
    expect(screen.getByText("Username")).toBeDefined();
  });

  it("applies top layout classes by default", () => {
    render(<FieldWrapper label="Name">input</FieldWrapper>);
    const fieldset = screen.getByRole("group");
    expect(fieldset.className).toContain("flex");
    expect(fieldset.className).toContain("flex-col");
  });

  // ── Label position: left ──

  it("applies left layout classes", () => {
    render(
      <FieldWrapper label="Name" labelPosition="left">
        input
      </FieldWrapper>,
    );
    const fieldset = screen.getByRole("group");
    expect(fieldset.className).toContain("grid");
  });

  // ── Label position: hidden ──

  it("hides label visually with sr-only when position is hidden", () => {
    render(
      <FieldWrapper label="Search" labelPosition="hidden">
        input
      </FieldWrapper>,
    );
    // The label text should not be rendered via <Label>
    // Instead, an sr-only span should exist
    const srSpan = screen.getByText("Search");
    expect(srSpan.className).toContain("sr-only");
  });

  it("sets aria-label on fieldset when label is hidden", () => {
    render(
      <FieldWrapper label="Search" labelPosition="hidden">
        input
      </FieldWrapper>,
    );
    const fieldset = screen.getByRole("group");
    expect(fieldset.getAttribute("aria-label")).toBe("Search");
  });

  // ── Required asterisk ──

  it("shows required asterisk when required=true", () => {
    render(
      <FieldWrapper label="Email" required>
        input
      </FieldWrapper>,
    );
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeDefined();
    expect(asterisk.getAttribute("aria-hidden")).toBe("true");
  });

  it("does not show asterisk when required=false", () => {
    render(<FieldWrapper label="Email">input</FieldWrapper>);
    expect(screen.queryByText("*")).toBeNull();
  });

  // ── Error message ──

  it("renders error message with role=alert", () => {
    render(<FieldWrapper label="Name" error="Required">input</FieldWrapper>);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Required");
  });

  it("does not render alert when no error", () => {
    render(<FieldWrapper label="Name">input</FieldWrapper>);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  // ── Description ──

  it("renders description text", () => {
    render(
      <FieldWrapper label="Name" description="Enter your full name">
        input
      </FieldWrapper>,
    );
    expect(screen.getByText("Enter your full name")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    render(<FieldWrapper label="Name">input</FieldWrapper>);
    expect(screen.queryByText("Enter your full name")).toBeNull();
  });

  // ── Disabled ──

  it("disables fieldset when disabled=true", () => {
    render(
      <FieldWrapper label="Name" disabled>
        input
      </FieldWrapper>,
    );
    const fieldset = screen.getByRole("group");
    expect(fieldset).toHaveProperty("disabled", true);
  });

  it("fieldset is not disabled by default", () => {
    render(<FieldWrapper label="Name">input</FieldWrapper>);
    const fieldset = screen.getByRole("group");
    expect(fieldset).toHaveProperty("disabled", false);
  });

  // ── data-testid ──

  it("generates data-testid from label", () => {
    render(<FieldWrapper label="First Name">input</FieldWrapper>);
    expect(screen.getByTestId("form-field-first-name")).toBeDefined();
  });

  it("does not set data-testid when no label", () => {
    const { container } = render(<FieldWrapper>input</FieldWrapper>);
    const fieldset = container.querySelector("fieldset");
    expect(fieldset?.getAttribute("data-testid")).toBeNull();
  });

  // ── Children rendering ──

  it("renders children", () => {
    render(
      <FieldWrapper label="Name">
        <input data-testid="child-input" />
      </FieldWrapper>,
    );
    expect(screen.getByTestId("child-input")).toBeDefined();
  });

  // ── className merging ──

  it("merges custom className", () => {
    render(
      <FieldWrapper label="Name" className="my-custom">
        input
      </FieldWrapper>,
    );
    const fieldset = screen.getByRole("group");
    expect(fieldset.className).toContain("my-custom");
  });

  // ── Left layout with description and error ──

  it("renders description and error in left layout", () => {
    render(
      <FieldWrapper
        label="Name"
        labelPosition="left"
        description="Help text"
        error="Error text"
      >
        input
      </FieldWrapper>,
    );
    expect(screen.getByText("Help text")).toBeDefined();
    expect(screen.getByRole("alert").textContent).toBe("Error text");
  });
});
