// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("lucide-react/dynamic", () => ({
  DynamicIcon: (props: { name: string; style?: React.CSSProperties }) =>
    React.createElement("span", {
      "data-testid": "dyn-icon",
      "data-name": props.name,
      style: props.style,
    }),
  dynamicIconImports: {
    circle: () => Promise.resolve({}),
    square: () => Promise.resolve({}),
    triangle: () => Promise.resolve({}),
    "circle-icon": () => Promise.resolve({}),
  },
}));

import { IconField } from "../../../fields/form/icon-field";
import type { IconData } from "../../../base/inputs/icon-picker";

afterEach(cleanup);

const stubIconsList: IconData[] = [
  { name: "circle", categories: ["shapes"], tags: [] },
  { name: "square", categories: ["shapes"], tags: [] },
];

describe("IconField", () => {
  it("TC-IF-1: renders the label text", () => {
    render(
      <IconField
        label="Icon"
        value=""
        onChange={vi.fn()}
        iconsList={stubIconsList}
      />
    );
    expect(screen.getByText("Icon")).toBeDefined();
  });

  it("TC-IF-2: clicking an icon calls onChange", async () => {
    const onChange = vi.fn();
    render(
      <IconField
        label="Icon"
        value=""
        onChange={onChange}
        iconsList={stubIconsList}
        categorized={true}
      />
    );
    // Open the picker
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    // Wait for async icon loading to populate category list
    const shapesButton = await screen.findByTitle("Shapes");
    fireEvent.click(shapesButton);
    // Click the first icon button
    const iconButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("[data-testid='dyn-icon']"));
    expect(iconButtons.length).toBeGreaterThan(0);
    fireEvent.click(iconButtons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("TC-IF-3: error prop renders alert role with error text", () => {
    render(
      <IconField
        label="Icon"
        value=""
        onChange={vi.fn()}
        error="Required"
        iconsList={stubIconsList}
      />
    );
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Required");
  });

  it("TC-IF-4: required prop renders the * marker", () => {
    render(
      <IconField
        label="Icon"
        value=""
        onChange={vi.fn()}
        required
        iconsList={stubIconsList}
      />
    );
    expect(screen.getByText("*")).toBeDefined();
  });

  it("TC-IF-5: description prop renders description text", () => {
    render(
      <IconField
        label="Icon"
        value=""
        onChange={vi.fn()}
        description="Pick one"
        iconsList={stubIconsList}
      />
    );
    expect(screen.getByText("Pick one")).toBeDefined();
  });
});
