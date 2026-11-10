// @vitest-environment jsdom
import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NumberInput } from "../../base/inputs/number-input";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

describe("NumberInput", () => {
  it("renders an input with type=number", () => {
    render(<NumberInput data-testid="num" />);
    const input = screen.getByTestId("num");
    expect(input).toHaveProperty("type", "number");
  });

  it("applies base classes to the wrapper", () => {
    render(<NumberInput data-testid="num" />);
    const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
    expect(drawnClasses(wrapper)).toContain("flex");
    expect(drawnClasses(wrapper)).toContain("rounded-md");
    expect(drawnClasses(wrapper)).toContain("border-input");
  });

  it("merges custom className on the wrapper", () => {
    render(<NumberInput data-testid="num" className="my-num" />);
    const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
    expect(drawnClasses(wrapper)).toContain("my-num");
    expect(drawnClasses(wrapper)).toContain("border-input");
  });

  it("renders always-visible spinner buttons", () => {
    render(<NumberInput data-testid="num" />);
    expect(screen.getByRole("button", { name: "common.increase" })).toBeDefined();
    expect(screen.getByRole("button", { name: "common.decrease" })).toBeDefined();
  });

  it("steps up with the spinner button", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" defaultValue={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "common.increase" }));
    expect(onChange).toHaveBeenCalledWith(6);
    expect((screen.getByTestId("num") as HTMLInputElement).value).toBe("6");
  });

  it("steps down with the spinner button respecting step", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" defaultValue={10} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "common.decrease" }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("clamps spinner steps to min/max", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" defaultValue={99} max={99} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "common.increase" }));
    expect(onChange).toHaveBeenCalledWith(99);
  });

  it("lands on min when stepping from an empty input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={10} max={99} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "common.increase" }));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("emits the new value for controlled usage without touching the input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" value={7} onChange={onChange} readOnly />);
    fireEvent.click(screen.getByRole("button", { name: "common.increase" }));
    expect(onChange).toHaveBeenCalledWith(8);
    // Display comes from the controlled prop, unchanged until the parent re-renders
    expect((screen.getByTestId("num") as HTMLInputElement).value).toBe("7");
  });

  it("renders a suffix between the number and the spinner", () => {
    render(<NumberInput data-testid="num" suffix="sec" />);
    const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
    const suffix = screen.getByText("sec");
    expect(suffix.parentElement).toBe(wrapper);
  });

  it("parses decimal input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" step={0.1} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "2.5" } });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it("disables spinner buttons when disabled", () => {
    render(<NumberInput data-testid="num" disabled />);
    expect((screen.getByRole("button", { name: "common.increase" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "common.decrease" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("calls onChange with parsed integer value", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("does not call onChange for NaN input", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "abc" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("passes a value below min through while it is typed and raises it to min when focus leaves", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={10} onChange={onChange} />);
    const input = screen.getByTestId("num");
    fireEvent.change(input, { target: { value: "5" } });
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect((input as HTMLInputElement).value).toBe("10");
  });

  it("raises a typed value below min to it when Enter is pressed, before the form submits", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={60} onChange={onChange} />);
    const input = screen.getByTestId("num");
    fireEvent.change(input, { target: { value: "30" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(60);
  });

  it("lets a value be typed digit by digit past a minimum of two digits", () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(null);
      return <NumberInput data-testid="num" min={60} max={86400} value={value === null ? "" : String(value)} onChange={setValue} />;
    }
    render(<Controlled />);
    const input = screen.getByTestId("num") as HTMLInputElement;
    for (const typed of ["3", "30", "300"]) {
      fireEvent.change(input, { target: { value: typed } });
      expect(input.value).toBe(typed);
    }
    fireEvent.blur(input);
    expect(input.value).toBe("300");
  });

  it("leaves a value inside the bounds alone when focus leaves", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={10} max={99} onChange={onChange} />);
    const input = screen.getByTestId("num");
    fireEvent.change(input, { target: { value: "42" } });
    onChange.mockClear();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls the caller's own onBlur and onKeyDown", () => {
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    render(<NumberInput data-testid="num" onBlur={onBlur} onKeyDown={onKeyDown} />);
    const input = screen.getByTestId("num");
    fireEvent.keyDown(input, { key: "a" });
    fireEvent.blur(input);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("clamps value to max", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" max={100} onChange={onChange} />);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "200" } });
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("holds the max while typing and the min once the value is settled", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min={0} max={50} onChange={onChange} />);
    const input = screen.getByTestId("num");
    fireEvent.change(input, { target: { value: "75" } });
    expect(onChange).toHaveBeenLastCalledWith(50);
    fireEvent.change(input, { target: { value: "-5" } });
    expect(onChange).toHaveBeenLastCalledWith(-5);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("supports disabled state", () => {
    render(<NumberInput data-testid="num" disabled />);
    const input = screen.getByTestId("num");
    expect(input).toHaveProperty("disabled", true);
  });

  it("does not throw when onChange is not provided", () => {
    render(<NumberInput data-testid="num" />);
    // Should not throw
    fireEvent.change(screen.getByTestId("num"), { target: { value: "10" } });
  });

  it("handles string min/max gracefully (no clamping)", () => {
    const onChange = vi.fn();
    render(<NumberInput data-testid="num" min="5" max="50" onChange={onChange} />);
    // String min/max: typeof min !== "number" so no clamping
    fireEvent.change(screen.getByTestId("num"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith(3);
  });
  it("fills the row when no digit count is given", () => {
    render(<NumberInput data-testid="num" />);
    const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
    expect(drawnClasses(wrapper)).toContain("w-full");
    expect(wrapper.style.width).toBe("");
  });

  it("takes its width from the digit count instead of the row", () => {
    render(<NumberInput data-testid="num" digits={2} />);
    const field = screen.getByTestId("num");
    const wrapper = field.parentElement as HTMLElement;
    expect(drawnClasses(wrapper)).not.toMatch(/(^|\s)w-full(\s|$)/);
    expect(drawnClasses(wrapper)).toContain("w-fit");
    expect(wrapper.style.width).toBe("");
    // The typing field is exactly its digits wide, whatever is drawn beside it.
    expect(field.style.width).toBe("2ch");
    expect(field.style.boxSizing).toBe("content-box");
  });

  it("does not count the suffix or the spinner in the typing field's width", () => {
    render(<NumberInput data-testid="num" digits={3} suffix="kg" />);
    const field = screen.getByTestId("num");
    expect(field.style.width).toBe("3ch");
    // The suffix sits beside the field, so a wider script cannot take room from the number.
    expect(screen.getByText("kg").parentElement).toBe(field.parentElement);
  });

  it("keeps a caller's own field style over the measured width", () => {
    render(<NumberInput data-testid="num" digits={3} style={{ width: "12rem" }} />);
    expect(screen.getByTestId("num").style.width).toBe("12rem");
  });

  it("fills the row when it has no digit count", () => {
    render(<NumberInput data-testid="num" />);
    const field = screen.getByTestId("num");
    expect(drawnClasses(field.parentElement as HTMLElement)).toMatch(/(^|\s)w-full(\s|$)/);
    expect(field.style.width).toBe("");
  });

  describe("height contract", () => {
    // jsdom lays nothing out, so the contract is stated on the computed style: the field takes the
    // box's height by stretching (`height: auto`), which makes its border box equal the box's
    // whatever vertical padding the design gives it. A browser check reads the field's and the
    // box's getBoundingClientRect().height and expects them equal minus the box's borders.
    const withDesignHeight = (css: string) => {
      const sheet = document.createElement("style");
      sheet.textContent = css;
      document.head.append(sheet);
      return sheet;
    };

    it("takes its height from the box and not from a height a design gives every input", () => {
      const sheet = withDesignHeight('[data-slot="number-input-field"] { height: 36px; padding-top: 6px; padding-bottom: 6px; }');
      try {
        render(<NumberInput data-testid="num" digits={2} />);
        const field = screen.getByTestId("num");
        expect(window.getComputedStyle(field).height).toBe("auto");
      } finally {
        sheet.remove();
      }
    });

    it("keeps the digits width and the stretch together, since content-box alone adds the padding to a fixed height", () => {
      render(<NumberInput data-testid="num" digits={3} suffix="kg" />);
      const field = screen.getByTestId("num");
      const computed = window.getComputedStyle(field);
      expect(computed.width).toBe("3ch");
      expect(computed.boxSizing).toBe("content-box");
      expect(computed.height).toBe("auto");
    });

    it("stretches a field without a digit count too", () => {
      const sheet = withDesignHeight('[data-slot="number-input-field"] { height: 36px; }');
      try {
        render(<NumberInput data-testid="num" />);
        expect(window.getComputedStyle(screen.getByTestId("num")).height).toBe("auto");
      } finally {
        sheet.remove();
      }
    });

    it("leaves the box as the one place a height is set", () => {
      render(<NumberInput data-testid="num" digits={2} />);
      const wrapper = screen.getByTestId("num").parentElement as HTMLElement;
      expect(drawnClasses(wrapper)).toContain("h-8");
      expect(drawnClasses(wrapper)).toContain("items-stretch");
    });

    it("keeps a caller's own height over the stretch", () => {
      render(<NumberInput data-testid="num" digits={2} style={{ height: "20px" }} />);
      expect(screen.getByTestId("num").style.height).toBe("20px");
    });
  });
});
