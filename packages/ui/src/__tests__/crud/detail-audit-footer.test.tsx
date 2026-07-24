// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

import { DetailAuditFooter } from "../../crud/detail/crud-detail-audit-footer";
import { formatDateTime } from "../../utils/format-date";
import { parseDate } from "../../utils/parse-date";

/** The stamp the footer is expected to render for an instant, in the mocked locale. */
function stamp(iso: string): string {
  return formatDateTime(parseDate(iso)!, "en");
}

describe("DetailAuditFooter", () => {
  it("renders nothing when auditData is undefined", () => {
    const { container } = render(<DetailAuditFooter />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when all audit fields are empty", () => {
    const { container } = render(
      <DetailAuditFooter auditData={{ id: "", createdAt: "", updatedAt: "" }} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders ID when provided", () => {
    render(<DetailAuditFooter auditData={{ id: "simple-id-123" }} />);
    expect(screen.getByText("simple-id-123")).toBeTruthy();
  });

  it("truncates UUID to last 12 characters", () => {
    const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    render(<DetailAuditFooter auditData={{ id: uuid }} />);
    expect(screen.getByText("ef1234567890")).toBeTruthy();
  });

  it("renders created date when provided", () => {
    render(
      <DetailAuditFooter auditData={{ createdAt: "2026-03-11T10:30:00Z" }} />,
    );
    // The stamp reads in the viewer's locale, matching the panel's date fields.
    expect(screen.getByText(stamp("2026-03-11T10:30:00Z"))).toBeTruthy();
  });

  it("renders updated date when provided", () => {
    render(
      <DetailAuditFooter auditData={{ updatedAt: "2026-03-12T14:00:00Z" }} />,
    );
    expect(screen.getByText(stamp("2026-03-12T14:00:00Z"))).toBeTruthy();
  });

  it("renders both created and updated dates", () => {
    render(
      <DetailAuditFooter
        auditData={{
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-02-01T00:00:00Z",
        }}
      />,
    );
    expect(screen.getByText(stamp("2026-01-01T00:00:00Z"))).toBeTruthy();
    expect(screen.getByText(stamp("2026-02-01T00:00:00Z"))).toBeTruthy();
  });

  it("copies ID to clipboard on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    render(<DetailAuditFooter auditData={{ id: uuid }} />);

    const idButton = screen.getByText("ef1234567890").closest("button")!;
    fireEvent.click(idButton);

    expect(writeText).toHaveBeenCalledWith(uuid);
  });

  it("renders all three audit fields together", () => {
    const { container } = render(
      <DetailAuditFooter
        auditData={{
          id: "test-id",
          createdAt: "2026-03-10T09:00:00Z",
          updatedAt: "2026-03-11T15:00:00Z",
        }}
      />,
    );
    // ID should be visible
    expect(container.textContent).toContain("test-id");
    // Both dates should be formatted and visible (content includes year)
    expect(container.textContent).toContain("2026");
  });
});
