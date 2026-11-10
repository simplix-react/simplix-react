// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: "en", exists: () => true }),
  useLocale: () => "en",
}));

import { StepIndicator } from "../../crud/form/wizard";

afterEach(cleanup);

const STEPS = [{ title: "Target" }, { title: "Scope" }, { title: "Period" }, { title: "Review" }];

describe("StepIndicator cells", () => {
  it("marks the step in hand as the current one and ticks the steps before it", () => {
    const { container } = render(<StepIndicator steps={STEPS} currentStep={2} variant="cells" />);
    const current = container.querySelectorAll('[aria-current="step"]');
    expect(current).toHaveLength(1);
    expect(current[0]?.textContent).toContain("Period");
    // The two steps before it show a tick instead of their number.
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(screen.queryByText("1")).toBeNull();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("draws no rule between the cells", () => {
    const { container } = render(<StepIndicator steps={STEPS} currentStep={0} variant="cells" />);
    expect(container.querySelectorAll('[data-slot="wizard-step-connector"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-slot="wizard-step-cell"]')).toHaveLength(STEPS.length);
  });

  it("answers a press only on a step the reader has passed", () => {
    const onSelect = vi.fn();
    render(<StepIndicator steps={STEPS} currentStep={2} variant="cells" onSelect={onSelect} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual(["1. Target", "2. Scope"]);
    fireEvent.click(buttons[0]!);
    expect(onSelect).toHaveBeenCalledWith(0);
    // The step in hand and the steps ahead are not buttons.
    expect(screen.queryByRole("button", { name: /Period/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Review/ })).toBeNull();
  });

  it("stops every passed step from answering while something is being sent", () => {
    const onSelect = vi.fn();
    render(<StepIndicator steps={STEPS} currentStep={3} variant="cells" onSelect={onSelect} selectDisabled />);
    for (const button of screen.getAllByRole("button")) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(button);
    }
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("is not interactive without onSelect", () => {
    render(<StepIndicator steps={STEPS} currentStep={3} variant="cells" />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("StepIndicator line", () => {
  it("keeps the rule between markers and the marker as the current step", () => {
    const { container } = render(<StepIndicator steps={STEPS} currentStep={1} />);
    expect(container.querySelectorAll('[data-slot="wizard-step-connector"]')).toHaveLength(STEPS.length - 1);
    expect(container.querySelector('[data-slot="wizard-step-marker"][aria-current="step"]')?.textContent).toBe("2");
    expect(container.querySelectorAll('[data-slot="wizard-step-cell"]')).toHaveLength(0);
  });

  it("ignores onSelect: a line strip only shows where the reader is", () => {
    render(<StepIndicator steps={STEPS} currentStep={3} onSelect={vi.fn()} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
