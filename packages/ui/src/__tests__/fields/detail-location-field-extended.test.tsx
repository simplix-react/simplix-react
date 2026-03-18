// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

vi.mock("../../base/map/map", () => ({
  Map: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="mock-map" className={className}>{children}</div>
  ),
  MapMarker: ({ children }: { children?: React.ReactNode }) => <div data-testid="mock-marker">{children}</div>,
}));

if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
  });
}

import { DetailLocationField } from "../../fields/detail/location-field";

afterEach(cleanup);

describe("DetailLocationField handleOpenChange", () => {
  it("opens dialog and renders without error in dark mode", () => {
    document.documentElement.classList.add("dark");
    render(<DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />);
    fireEvent.click(screen.getByLabelText("field.locationTitle"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    document.documentElement.classList.remove("dark");
  });

  it("opens dialog and renders without error in light mode", () => {
    document.documentElement.classList.remove("dark");
    render(<DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />);
    fireEvent.click(screen.getByLabelText("field.locationTitle"));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("re-opens dialog after closing without error", () => {
    render(<DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />);
    fireEvent.click(screen.getByLabelText("field.locationTitle"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    document.documentElement.classList.add("dark");
    fireEvent.click(screen.getByLabelText("field.locationTitle"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    document.documentElement.classList.remove("dark");
  });
});

describe("DetailLocationField dialog map interactions", () => {
  it("fly-back button does not throw when map ref is null", () => {
    render(<DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />);
    fireEvent.click(screen.getByLabelText("field.locationTitle"));
    fireEvent.click(screen.getByLabelText("field.detectLocation"));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("theme toggle buttons work without error", () => {
    render(<DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />);
    fireEvent.click(screen.getByLabelText("field.locationTitle"));
    fireEvent.click(screen.getByLabelText("Dark map"));
    fireEvent.click(screen.getByLabelText("Light map"));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("dialog map mock receives className prop", () => {
    render(<DetailLocationField label="Location" latitude={37.5665} longitude={126.978} />);
    fireEvent.click(screen.getByLabelText("field.locationTitle"));
    const maps = screen.getAllByTestId("mock-map");
    // Dialog map (second one) should have a className from mapTheme
    const dialogMap = maps[maps.length - 1];
    expect(dialogMap.className).toBeTruthy();
  });
});

describe("DetailLocationField hideWhenEmpty", () => {
  it("returns null when empty and hideWhenEmpty=true", () => {
    const { container } = render(<DetailLocationField label="Location" latitude={0} longitude={0} hideWhenEmpty />);
    expect(container.innerHTML).toBe("");
  });

  it("renders fallback when empty and hideWhenEmpty=false", () => {
    render(<DetailLocationField label="Location" latitude={0} longitude={0} />);
    expect(screen.getByText("\u2014")).toBeTruthy();
  });

  it("renders custom fallback text", () => {
    render(<DetailLocationField label="Location" latitude={0} longitude={0} fallback="N/A" />);
    expect(screen.getByText("N/A")).toBeTruthy();
  });
});

describe("DetailLocationField invalid coordinates", () => {
  it("treats NaN as invalid", () => {
    render(<DetailLocationField label="Location" latitude={NaN} longitude={NaN} />);
    expect(screen.getByText("\u2014")).toBeTruthy();
  });

  it("treats Infinity as invalid", () => {
    render(<DetailLocationField label="Location" latitude={Infinity} longitude={0} />);
    expect(screen.getByText("\u2014")).toBeTruthy();
  });

  it("treats out-of-range latitude as invalid", () => {
    render(<DetailLocationField label="Location" latitude={-91} longitude={0} />);
    expect(screen.getByText("\u2014")).toBeTruthy();
  });

  it("treats out-of-range longitude as invalid", () => {
    render(<DetailLocationField label="Location" latitude={0} longitude={181} />);
    expect(screen.getByText("\u2014")).toBeTruthy();
  });
});
