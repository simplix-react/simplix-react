// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DetailCountryField } from "../../fields/detail/country-field";
import { DetailDateField } from "../../fields/detail/date-field";
import { DetailLocationField } from "../../fields/detail/location-field";
import { DetailNoteField } from "../../fields/detail/note-field";
import { DetailTextField } from "../../fields/detail/text-field";
import { DetailTimezoneField } from "../../fields/detail/timezone-field";

// Mock the Map component to avoid WebGL initialization in jsdom
vi.mock("../../base/map/map", () => ({
  Map: ({ children }: { children?: React.ReactNode }) => <div data-testid="mock-map">{children}</div>,
  MapMarker: ({ children }: { children?: React.ReactNode }) => <div data-testid="mock-marker">{children}</div>,
}));

// Mock window.matchMedia for components that use it
if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(cleanup);

// ── DetailNoteField ──

describe("DetailNoteField", () => {
  it("renders value as paragraph", () => {
    render(<DetailNoteField value="Some notes here" />);
    const p = screen.getByText("Some notes here");
    expect(p.tagName).toBe("P");
  });

  it("applies card styling", () => {
    render(<DetailNoteField value="Note text" />);
    const p = screen.getByText("Note text");
    expect(p.className).toContain("rounded-md");
    expect(p.className).toContain("bg-muted/50");
  });

  it("returns null when value is null and no fallback", () => {
    const { container } = render(<DetailNoteField value={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when value is undefined and no fallback", () => {
    const { container } = render(<DetailNoteField value={undefined} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows fallback when value is null", () => {
    render(<DetailNoteField value={null} fallback="No description" />);
    expect(screen.getByText("No description")).toBeDefined();
  });

  it("shows value when both value and fallback are provided", () => {
    render(<DetailNoteField value="Real note" fallback="Fallback" />);
    expect(screen.getByText("Real note")).toBeDefined();
    expect(screen.queryByText("Fallback")).toBeNull();
  });

  it("merges custom className", () => {
    render(<DetailNoteField value="Text" className="custom-note" />);
    const p = screen.getByText("Text");
    expect(p.className).toContain("custom-note");
  });

  it("has whitespace-pre-wrap class", () => {
    render(<DetailNoteField value="Some text" />);
    const p = screen.getByText("Some text");
    expect(p.className).toContain("whitespace-pre-wrap");
  });
});

// ── DetailCountryField ──

describe("DetailCountryField", () => {
  it("renders with label", () => {
    render(<DetailCountryField label="Country" value="US" />);
    expect(screen.getByText("Country")).toBeDefined();
    expect(screen.getByTestId("detail-field-country")).toBeDefined();
  });

  it("shows country name when valid code is provided", () => {
    render(<DetailCountryField label="Country" value="US" />);
    // The useCountryOptions hook will return localized country name.
    // In test env with en locale, it should show "United States"
    const wrapper = screen.getByTestId("detail-field-country");
    const valueSpan = wrapper.querySelector(".field-value");
    expect(valueSpan?.textContent).toBeTruthy();
    expect(valueSpan?.textContent).not.toBe("\u2014");
  });

  it("shows fallback when value is null", () => {
    render(<DetailCountryField label="Country" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback when value is empty string", () => {
    render(<DetailCountryField label="Country" value="" />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows custom fallback", () => {
    render(<DetailCountryField label="Country" value={null} fallback="N/A" />);
    expect(screen.getByText("N/A")).toBeDefined();
  });

  it("shows unknown value as-is when country code not found", () => {
    render(<DetailCountryField label="Country" value="ZZ" />);
    const wrapper = screen.getByTestId("detail-field-country");
    const valueSpan = wrapper.querySelector(".field-value");
    // If code is not in options, shows the raw value
    expect(valueSpan?.textContent).toBe("ZZ");
  });

  it("generates test id from label", () => {
    render(<DetailCountryField label="Origin Country" value="KR" />);
    expect(screen.getByTestId("detail-field-origin-country")).toBeDefined();
  });
});

// ── DetailLocationField ──

describe("DetailLocationField", () => {
  it("renders with label and coordinates", () => {
    render(
      <DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />,
    );
    expect(screen.getByText("Location")).toBeDefined();
    expect(screen.getByTestId("detail-field-location")).toBeDefined();
  });

  it("shows formatted coordinates", () => {
    render(
      <DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />,
    );
    expect(screen.getByText("37.566500, 126.978000")).toBeDefined();
  });

  it("shows fallback when coordinates are 0,0", () => {
    render(
      <DetailLocationField label="Location" latitude={0} longitude={0} />,
    );
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows custom fallback", () => {
    render(
      <DetailLocationField
        label="Location"
        latitude={0}
        longitude={0}
        fallback="No location"
      />,
    );
    expect(screen.getByText("No location")).toBeDefined();
  });

  it("returns null when hideWhenEmpty is true and no valid location", () => {
    const { container } = render(
      <DetailLocationField
        label="Location"
        latitude={0}
        longitude={0}
        hideWhenEmpty
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders when hideWhenEmpty is true but valid location exists", () => {
    render(
      <DetailLocationField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        hideWhenEmpty
      />,
    );
    expect(screen.getByText("37.566500, 126.978000")).toBeDefined();
  });

  it("shows fallback for invalid latitude", () => {
    render(
      <DetailLocationField label="Location" latitude={-100} longitude={50} />,
    );
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback for invalid longitude", () => {
    render(
      <DetailLocationField label="Location" latitude={50} longitude={200} />,
    );
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback for NaN coordinates", () => {
    render(
      <DetailLocationField label="Location" latitude={NaN} longitude={NaN} />,
    );
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback for Infinity coordinates", () => {
    render(
      <DetailLocationField label="Location" latitude={Infinity} longitude={0} />,
    );
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("renders map expand button for valid location", () => {
    render(
      <DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />,
    );
    expect(screen.getByLabelText("field.locationTitle")).toBeDefined();
  });
});

// ── DetailDateField (additional coverage) ──

describe("DetailDateField (extended)", () => {
  it("formats as datetime", () => {
    render(
      <DetailDateField
        label="Created"
        value={new Date("2024-06-15T14:30:00")}
        format="datetime"
      />,
    );
    const wrapper = screen.getByTestId("detail-field-created");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    expect(valueText).not.toBe("\u2014");
    // Should contain time-related information
    expect(valueText.length).toBeGreaterThan(5);
  });

  it("formats as relative time", () => {
    // Use a date close to now for meaningful relative time
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    render(
      <DetailDateField
        label="Updated"
        value={yesterday}
        format="relative"
      />,
    );
    const wrapper = screen.getByTestId("detail-field-updated");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    expect(valueText).not.toBe("\u2014");
    expect(valueText.length).toBeGreaterThan(0);
  });

  it("handles unix timestamp in seconds", () => {
    // 1705276800 = Jan 15, 2024 in seconds
    render(
      <DetailDateField label="Date" value={1705276800} />,
    );
    const wrapper = screen.getByTestId("detail-field-date");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    expect(valueText).not.toBe("\u2014");
  });

  it("handles unix timestamp in milliseconds", () => {
    render(
      <DetailDateField label="Date" value={1705276800000} />,
    );
    const wrapper = screen.getByTestId("detail-field-date");
    const valueText = wrapper.querySelector(".field-value")?.textContent ?? "";
    expect(valueText).not.toBe("\u2014");
  });

  it("shows custom fallback", () => {
    render(
      <DetailDateField label="Date" value={null} fallback="Not set" />,
    );
    expect(screen.getByText("Not set")).toBeDefined();
  });

  it("handles invalid Date object", () => {
    render(
      <DetailDateField label="Date" value={new Date("invalid")} />,
    );
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("renders with layout=inline", () => {
    render(
      <DetailDateField
        label="Created"
        value={new Date("2024-01-15")}
        layout="inline"
      />,
    );
    const wrapper = screen.getByTestId("detail-field-created");
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("justify-between");
  });
});

// ── DetailTextField (additional coverage) ──

describe("DetailTextField (extended)", () => {
  it("shows fallback for empty string", () => {
    render(<DetailTextField label="Name" value="" />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("does not show copy button for empty string value", () => {
    render(<DetailTextField label="Name" value="" copyable />);
    expect(screen.queryByLabelText("Copy to clipboard")).toBeNull();
  });

  it("shows Copied label after clipboard write", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<DetailTextField label="Email" value="test@test.com" copyable />);
    fireEvent.click(screen.getByLabelText("Copy to clipboard"));

    // After click, the button label should change to "Copied"
    await vi.waitFor(() => {
      expect(screen.getByLabelText("Copied")).toBeDefined();
    });
  });

  it("renders with layout=left", () => {
    render(
      <DetailTextField label="Name" value="John" layout="left" />,
    );
    const wrapper = screen.getByTestId("detail-field-name");
    expect(wrapper.className).toContain("grid");
  });

  it("renders with layout=hidden", () => {
    render(
      <DetailTextField label="Name" value="John" layout="hidden" />,
    );
    const wrapper = screen.getByTestId("detail-field-name");
    expect(wrapper.getAttribute("aria-label")).toBe("Name");
    // Label should not be visible
    const labelSpan = wrapper.querySelector(".field-label");
    expect(labelSpan).toBeNull();
  });

  it("renders with custom size", () => {
    render(
      <DetailTextField label="Name" value="John" size="lg" />,
    );
    const wrapper = screen.getByTestId("detail-field-name");
    expect(wrapper.className).toContain("[&_.field-label]:text-base");
  });
});

// ── DetailTimezoneField ──

describe("DetailTimezoneField", () => {
  it("renders with label", () => {
    render(<DetailTimezoneField label="Timezone" value="Asia/Seoul" />);
    expect(screen.getByText("Timezone")).toBeDefined();
    expect(screen.getByTestId("detail-field-timezone")).toBeDefined();
  });

  it("shows timezone info when valid IANA timezone is provided", () => {
    render(<DetailTimezoneField label="Timezone" value="Asia/Seoul" />);
    const wrapper = screen.getByTestId("detail-field-timezone");
    const valueSpan = wrapper.querySelector(".field-value");
    // Should contain some timezone representation
    expect(valueSpan?.textContent).toBeTruthy();
    expect(valueSpan?.textContent).not.toBe("\u2014");
  });

  it("shows fallback when value is null", () => {
    render(<DetailTimezoneField label="Timezone" value={null} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback when value is undefined", () => {
    render(<DetailTimezoneField label="Timezone" value={undefined} />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows fallback when value is empty string", () => {
    render(<DetailTimezoneField label="Timezone" value="" />);
    expect(screen.getByText("\u2014")).toBeDefined();
  });

  it("shows custom fallback", () => {
    render(
      <DetailTimezoneField label="Timezone" value={null} fallback="Not set" />,
    );
    expect(screen.getByText("Not set")).toBeDefined();
  });

  it("shows raw value when timezone ID is not found in options", () => {
    render(
      <DetailTimezoneField label="Timezone" value="Invalid/Zone" />,
    );
    const wrapper = screen.getByTestId("detail-field-timezone");
    const valueSpan = wrapper.querySelector(".field-value");
    expect(valueSpan?.textContent).toBe("Invalid/Zone");
  });

  it("generates test id from label", () => {
    render(<DetailTimezoneField label="Server Timezone" value="UTC" />);
    expect(screen.getByTestId("detail-field-server-timezone")).toBeDefined();
  });
});
