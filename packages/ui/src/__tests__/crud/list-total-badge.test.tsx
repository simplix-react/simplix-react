// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
    locale: "en",
    exists: () => true,
  }),
  useLocale: () => "en",
}));

import { ListTotalBadge } from "../../crud/shared/list-total-badge";

describe("ListTotalBadge", () => {
  it("states the count when it is known", () => {
    render(<ListTotalBadge count={42} />);
    expect(screen.getByText("list.totalCount:42")).toBeTruthy();
  });

  it("states zero when the list is genuinely empty", () => {
    render(<ListTotalBadge count={0} />);
    expect(screen.getByText("list.totalCount:0")).toBeTruthy();
  });

  it("leaves the value empty rather than claiming zero when the count is unknown", () => {
    const { container } = render(<ListTotalBadge />);
    expect(screen.getByText("list.totalCountUnknown")).toBeTruthy();
    expect(container.textContent).not.toContain("list.totalCount:");
  });

  it("keeps its place in the toolbar while the count is unknown", () => {
    const { container } = render(<ListTotalBadge count={null} />);
    // The badge itself must not disappear: a badge that appears when the value
    // lands shifts the whole toolbar line.
    const badge = container.firstElementChild;
    expect(badge).toBeTruthy();
    expect(badge?.getAttribute("aria-busy")).toBe("true");
  });

  it("is not busy once the count is known", () => {
    const { container } = render(<ListTotalBadge count={7} />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBeNull();
  });
});
