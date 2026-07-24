// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => false,
  }),
}));

import { DatePicker } from "../../base/inputs/date-picker";
import { DateRangePicker } from "../../base/inputs/date-range-picker";

// First popover/dialog mount pays one-time Radix/jsdom initialization cost
vi.setConfig({ testTimeout: 20_000 });

const originalMatchMedia = window.matchMedia;

/** Force the mobile (max-width) media query to a fixed result for the next render. */
function setMobile(mobile: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: mobile && query.includes("max-width"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function openTrigger(container: HTMLElement) {
  fireEvent.click(container.querySelector("button") as HTMLButtonElement);
}

/** The dialog overlay is unique to the mobile (modal-dialog) branch. */
function hasDialogOverlay(): boolean {
  return document.body.querySelector('[class*="bg-black/50"]') != null;
}

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

describe("date pickers — responsive overlay", () => {
  it("DatePicker opens a centered dialog on mobile", () => {
    setMobile(true);
    const { container } = render(<DatePicker value={undefined} onChange={vi.fn()} />);
    openTrigger(container);
    expect(hasDialogOverlay()).toBe(true);
    expect(screen.getByLabelText("Previous month")).toBeDefined();
  });

  it("DatePicker opens an anchored popover (no dialog overlay) on desktop", () => {
    setMobile(false);
    const { container } = render(<DatePicker value={undefined} onChange={vi.fn()} />);
    openTrigger(container);
    expect(hasDialogOverlay()).toBe(false);
    expect(screen.getByLabelText("Previous month")).toBeDefined();
  });

  it("DateRangePicker collapses to a single month inside a dialog on mobile", () => {
    setMobile(true);
    const { container } = render(
      <DateRangePicker
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
        numberOfMonths={2}
      />,
    );
    openTrigger(container);
    expect(hasDialogOverlay()).toBe(true);
    // One visible calendar → a single month/year select pair
    expect(screen.getAllByRole("combobox").length).toBe(2);
  });

  it("DateRangePicker keeps two months in a popover on desktop", () => {
    setMobile(false);
    const { container } = render(
      <DateRangePicker
        value={{ from: undefined, to: undefined }}
        onChange={vi.fn()}
        numberOfMonths={2}
      />,
    );
    openTrigger(container);
    expect(hasDialogOverlay()).toBe(false);
    expect(screen.getAllByRole("combobox").length).toBe(4);
  });
});
