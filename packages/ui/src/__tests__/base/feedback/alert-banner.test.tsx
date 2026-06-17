// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { AlertTriangleIcon } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AlertBanner } from "../../../base";

afterEach(cleanup);

/** Resolve the outer banner container (role="alert"). */
function getBanner() {
  return screen.getByRole("alert");
}

describe("AlertBanner", () => {
  it("renders the title and subtitle", () => {
    render(<AlertBanner title="Primary line" subtitle="Secondary line" />);
    expect(screen.getByText("Primary line")).toBeDefined();
    expect(screen.getByText("Secondary line")).toBeDefined();
  });

  it("defaults to the info tone surface with dark variants", () => {
    render(<AlertBanner title="Info" />);
    const banner = getBanner();
    // STATUS_TONES.info.surface
    expect(banner.className).toContain("border-blue-200");
    expect(banner.className).toContain("bg-blue-50/50");
    expect(banner.className).toContain("dark:border-blue-900");
    expect(banner.className).toContain("dark:bg-blue-950/50");
  });

  it("applies the danger tone surface", () => {
    render(<AlertBanner tone="danger" title="Danger" />);
    const banner = getBanner();
    expect(banner.className).toContain("border-red-200");
    expect(banner.className).toContain("bg-red-50/50");
    expect(banner.className).toContain("dark:bg-red-950/50");
  });

  it("applies the warning tone surface", () => {
    render(<AlertBanner tone="warning" title="Warning" />);
    const banner = getBanner();
    expect(banner.className).toContain("border-amber-200");
    expect(banner.className).toContain("dark:border-amber-900");
  });

  it("applies the success tone surface", () => {
    render(<AlertBanner tone="success" title="Success" />);
    const banner = getBanner();
    expect(banner.className).toContain("border-emerald-200");
    expect(banner.className).toContain("dark:bg-emerald-950/50");
  });

  it("applies the neutral tone surface", () => {
    render(<AlertBanner tone="neutral" title="Neutral" />);
    const banner = getBanner();
    expect(banner.className).toContain("border-border");
    expect(banner.className).toContain("bg-muted/30");
  });

  it("uses default density padding", () => {
    render(<AlertBanner title="Default" />);
    const banner = getBanner();
    expect(banner.className).toContain("px-4");
    expect(banner.className).toContain("py-3");
  });

  it("uses sm density padding and typography", () => {
    render(<AlertBanner density="sm" title="Small" />);
    const banner = getBanner();
    expect(banner.className).toContain("px-3");
    expect(banner.className).toContain("py-2");
    expect(screen.getByText("Small").className).toContain("text-sm");
  });

  it("uses hint density padding and forces borderless transparent surface", () => {
    render(<AlertBanner density="hint" tone="danger" title="Hint" />);
    const banner = getBanner();
    expect(banner.className).toContain("p-2.5");
    // hint implies borderless: tone surface tint must NOT be applied
    expect(banner.className).toContain("border-transparent");
    expect(banner.className).toContain("bg-transparent");
    expect(banner.className).not.toContain("bg-red-50/50");
    // hint title typography
    expect(screen.getByText("Hint").className).toContain("text-xs");
  });

  it("drops the tone surface when bordered={false}", () => {
    render(<AlertBanner tone="info" bordered={false} title="Plain" />);
    const banner = getBanner();
    expect(banner.className).toContain("border-transparent");
    expect(banner.className).toContain("bg-transparent");
    expect(banner.className).not.toContain("bg-blue-50/50");
  });

  it("renders the caller-supplied icon with tone color and density size", () => {
    const { container } = render(
      <AlertBanner tone="success" icon={AlertTriangleIcon} title="With icon" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // STATUS_TONES.success.icon
    expect(svg?.getAttribute("class")).toContain("text-emerald-500");
    expect(svg?.getAttribute("class")).toContain("dark:text-emerald-400");
    // default density icon size
    expect(svg?.getAttribute("class")).toContain("size-5");
  });

  it("sizes the icon for hint density", () => {
    const { container } = render(
      <AlertBanner density="hint" icon={AlertTriangleIcon} title="Hint icon" />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("size-3.5");
  });

  it("renders the trailing slot", () => {
    render(
      <AlertBanner title="With trailing" trailing={<span>Offline</span>} />,
    );
    expect(screen.getByText("Offline")).toBeDefined();
  });

  it("renders children and ignores title/subtitle when children are present", () => {
    render(
      <AlertBanner title="Ignored title" subtitle="Ignored subtitle">
        <span>Custom body</span>
      </AlertBanner>,
    );
    expect(screen.getByText("Custom body")).toBeDefined();
    expect(screen.queryByText("Ignored title")).toBeNull();
    expect(screen.queryByText("Ignored subtitle")).toBeNull();
  });

  it("exposes the alert role for assistive technology", () => {
    render(<AlertBanner title="Accessible" />);
    expect(getBanner()).toBeDefined();
  });

  it("merges a custom className", () => {
    render(<AlertBanner className="my-banner" title="Custom class" />);
    const banner = getBanner();
    expect(banner.className).toContain("my-banner");
    expect(banner.className).toContain("rounded-md");
  });

  it("forwards a click handler on the container", () => {
    const onClick = vi.fn();
    render(<AlertBanner title="Clickable" onClick={onClick} />);
    getBanner().click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the container element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<AlertBanner ref={ref} title="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
