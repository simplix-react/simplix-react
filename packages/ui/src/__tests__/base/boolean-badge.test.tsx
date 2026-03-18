// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BooleanBadge } from "../../base/display/boolean-badge";

afterEach(cleanup);

describe("BooleanBadge", () => {
  it("renders success variant for true value", () => {
    const { container } = render(<BooleanBadge value={true} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("bg-green-100");
  });

  it("renders outline variant for false value", () => {
    const { container } = render(<BooleanBadge value={false} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("text-foreground");
  });

  it("renders outline variant for null value", () => {
    const { container } = render(<BooleanBadge value={null} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("text-foreground");
  });

  it("renders outline variant for undefined value", () => {
    const { container } = render(<BooleanBadge value={undefined} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("text-foreground");
  });

  it("renders CheckIcon for true value", () => {
    const { container } = render(<BooleanBadge value={true} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("renders XIcon for false value", () => {
    const { container } = render(<BooleanBadge value={false} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("applies custom trueVariant", () => {
    const { container } = render(<BooleanBadge value={true} trueVariant="blue" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("bg-blue-100");
  });

  it("applies custom falseVariant", () => {
    const { container } = render(<BooleanBadge value={false} falseVariant="destructive" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("bg-destructive");
  });

  it("merges custom className", () => {
    const { container } = render(<BooleanBadge value={true} className="my-badge" />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("my-badge");
    expect(badge.className).toContain("px-1.5");
  });
});
