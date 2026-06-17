// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LabeledField } from "../../base";

afterEach(cleanup);

describe("LabeledField", () => {
  it("renders the label", () => {
    render(<LabeledField label="Display Name" control={<button>X</button>} />);
    expect(screen.getByText("Display Name")).toBeTruthy();
  });

  it("renders the control", () => {
    render(
      <LabeledField label="With Control" control={<button>Toggle</button>} />,
    );
    expect(screen.getByRole("button", { name: "Toggle" })).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(
      <LabeledField
        label="Notifications"
        description="Enable email alerts"
        control={<button>X</button>}
      />,
    );
    expect(screen.getByText("Enable email alerts")).toBeTruthy();
  });

  it("does not render description when omitted", () => {
    const { container } = render(
      <LabeledField label="No Desc" control={<button>X</button>} />,
    );
    expect(container.querySelector("p")).toBeNull();
  });

  it("wires the label to the control via htmlFor", () => {
    render(
      <LabeledField
        label="Linked"
        htmlFor="field-1"
        control={<input id="field-1" />}
      />,
    );
    const label = screen.getByText("Linked");
    expect(label.closest("label")?.getAttribute("for")).toBe("field-1");
  });

  it("applies cursor-pointer to the label when htmlFor is set", () => {
    render(
      <LabeledField
        label="Clickable"
        htmlFor="field-2"
        control={<input id="field-2" />}
      />,
    );
    const label = screen.getByText("Clickable").closest("label");
    expect(label?.className).toContain("cursor-pointer");
  });

  it("omits cursor-pointer when htmlFor is not set", () => {
    render(<LabeledField label="Static" control={<button>X</button>} />);
    const label = screen.getByText("Static").closest("label");
    expect(label?.className).not.toContain("cursor-pointer");
    expect(label?.getAttribute("for")).toBeNull();
  });

  it("applies start alignment by default (items-start)", () => {
    const { container } = render(
      <LabeledField label="Default Align" control={<button>X</button>} />,
    );
    const row = container.firstElementChild;
    expect(row?.className).toContain("items-start");
  });

  it("applies center alignment when align='center'", () => {
    const { container } = render(
      <LabeledField
        label="Centered"
        align="center"
        control={<button>X</button>}
      />,
    );
    const row = container.firstElementChild;
    expect(row?.className).toContain("items-center");
  });

  it("renders the description with a dark-mode-correct muted token", () => {
    render(
      <LabeledField
        label="Themed"
        description="Helper text"
        control={<button>X</button>}
      />,
    );
    const desc = screen.getByText("Helper text");
    // Semantic muted token resolves correctly in both light and dark themes.
    expect(desc.className).toContain("text-muted-foreground");
  });

  it("merges custom className onto the outer row", () => {
    const { container } = render(
      <LabeledField
        label="Custom"
        className="my-row"
        control={<button>X</button>}
      />,
    );
    expect(container.firstElementChild?.className).toContain("my-row");
  });
});
