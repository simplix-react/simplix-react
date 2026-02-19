// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Label } from "../../base/label";

afterEach(cleanup);

describe("Label", () => {
  it("renders with text content", () => {
    render(<Label>Username</Label>);
    const label = screen.getByText("Username");
    expect(label).toBeDefined();
    expect(label.tagName).toBe("LABEL");
  });

  it("applies base classes", () => {
    render(<Label>Name</Label>);
    const label = screen.getByText("Name");
    expect(label.className).toContain("text-sm");
    expect(label.className).toContain("font-medium");
  });

  it("merges custom className", () => {
    render(<Label className="my-label">Custom</Label>);
    const label = screen.getByText("Custom");
    expect(label.className).toContain("my-label");
    expect(label.className).toContain("text-sm");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Ref</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it("associates with input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    const label = screen.getByText("Email");
    expect(label).toHaveProperty("htmlFor", "email");
  });
});
