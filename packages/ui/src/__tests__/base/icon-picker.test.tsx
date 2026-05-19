// @vitest-environment jsdom
import React, { createRef } from "react";
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

import { IconPicker } from "../../base/inputs/icon-picker";
import {
  getIconPickerLocale,
  getCategoryName,
  interpolate,
} from "../../base/inputs/icon-picker/locales";
import type { IconData } from "../../base/inputs/icon-picker";

afterEach(cleanup);

// Minimal icon list using only keys present in the dynamicIconImports stub
const stubIconsList: IconData[] = [
  { name: "circle", categories: ["shapes"], tags: [] },
  { name: "square", categories: ["shapes"], tags: [] },
  { name: "triangle", categories: ["shapes"], tags: [] },
];

describe("IconPicker", () => {
  it("TC-IP-1: renders trigger button", () => {
    render(
      <IconPicker
        onChange={vi.fn()}
        iconsList={stubIconsList}
        categorized={false}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  it("TC-IP-2: clicking trigger opens popover and shows category list", () => {
    render(
      <IconPicker
        onChange={vi.fn()}
        iconsList={stubIconsList}
        categorized={true}
      />
    );
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    // Category buttons appear (at least the "Random" button + one category)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(1);
  });

  it("TC-IP-3: clicking a category renders icon grid", async () => {
    render(
      <IconPicker
        onChange={vi.fn()}
        iconsList={stubIconsList}
        categorized={true}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    // Wait for async icon loading to populate category list
    const shapesButton = await screen.findByTitle("Shapes");
    fireEvent.click(shapesButton);
    const icons = screen.getAllByTestId("dyn-icon");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("TC-IP-4: clicking an icon calls onChange with kebab-case name", async () => {
    const onChange = vi.fn();
    render(
      <IconPicker
        onChange={onChange}
        iconsList={stubIconsList}
        categorized={true}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    // Wait for async icon loading to populate category list
    const shapesButton = await screen.findByTitle("Shapes");
    fireEvent.click(shapesButton);
    // Click the first icon button in the grid
    const iconButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("[data-testid='dyn-icon']"));
    expect(iconButtons.length).toBeGreaterThan(0);
    fireEvent.click(iconButtons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    const calledWith = onChange.mock.calls[0][0] as string;
    expect(typeof calledWith).toBe("string");
    expect(calledWith.length).toBeGreaterThan(0);
  });

  it("TC-IP-5: clear button calls onChange with empty string", () => {
    const onChange = vi.fn();
    render(
      <IconPicker
        value="circle"
        onChange={onChange}
        iconsList={stubIconsList}
        categorized={false}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    // Clear button should now be visible
    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("TC-IP-6: categorized=false renders random 100 grid (async)", async () => {
    render(
      <IconPicker
        onChange={vi.fn()}
        iconsList={stubIconsList}
        categorized={false}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    const icons = await screen.findAllByTestId("dyn-icon");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("TC-IP-7: iconsList prop limits displayed icons to stub keys intersection", async () => {
    const singleIconList: IconData[] = [{ name: "circle", categories: ["shapes"], tags: [] }];
    render(
      <IconPicker
        onChange={vi.fn()}
        iconsList={singleIconList}
        categorized={false}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    const icons = await screen.findAllByTestId("dyn-icon");
    expect(icons.length).toBe(1);
    expect(icons[0].getAttribute("data-name")).toBe("circle");
  });

  it("TC-IP-8: forwardRef attaches ref to trigger button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconPicker
        ref={ref}
        onChange={vi.fn()}
        iconsList={stubIconsList}
        categorized={false}
      />
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe("button");
  });
});

describe("locales helpers", () => {
  it("TC-IP-9: getCategoryName returns English category name", () => {
    const locale = getIconPickerLocale("en");
    const name = getCategoryName(locale, "animals");
    expect(name).toBe("Animals");
  });

  it("TC-IP-10: interpolate replaces template placeholders", () => {
    const result = interpolate("{{count}} icons", { count: 5 });
    expect(result).toBe("5 icons");
  });

  it("TC-IP-11: getIconPickerLocale returns Korean locale for ko-KR", () => {
    const locale = getIconPickerLocale("ko-KR");
    expect(locale).toBeDefined();
    expect(typeof locale.triggerPlaceholder).toBe("string");
    // Korean locale should differ from English
    const enLocale = getIconPickerLocale("en");
    expect(locale.triggerPlaceholder).not.toBe(enLocale.triggerPlaceholder);
  });
});
