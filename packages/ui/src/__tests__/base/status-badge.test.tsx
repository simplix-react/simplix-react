// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { CircleIcon } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusBadge } from "../../base";
import { STATUS_TONES } from "../../base";
import { drawnClasses } from "../helpers/drawn-classes";

afterEach(cleanup);

describe("StatusBadge", () => {
  it("renders the provided label", () => {
    render(<StatusBadge tone="success" label="Active" />);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("defaults to outline appearance with border + tone outline classes", () => {
    const { container } = render(<StatusBadge tone="info" label="Info" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(drawnClasses(pill)).toContain("border");
    expect(drawnClasses(pill)).toContain("bg-transparent");
    expect(drawnClasses(pill)).toContain(STATUS_TONES.info.outline);
    // outline tone classes carry dark: variants
    expect(drawnClasses(pill)).toContain("dark:text-blue-400");
  });

  it("uses the filled badge bundle when appearance is filled", () => {
    const { container } = render(
      <StatusBadge tone="success" label="Done" appearance="filled" />,
    );
    const pill = container.firstElementChild as HTMLElement;
    expect(drawnClasses(pill)).toContain(STATUS_TONES.success.badge);
    expect(drawnClasses(pill)).toContain("dark:bg-emerald-900");
    expect(drawnClasses(pill)).not.toContain("bg-transparent");
  });

  it("maps size tokens to text + padding classes", () => {
    const { container: xs } = render(
      <StatusBadge tone="info" label="x" size="xs" />,
    );
    expect(drawnClasses((xs.firstElementChild as HTMLElement))).toContain("text-[0.625rem]");

    const { container: sm } = render(
      <StatusBadge tone="info" label="s" size="sm" />,
    );
    expect(drawnClasses((sm.firstElementChild as HTMLElement))).toContain("text-xs");

    const { container: def } = render(
      <StatusBadge tone="info" label="d" size="default" />,
    );
    expect(drawnClasses((def.firstElementChild as HTMLElement))).toContain("text-sm");
  });

  it("defaults to the compact sm size when size is omitted", () => {
    const { container } = render(<StatusBadge tone="info" label="d" />);
    expect(drawnClasses((container.firstElementChild as HTMLElement))).toContain("text-xs");
  });

  it("renders a leading icon with tone icon color in outline mode", () => {
    const { container } = render(
      <StatusBadge tone="danger" label="Err" icon={CircleIcon} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toContain("size-3.5");
    expect(svg?.getAttribute("class")).toContain(STATUS_TONES.danger.icon);
  });

  it("omits the tone icon color for icons in filled mode", () => {
    const { container } = render(
      <StatusBadge
        tone="danger"
        label="Err"
        icon={CircleIcon}
        appearance="filled"
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("size-3.5");
    expect(svg?.getAttribute("class")).not.toContain(STATUS_TONES.danger.icon);
  });

  it("renders a leading dot when showDot is set", () => {
    const { container } = render(
      <StatusBadge tone="success" label="On" showDot />,
    );
    // pill > StatusDot wrapper > solid dot leaf
    const dot = container.querySelector("span span span");
    expect(drawnClasses(dot)).toContain(STATUS_TONES.success.dot);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("pulses the leading dot when pulse is set", () => {
    const { container } = render(
      <StatusBadge tone="processing" label="Syncing" showDot pulse />,
    );
    expect(container.querySelector("[data-slot='status-dot-ring'][data-animation='ping']")).not.toBeNull();
  });

  it("does not pulse the dot without the pulse prop", () => {
    const { container } = render(
      <StatusBadge tone="processing" label="Idle" showDot />,
    );
    expect(container.querySelector("[data-slot='status-dot-ring'][data-animation='ping']")).toBeNull();
  });

  it("merges custom className and forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <StatusBadge tone="info" label="Ref" className="my-pill" ref={ref} />,
    );
    expect(drawnClasses((container.firstElementChild as HTMLElement))).toContain("my-pill");
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
