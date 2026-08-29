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
      <DetailFieldWrapper label="Name" layout="left">
        value
      </DetailFieldWrapper>,
    );
    const wrapper = screen.getByTestId("detail-field-name");
    expect(wrapper.className).toContain("grid");
  });

  // ── Label position: hidden ──

  it("hides label when position is hidden", () => {
    render(
      <DetailFieldWrapper label="Secret" layout="hidden">
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
      <DetailFieldWrapper label="Secret" layout="hidden">
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
  // ── Which layout spreads, and which does not ──
  //
  // The two are one decision read from opposite ends, so they are asserted together: a change
  // that gives `inline` the spread back would have to delete one of these, which is a thing
  // somebody notices.

  it("does not spread inline — the value sits immediately after its label", () => {
    render(
      <DetailFieldWrapper label="Run by" layout="inline">
        <span data-testid="val">Kim</span>
      </DetailFieldWrapper>,
    );
    const wrapper = screen.getByTestId("detail-field-run-by");
    // Inside a two-column detail section a cell is about 270px, and spreading put a short value
    // two hundred pixels from its label and hard against the edge — read as a missing value.
    expect(wrapper.className).not.toContain("justify-between");
    expect(wrapper.className).toContain("items-start");
  });

  // ── Where the label sits, and who decides it ──

  it("gives inline's label a track of its own, so a container can share one across its fields", () => {
    render(
      <DetailFieldWrapper label="Run by" layout="inline">
        <span data-testid="val">Kim</span>
      </DetailFieldWrapper>,
    );
    const wrapper = screen.getByTestId("detail-field-run-by");
    // Two tracks, label then value. A flex row cannot be shared: the label would take its own
    // width in every row and the values would start at as many x positions as there are labels.
    expect(wrapper.className).toContain("grid");
    expect(wrapper.className).toContain("grid-cols-[auto_minmax(0,1fr)]");
  });

  it("names its layout on the element, which is what a section aligns by", () => {
    render(
      <DetailFieldWrapper label="Run by" layout="inline">
        value
      </DetailFieldWrapper>,
    );
    expect(
      screen.getByTestId("detail-field-run-by").getAttribute("data-field-layout"),
    ).toBe("inline");
  });

  it("hands the whole pair to a value with no label, so it is never measured as one", () => {
    // Left in the first track, a label-less value would set the width of the column every other
    // row draws its label in.
    const { container } = render(
      <DetailFieldWrapper layout="inline">
        <span data-testid="val">Kim</span>
      </DetailFieldWrapper>,
    );
    const value = container.querySelector(".field-value");
    expect(value?.className).toContain("col-span-2");
  });

  it("keeps a labelled value out of the label's track without spanning it", () => {
    const { container } = render(
      <DetailFieldWrapper label="Run by" layout="inline">
        value
      </DetailFieldWrapper>,
    );
    expect(container.querySelector(".field-value")?.className).not.toContain("col-span-2");
  });

  it("leaves the layouts that carry no label column as flex rows", () => {
    // `top` stacks, `trailing` spreads with a spacer, `hidden` draws no label at all — none of
    // them has a label column to share, so none of them becomes a grid.
    for (const layout of ["top", "trailing", "hidden"] as const) {
      const { container } = render(
        <DetailFieldWrapper label="Auto lock" layout={layout}>
          value
        </DetailFieldWrapper>,
      );
      const wrapper = container.querySelector("[data-field-layout]");
      expect(wrapper?.className).toContain("flex");
      expect(wrapper?.className).not.toContain("grid");
      cleanup();
    }
  });

  it("spreads trailing, with the spacer that does it", () => {
    const { container } = render(
      <DetailFieldWrapper label="Auto lock" layout="trailing">
        <span data-testid="val">On</span>
      </DetailFieldWrapper>,
    );
    // The spread is a rendered spacer rather than a justify rule, which is what keeps it here and
    // out of every other layout.
    expect(container.querySelector('[aria-hidden="true"].flex-1')).not.toBeNull();
  });
});
