// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { CircleIcon } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";

import { StatusBadge } from "../../base";
import { STATUS_TONES } from "../../base";

afterEach(cleanup);

describe("StatusBadge", () => {
  it("renders the provided label", () => {
    render(<StatusBadge tone="success" label="Active" />);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("defaults to outline appearance with border + tone outline classes", () => {
    const { container } = render(<StatusBadge tone="info" label="Info" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toContain("border");
    expect(pill.className).toContain("bg-transparent");
    expect(pill.className).toContain(STATUS_TONES.info.outline);
    // outline tone classes carry dark: variants
    expect(pill.className).toContain("dark:text-blue-400");
  });

  it("uses the filled badge bundle when appearance is filled", () => {
    const { container } = render(
      <StatusBadge tone="success" label="Done" appearance="filled" />,
    );
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.className).toContain(STATUS_TONES.success.badge);
    expect(pill.className).toContain("dark:bg-emerald-900");
    expect(pill.className).not.toContain("bg-transparent");
  });

  it("maps size tokens to text + padding classes", () => {
    const { container: xs } = render(
      <StatusBadge tone="info" label="x" size="xs" />,
    );
    expect((xs.firstElementChild as HTMLElement).className).toContain("text-[0.625rem]");

    const { container: sm } = render(
      <StatusBadge tone="info" label="s" size="sm" />,
    );
    expect((sm.firstElementChild as HTMLElement).className).toContain("text-xs");

    const { container: def } = render(
      <StatusBadge tone="info" label="d" size="default" />,
    );
    expect((def.firstElementChild as HTMLElement).className).toContain("text-sm");
  });

  it("defaults to the compact sm size when size is omitted", () => {
    const { container } = render(<StatusBadge tone="info" label="d" />);
    expect((container.firstElementChild as HTMLElement).className).toContain("text-xs");
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
    expect(dot?.className).toContain(STATUS_TONES.success.dot);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("pulses the leading dot when pulse is set", () => {
    const { container } = render(
      <StatusBadge tone="processing" label="Syncing" showDot pulse />,
    );
    expect(container.querySelector(".animate-ping")).not.toBeNull();
  });

  it("does not pulse the dot without the pulse prop", () => {
    const { container } = render(
      <StatusBadge tone="processing" label="Idle" showDot />,
    );
    expect(container.querySelector(".animate-ping")).toBeNull();
  });

  it("merges custom className and forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <StatusBadge tone="info" label="Ref" className="my-pill" ref={ref} />,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain("my-pill");
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
