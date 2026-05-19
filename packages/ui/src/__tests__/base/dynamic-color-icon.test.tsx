// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
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

import { DynamicColorIcon } from "../../base/display/dynamic-color-icon";

afterEach(cleanup);

describe("DynamicColorIcon", () => {
  it("TC-DCI-1: kebab-case input passes through unchanged", () => {
    render(<DynamicColorIcon iconName="circle" />);
    const icon = screen.getByTestId("dyn-icon");
    expect(icon.getAttribute("data-name")).toBe("circle");
  });

  it("TC-DCI-2: PascalCase input normalizes to kebab-case", () => {
    render(<DynamicColorIcon iconName="Circle" />);
    const icon = screen.getByTestId("dyn-icon");
    expect(icon.getAttribute("data-name")).toBe("circle");
  });

  it("TC-DCI-3: snake_case input normalizes to kebab-case", () => {
    render(<DynamicColorIcon iconName="circle_icon" />);
    const icon = screen.getByTestId("dyn-icon");
    expect(icon.getAttribute("data-name")).toBe("circle-icon");
  });

  it("TC-DCI-4: camelCase input normalizes to kebab-case", () => {
    render(<DynamicColorIcon iconName="circleIcon" />);
    const icon = screen.getByTestId("dyn-icon");
    expect(icon.getAttribute("data-name")).toBe("circle-icon");
  });

  it("TC-DCI-5: color defaults to #94a3b8 when not provided", () => {
    render(<DynamicColorIcon iconName="circle" />);
    const icon = screen.getByTestId("dyn-icon") as HTMLElement;
    // jsdom converts hex colors to rgb(...) format
    expect((icon.style as CSSStyleDeclaration).color).toMatch(
      /^(#94a3b8|rgb\(148,\s*163,\s*184\))$/i
    );
  });

  it("TC-DCI-6: explicit color prop is applied", () => {
    render(<DynamicColorIcon iconName="circle" color="#ff0000" />);
    const icon = screen.getByTestId("dyn-icon") as HTMLElement;
    // jsdom converts hex colors to rgb(...) format
    expect((icon.style as CSSStyleDeclaration).color).toMatch(
      /^(#ff0000|rgb\(255,\s*0,\s*0\))$/i
    );
  });

  it("TC-DCI-7: unsupported iconLibrary triggers console.warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<DynamicColorIcon iconName="circle" iconLibrary="phosphor" />);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it("TC-DCI-8: null iconName falls back to circle with default color", () => {
    render(<DynamicColorIcon iconName={null} />);
    const icon = screen.getByTestId("dyn-icon") as HTMLElement;
    expect(icon.getAttribute("data-name")).toBe("circle");
    // jsdom converts hex colors to rgb(...) format
    expect((icon.style as CSSStyleDeclaration).color).toMatch(
      /^(#94a3b8|rgb\(148,\s*163,\s*184\))$/i
    );
  });
});
