// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";

afterEach(cleanup);

import { EmptyState } from "../../crud/shared/empty-state";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Empty" description="Try adjusting your filters." />);
    expect(screen.getByText("Try adjusting your filters.")).toBeTruthy();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    const paragraphs = container.querySelectorAll("p");
    // Only the title paragraph, no description
    expect(paragraphs).toHaveLength(1);
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        title="No data"
        icon={<span data-testid="custom-icon">Icon</span>}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Create new</button>}
      />,
    );
    expect(screen.getByText("Create new")).toBeTruthy();
  });

  it("does not render icon container when icon not provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector(".bg-muted")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState title="Empty" className="my-custom-class" />,
    );
    expect(container.firstElementChild?.className).toContain("my-custom-class");
  });
});
