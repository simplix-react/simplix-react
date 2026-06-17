// @vitest-environment jsdom
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DetailList, DetailListRow } from "../../base";

afterEach(cleanup);

describe("DetailListRow", () => {
  it("renders the primary content with medium-weight truncating text", () => {
    render(<DetailListRow primary="Region" />);
    const primary = screen.getByText("Region");
    expect(primary).toBeDefined();
    expect(primary.className).toContain("font-medium");
    expect(primary.className).toContain("flex-1");
    expect(primary.className).toContain("truncate");
    expect(primary.className).toContain("text-sm");
  });

  it("renders the leading icon when provided", () => {
    render(
      <DetailListRow
        icon={<span data-testid="leading-icon">★</span>}
        primary="With icon"
      />,
    );
    expect(screen.getByTestId("leading-icon")).toBeDefined();
  });

  it("omits the leading icon slot when not provided", () => {
    render(<DetailListRow primary="No icon" />);
    expect(screen.queryByTestId("leading-icon")).toBeNull();
  });

  it("renders the trailing slot when provided", () => {
    render(
      <DetailListRow
        primary="With trailing"
        trailing={<span data-testid="trailing-slot">us-east-1</span>}
      />,
    );
    expect(screen.getByTestId("trailing-slot")).toBeDefined();
  });

  it("omits the trailing slot when not provided", () => {
    render(<DetailListRow primary="No trailing" />);
    expect(screen.queryByTestId("trailing-slot")).toBeNull();
  });

  it("applies the fixed-height bordered layout classes", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DetailListRow ref={ref} primary="Layout" />);
    expect(ref.current?.className).toContain("h-10");
    expect(ref.current?.className).toContain("border-b");
    expect(ref.current?.className).toContain("last:border-b-0");
    expect(ref.current?.className).toContain("px-4");
  });

  it("stays non-interactive without onClick", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DetailListRow ref={ref} primary="Static" />);
    expect(ref.current?.getAttribute("role")).toBeNull();
    expect(ref.current?.getAttribute("tabindex")).toBeNull();
    expect(ref.current?.className).not.toContain("cursor-pointer");
  });

  it("becomes an interactive button when onClick is set", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DetailListRow ref={ref} primary="Clickable" onClick={vi.fn()} />);
    expect(ref.current?.getAttribute("role")).toBe("button");
    expect(ref.current?.getAttribute("tabindex")).toBe("0");
    expect(ref.current?.className).toContain("cursor-pointer");
    expect(ref.current?.className).toContain("hover:bg-muted/50");
  });

  it("fires onClick on mouse click", () => {
    const onClick = vi.fn();
    render(<DetailListRow primary="Clickable" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("activates onClick with the Enter key", () => {
    const onClick = vi.fn();
    render(<DetailListRow primary="Clickable" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("activates onClick with the Space key", () => {
    const onClick = vi.fn();
    render(<DetailListRow primary="Clickable" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated keys", () => {
    const onClick = vi.fn();
    render(<DetailListRow primary="Clickable" onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Escape" });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges a custom className onto the row", () => {
    const ref = createRef<HTMLDivElement>();
    render(<DetailListRow ref={ref} primary="Custom" className="my-row" />);
    expect(ref.current?.className).toContain("my-row");
    expect(ref.current?.className).toContain("h-10");
  });
});

describe("DetailList", () => {
  it("renders children inside a bordered rounded container", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DetailList ref={ref}>
        <DetailListRow primary="A" />
        <DetailListRow primary="B" />
      </DetailList>,
    );
    expect(ref.current?.className).toContain("overflow-hidden");
    expect(ref.current?.className).toContain("rounded-lg");
    expect(ref.current?.className).toContain("border");
    expect(screen.getByText("A")).toBeDefined();
    expect(screen.getByText("B")).toBeDefined();
  });

  it("merges a custom className onto the container", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DetailList ref={ref} className="my-list">
        <DetailListRow primary="A" />
      </DetailList>,
    );
    expect(ref.current?.className).toContain("my-list");
    expect(ref.current?.className).toContain("rounded-lg");
  });
});
