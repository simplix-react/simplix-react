// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusDot } from "../../base";
import { STATUS_TONES } from "../../base";

afterEach(cleanup);

describe("StatusDot", () => {
  it("renders a solid dot of the given tone by default", () => {
    const { container } = render(<StatusDot tone="success" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.tagName).toBe("SPAN");
    // md is the default size on both wrapper and dot
    expect(wrapper.className).toContain("size-2");
    const dot = wrapper.querySelector("span");
    expect(dot?.className).toContain(STATUS_TONES.success.dot);
  });

  it("maps size tokens to size-* classes", () => {
    const { container: sm } = render(<StatusDot tone="info" size="sm" />);
    expect((sm.firstElementChild as HTMLElement).className).toContain("size-1.5");

    const { container: lg } = render(<StatusDot tone="info" size="lg" />);
    expect((lg.firstElementChild as HTMLElement).className).toContain("size-3");
  });

  it("renders no ring layer when animation is none", () => {
    const { container } = render(<StatusDot tone="danger" animation="none" />);
    expect(container.querySelector(".animate-ping")).toBeNull();
    expect(container.querySelector(".animate-status-flash")).toBeNull();
  });

  it("renders a ping ring when animation is ping and active", () => {
    const { container } = render(<StatusDot tone="danger" animation="ping" />);
    const ring = container.querySelector(".animate-ping");
    expect(ring).not.toBeNull();
    expect(ring?.className).toContain(STATUS_TONES.danger.ring);
    expect(ring?.className).toContain("opacity-75");
  });

  it("renders a flash ring when animation is flash and active", () => {
    const { container } = render(<StatusDot tone="warning" animation="flash" />);
    expect(container.querySelector(".animate-status-flash")).not.toBeNull();
  });

  it("suppresses the ring and dims to neutral when inactive", () => {
    const { container } = render(
      <StatusDot tone="success" animation="ping" active={false} />,
    );
    // No ring at all when inactive, even with animation set.
    expect(container.querySelector(".animate-ping")).toBeNull();
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("opacity-60");
    const dot = wrapper.querySelector("span");
    expect(dot?.className).toContain(STATUS_TONES.neutral.dot);
    expect(dot?.className).not.toContain(STATUS_TONES.success.dot);
  });

  it("carries dark: variant classes for tone-driven dot", () => {
    // neutral dot bundle includes a dark: variant
    const { container } = render(<StatusDot tone="neutral" />);
    const dot = container.querySelector("span span") ?? container.querySelector("span");
    expect(dot?.className).toContain("dark:bg-slate-600");
  });

  it("renders custom children in place of the solid dot", () => {
    render(
      <StatusDot tone="info">
        <i data-testid="custom-fg" />
      </StatusDot>,
    );
    expect(screen.getByTestId("custom-fg")).toBeDefined();
  });

  it("exposes label via aria-label and img role", () => {
    render(<StatusDot tone="success" label="Online" />);
    const el = screen.getByLabelText("Online");
    expect(el).toBeDefined();
    expect(el.getAttribute("role")).toBe("img");
  });

  it("merges custom className and forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <StatusDot tone="info" className="my-dot" ref={ref} />,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain("my-dot");
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
