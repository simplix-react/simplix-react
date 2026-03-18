// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Separator } from "../../base/display/separator";

afterEach(cleanup);

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    const { container } = render(<Separator />);
    const sep = container.firstElementChild as HTMLElement;
    expect(sep.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("renders a vertical separator", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.firstElementChild as HTMLElement;
    expect(sep.getAttribute("data-orientation")).toBe("vertical");
  });

  it("applies base classes", () => {
    const { container } = render(<Separator />);
    const sep = container.firstElementChild as HTMLElement;
    expect(sep.className).toContain("bg-border");
    expect(sep.className).toContain("shrink-0");
  });

  it("merges custom className", () => {
    const { container } = render(<Separator className="my-sep" />);
    const sep = container.firstElementChild as HTMLElement;
    expect(sep.className).toContain("my-sep");
    expect(sep.className).toContain("bg-border");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("is decorative by default", () => {
    const { container } = render(<Separator />);
    const sep = container.firstElementChild as HTMLElement;
    expect(sep.getAttribute("role")).toBe("none");
  });

  it("has separator role when not decorative", () => {
    const { container } = render(<Separator decorative={false} />);
    const sep = container.firstElementChild as HTMLElement;
    expect(sep.getAttribute("role")).toBe("separator");
  });
});
