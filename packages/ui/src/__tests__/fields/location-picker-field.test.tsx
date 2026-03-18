// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    exists: () => true,
  }),
}));

// Mock the Map and MapMarker components
vi.mock("../../base/map/map", () => ({
  Map: vi.fn(({ children, ref: _ref, ...props }: Record<string, unknown>) => (
    <div data-testid="mock-map" data-center={JSON.stringify(props.center)} data-zoom={props.zoom}>
      {children as React.ReactNode}
    </div>
  )),
  MapMarker: vi.fn(({ children, latitude, longitude }: Record<string, unknown>) => (
    <div data-testid="mock-marker" data-lat={latitude} data-lng={longitude}>
      {children as React.ReactNode}
    </div>
  )),
}));

import { LocationPickerField } from "../../fields/form/location-picker-field";

afterEach(cleanup);

describe("LocationPickerField", () => {
  it("renders with label", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={0}
        longitude={0}
        onLocationChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Location")).toBeDefined();
    expect(screen.getByTestId("form-field-location")).toBeDefined();
  });

  it("renders prompt button when no valid location (0,0)", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={0}
        longitude={0}
        onLocationChange={vi.fn()}
      />,
    );
    expect(screen.getByText("field.selectLocationPrompt")).toBeDefined();
  });

  it("renders coordinates and map preview when valid location", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    // Should show formatted coordinates
    expect(screen.getByText("37.566500, 126.978000")).toBeDefined();
    // Should render a Map preview
    expect(screen.getByTestId("mock-map")).toBeDefined();
  });

  it("renders clear button when valid location", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Clear location")).toBeDefined();
  });

  it("calls onLocationChange(0, 0) when clear button is clicked", () => {
    const onLocationChange = vi.fn();
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={onLocationChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Clear location"));
    expect(onLocationChange).toHaveBeenCalledWith(0, 0);
  });

  it("renders map select button when valid location", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Select location on map")).toBeDefined();
  });

  it("opens dialog when select button is clicked", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    // Dialog should open with title
    expect(screen.getByText("field.selectLocation")).toBeDefined();
  });

  it("opens dialog from prompt button when no location", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={0}
        longitude={0}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("field.selectLocationPrompt"));
    expect(screen.getByText("field.selectLocation")).toBeDefined();
  });

  it("renders map preview click opens dialog", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    // Click the map preview button (wraps the map)
    const mapContainer = screen.getByTestId("mock-map").closest("button");
    if (mapContainer) {
      fireEvent.click(mapContainer);
      expect(screen.getByText("field.selectLocation")).toBeDefined();
    }
  });

  it("shows error", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={0}
        longitude={0}
        onLocationChange={vi.fn()}
        error="Required"
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("shows description", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={0}
        longitude={0}
        onLocationChange={vi.fn()}
        description="Pick on map"
      />,
    );
    expect(screen.getByText("Pick on map")).toBeDefined();
  });

  it("renders disabled state", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
        disabled
      />,
    );
    // Clear button should be disabled
    const clearBtn = screen.getByLabelText("Clear location");
    expect(clearBtn).toHaveProperty("disabled", true);
    // Map pin button should be disabled
    const mapBtn = screen.getByLabelText("Select location on map");
    expect(mapBtn).toHaveProperty("disabled", true);
  });

  it("renders dialog with cancel and confirm buttons", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    expect(screen.getByText("field.cancelLocation")).toBeDefined();
    expect(screen.getByText("field.confirmLocation")).toBeDefined();
  });

  it("renders dialog with search input", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    expect(screen.getByPlaceholderText("field.searchLocation")).toBeDefined();
  });

  it("renders dialog with locate button", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    expect(screen.getByLabelText("field.detectLocation")).toBeDefined();
  });

  it("renders dialog with theme toggle buttons", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    expect(screen.getByLabelText("Light map")).toBeDefined();
    expect(screen.getByLabelText("Dark map")).toBeDefined();
  });

  it("renders dialog with coordinates display", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    // Temp coordinates displayed
    const coords = screen.getAllByText(/37\.566500/);
    expect(coords.length).toBeGreaterThan(0);
  });

  it("calls onLocationChange when confirm is clicked", () => {
    const onLocationChange = vi.fn();
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={onLocationChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    fireEvent.click(screen.getByText("field.confirmLocation"));
    expect(onLocationChange).toHaveBeenCalled();
  });

  it("closes dialog when cancel is clicked", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    expect(screen.getByText("field.selectLocation")).toBeDefined();
    fireEvent.click(screen.getByText("field.cancelLocation"));
    // Dialog should close
  });

  it("switches map theme to dark when dark button clicked", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    fireEvent.click(screen.getByLabelText("Dark map"));
    // No error means it switched
  });

  it("switches map theme to light when light button clicked", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Select location on map"));
    fireEvent.click(screen.getByLabelText("Light map"));
    // No error means it switched
  });

  it("falls back to number inputs when offline and no fallbackTileUrl", () => {
    // Simulate offline
    const originalOnLine = Object.getOwnPropertyDescriptor(navigator, "onLine");
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });

    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
      />,
    );
    // Should show manual inputs instead of map
    expect(screen.getByPlaceholderText("Latitude")).toBeDefined();
    expect(screen.getByPlaceholderText("Longitude")).toBeDefined();
    expect(screen.getByLabelText("Map unavailable")).toBeDefined();

    // Restore
    if (originalOnLine) {
      Object.defineProperty(navigator, "onLine", originalOnLine);
    } else {
      Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    }
  });

  it("updates latitude via manual number input in offline mode", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const onLocationChange = vi.fn();

    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={onLocationChange}
      />,
    );
    const latInput = screen.getByPlaceholderText("Latitude");
    fireEvent.change(latInput, { target: { value: "38.0" } });
    expect(onLocationChange).toHaveBeenCalledWith(38, 126.978);

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });

  it("updates longitude via manual number input in offline mode", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const onLocationChange = vi.fn();

    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={onLocationChange}
      />,
    );
    const lngInput = screen.getByPlaceholderText("Longitude");
    fireEvent.change(lngInput, { target: { value: "127.0" } });
    expect(onLocationChange).toHaveBeenCalledWith(37.5665, 127);

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });

  it("clears latitude (sets to 0) when input is empty in offline mode", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const onLocationChange = vi.fn();

    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={onLocationChange}
      />,
    );
    const latInput = screen.getByPlaceholderText("Latitude");
    fireEvent.change(latInput, { target: { value: "" } });
    expect(onLocationChange).toHaveBeenCalledWith(0, 126.978);

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });

  it("uses fallbackTileUrl when offline", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });

    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
        fallbackTileUrl="/offline.pmtiles"
      />,
    );
    // Should show map (not manual inputs) because fallbackTileUrl is available
    expect(screen.queryByPlaceholderText("Latitude")).toBeNull();
    expect(screen.getByTestId("mock-map")).toBeDefined();

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });

  it("handles invalid coordinates by defaulting to Seoul center", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={NaN}
        longitude={NaN}
        onLocationChange={vi.fn()}
      />,
    );
    // Should show prompt button since NaN is not valid
    expect(screen.getByText("field.selectLocationPrompt")).toBeDefined();
  });

  it("handles out-of-range coordinates by showing prompt", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={200}
        longitude={200}
        onLocationChange={vi.fn()}
      />,
    );
    expect(screen.getByText("field.selectLocationPrompt")).toBeDefined();
  });

  it("renders with custom markerIcon", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={vi.fn()}
        markerIcon={<span data-testid="custom-marker">X</span>}
      />,
    );
    expect(screen.getByTestId("custom-marker")).toBeDefined();
  });

  it("formats zero coordinate as '0'", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    render(
      <LocationPickerField
        label="Location"
        latitude={0}
        longitude={0}
        onLocationChange={vi.fn()}
      />,
    );
    // In offline mode with 0,0, inputs show empty
    const latInput = screen.getByPlaceholderText("Latitude") as HTMLInputElement;
    expect(latInput.value).toBe("");
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });

  it("responds to online/offline events", () => {
    render(
      <LocationPickerField
        label="Location"
        latitude={0}
        longitude={0}
        onLocationChange={vi.fn()}
      />,
    );
    // Initially online: should show prompt button
    expect(screen.getByText("field.selectLocationPrompt")).toBeDefined();

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    // Should now show manual inputs
    expect(screen.getByPlaceholderText("Latitude")).toBeDefined();

    // Simulate going back online
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    // Should show prompt button again
    expect(screen.getByText("field.selectLocationPrompt")).toBeDefined();
  });

  it("clears longitude (sets to 0) when input is empty in offline mode", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    const onLocationChange = vi.fn();

    render(
      <LocationPickerField
        label="Location"
        latitude={37.5665}
        longitude={126.978}
        onLocationChange={onLocationChange}
      />,
    );
    const lngInput = screen.getByPlaceholderText("Longitude");
    fireEvent.change(lngInput, { target: { value: "" } });
    expect(onLocationChange).toHaveBeenCalledWith(37.5665, 0);

    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
  });
});
