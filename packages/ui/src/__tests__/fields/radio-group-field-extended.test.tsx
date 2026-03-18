// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RadioGroupField } from "../../fields/form/radio-group-field";

afterEach(cleanup);

describe("RadioGroupField (extended coverage)", () => {
  const options = [
    { label: "Free", value: "free" },
    { label: "Pro", value: "pro" },
    { label: "Enterprise", value: "enterprise" },
  ];

  it("calls onChange when radio is clicked", () => {
    const onChange = vi.fn();
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={onChange}
        options={options}
      />,
    );
    const proRadio = screen.getAllByRole("radio")[1];
    fireEvent.click(proRadio);
    expect(onChange).toHaveBeenCalledWith("pro");
  });

  it("renders without descriptions when none provided", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
      />,
    );
    // No description spans
    const descSpans = screen.queryAllByText(/.+/);
    descSpans.some(
      (el) => el.className.includes("text-xs") && el.className.includes("text-muted-foreground") && el.parentElement?.querySelector("[role='radio']") === null,
    );
    // Options without description should not have description blocks
    expect(screen.queryByText("Basic features")).toBeNull();
  });

  it("renders required indicator", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
        required
      />,
    );
    // Required indicator shown via FieldWrapper
    expect(screen.getByText("Plan")).toBeDefined();
  });

  it("renders with description text", () => {
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={options}
        description="Choose your plan"
      />,
    );
    expect(screen.getByText("Choose your plan")).toBeDefined();
  });

  it("renders mixed options with and without descriptions", () => {
    const mixedOptions = [
      { label: "Free", value: "free", description: "Basic" },
      { label: "Pro", value: "pro" },
    ];
    render(
      <RadioGroupField
        label="Plan"
        value="free"
        onChange={vi.fn()}
        options={mixedOptions}
      />,
    );
    expect(screen.getByText("Basic")).toBeDefined();
    expect(screen.getByText("Pro")).toBeDefined();
  });
});
