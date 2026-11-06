// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EMPTY_VALUE_TEXT, EmptyValue } from "../../index";

afterEach(cleanup);

describe("EmptyValue", () => {
  it("draws the shared placeholder when it is handed nothing", () => {
    const { container } = render(<EmptyValue />);
    expect(container.textContent).toBe(EMPTY_VALUE_TEXT);
  });

  it("draws a single hyphen-minus, never an em dash", () => {
    expect(EMPTY_VALUE_TEXT).toBe("-");
    const { container } = render(<EmptyValue />);
    expect(container.textContent).not.toContain("\u2014");
  });

  it("draws what it is handed instead", () => {
    const { container } = render(<EmptyValue>n/a</EmptyValue>);
    expect(container.textContent).toBe("n/a");
  });
});
