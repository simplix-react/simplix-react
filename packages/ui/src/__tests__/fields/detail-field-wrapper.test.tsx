// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DetailFieldWrapper } from "../../fields/shared/detail-field-wrapper";

afterEach(cleanup);

describe("DetailFieldWrapper", () => {
  // ── Label display ──

  it("renders label in top position by default", () => {
    render(<DetailFieldWrapper label="Email">value</DetailFieldWrapper>);
    expect(screen.getByText("Email")).toBeDefined();
  });

  it("applies top layout classes by default", () => {
    render(
      <DetailFieldWrapper label="Email">
        <span data-testid="val">test</span>
      </DetailFieldWrapper>,
    );
    const wrapper = screen.getByTestId("detail-field-email");
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("flex-col");
  });

  // ── Label position: left ──

  it("applies grid classes for left layout", () => {
    render(
      <DetailFieldWrapper label="Name" labelPosition="left">
        value
      </DetailFieldWrapper>,
    );
    const wrapper = screen.getByTestId("detail-field-name");
    expect(wrapper.className).toContain("grid");
  });

  // ── Label position: hidden ──

  it("hides label when position is hidden", () => {
    render(
      <DetailFieldWrapper label="Secret" labelPosition="hidden">
        value
      </DetailFieldWrapper>,
    );
    // Label text should not be visible as a field-label span
    const wrapper = screen.getByTestId("detail-field-secret");
    const labelSpan = wrapper.querySelector(".field-label");
    expect(labelSpan).toBeNull();
  });

  it("sets aria-label when label is hidden", () => {
    render(
      <DetailFieldWrapper label="Secret" labelPosition="hidden">
        value
      </DetailFieldWrapper>,
    );
    const wrapper = screen.getByTestId("detail-field-secret");
    expect(wrapper.getAttribute("aria-label")).toBe("Secret");
  });

  // ── data-testid ──

  it("generates data-testid from label", () => {
    render(
      <DetailFieldWrapper label="Full Name">value</DetailFieldWrapper>,
    );
    expect(screen.getByTestId("detail-field-full-name")).toBeDefined();
  });

  it("generates data-testid from labelKey when no label", () => {
    render(
      <DetailFieldWrapper labelKey="user.email">value</DetailFieldWrapper>,
    );
    expect(screen.getByTestId("detail-field-useremail")).toBeDefined();
  });

  it("does not set data-testid when no label or labelKey", () => {
    const { container } = render(
      <DetailFieldWrapper>value</DetailFieldWrapper>,
    );
    const span = container.querySelector("span");
    expect(span?.getAttribute("data-testid")).toBeNull();
  });

  // ── Children ──

  it("renders children inside field-value span", () => {
    render(
      <DetailFieldWrapper label="Name">
        <span data-testid="child">John</span>
      </DetailFieldWrapper>,
    );
    expect(screen.getByTestId("child").textContent).toBe("John");
    expect(screen.getByTestId("child").closest(".field-value")).toBeDefined();
  });

  // ── className merging ──

  it("merges custom className", () => {
    render(
      <DetailFieldWrapper label="Name" className="custom-cls">
        value
      </DetailFieldWrapper>,
    );
    const wrapper = screen.getByTestId("detail-field-name");
    expect(wrapper.className).toContain("custom-cls");
  });
});
