// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem } from "../../base/inputs/radio-group";

afterEach(cleanup);

describe("RadioGroup", () => {
  it("renders radio group", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(2);
  });

  it("applies base grid class", () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>,
    );
    const group = container.querySelector("[role='radiogroup']") as HTMLElement;
    expect(group.className).toContain("grid");
    expect(group.className).toContain("gap-2");
  });

  it("merges custom className on group", () => {
    const { container } = render(
      <RadioGroup className="my-group">
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>,
    );
    const group = container.querySelector("[role='radiogroup']") as HTMLElement;
    expect(group.className).toContain("my-group");
  });

  it("forwards ref on RadioGroup", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup ref={ref}>
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("selects defaultValue initially", () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );
    const radioB = screen.getByLabelText("B");
    expect(radioB.getAttribute("data-state")).toBe("checked");
  });

  it("fires onValueChange when selecting", () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="a" onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByLabelText("B"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
});

describe("RadioGroupItem", () => {
  it("renders a button with radio role", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    expect(radio.tagName).toBe("BUTTON");
  });

  it("applies base classes", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    expect(radio.className).toContain("rounded-full");
    expect(radio.className).toContain("border-primary");
  });

  it("merges custom className on item", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" className="my-radio" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    expect(radio.className).toContain("my-radio");
  });

  it("forwards ref on RadioGroupItem", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <RadioGroup>
        <RadioGroupItem ref={ref} value="x" aria-label="X" />
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("supports disabled state", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" disabled />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    expect(radio).toHaveProperty("disabled", true);
  });
});
