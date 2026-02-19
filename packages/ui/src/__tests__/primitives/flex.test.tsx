// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Flex } from "../../primitives/flex";

afterEach(cleanup);

describe("Flex", () => {
  it("renders a div with flex-row by default", () => {
    render(<Flex data-testid="flex">content</Flex>);
    const el = screen.getByTestId("flex");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("flex-row");
    expect(el.textContent).toBe("content");
  });

  it("inherits Stack variant props", () => {
    render(<Flex data-testid="flex" gap="lg" align="center" />);
    const classes = screen.getByTestId("flex").className;
    expect(classes).toContain("gap-6");
    expect(classes).toContain("items-center");
  });

  it("allows overriding direction to column", () => {
    render(<Flex data-testid="flex" direction="column" />);
    expect(screen.getByTestId("flex").className).toContain("flex-col");
  });

  it("merges custom className", () => {
    render(<Flex data-testid="flex" className="my-class" />);
    const classes = screen.getByTestId("flex").className;
    expect(classes).toContain("flex-row");
    expect(classes).toContain("my-class");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Flex ref={ref}>child</Flex>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
