// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FeatureCard } from "../../crud/shared/feature-card";

afterEach(cleanup);

describe("FeatureCard", () => {
  it("TC-FC-1: renders the title, icon, action slot and body", () => {
    render(
      <FeatureCard
        title="댓글"
        icon={<svg data-testid="icon" />}
        action={<button type="button">toggle</button>}
      >
        <div>body-content</div>
      </FeatureCard>,
    );
    expect(screen.getByText("댓글")).toBeDefined();
    expect(screen.getByTestId("icon")).toBeDefined();
    expect(screen.getByRole("button", { name: "toggle" })).toBeDefined();
    expect(screen.getByText("body-content")).toBeDefined();
  });

  it("TC-FC-2: renders a header-less card when neither title nor action is given", () => {
    const { container } = render(
      <FeatureCard>
        <div>only-body</div>
      </FeatureCard>,
    );
    expect(screen.getByText("only-body")).toBeDefined();
    expect(container.querySelector("header")).toBeNull();
  });

  it("TC-FC-3: shows the header for an action-only card (no title)", () => {
    const { container } = render(
      <FeatureCard action={<button type="button">on</button>}>
        <div>body</div>
      </FeatureCard>,
    );
    expect(container.querySelector("header")).not.toBeNull();
    expect(screen.getByRole("button", { name: "on" })).toBeDefined();
  });
});
