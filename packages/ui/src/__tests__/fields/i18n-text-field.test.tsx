// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { I18nText, DetailI18nTextField, DetailI18nTextareaField } from "../../fields/detail/i18n-text-field";

afterEach(cleanup);

vi.mock("@simplix-react/i18n/react", () => ({
  useLocalizedText: () => (map: Record<string, string> | null | undefined, fallback = "") => {
    if (!map) return fallback;
    const val = map["ko"] ?? map["en"] ?? Object.values(map).find((v) => v && v.trim() !== "");
    return (val && val.trim() !== "") ? val : fallback;
  },
}));

// ── I18nText ──

describe("I18nText", () => {
  it("renders localized value", () => {
    render(<I18nText value={{ en: "Hello", ko: "안녕" }} />);
    expect(screen.getByText("안녕")).toBeDefined();
  });

  it("renders em-dash when map is null", () => {
    render(<I18nText value={null} fallback="—" />);
    expect(screen.getByText("—")).toBeDefined();
  });

  it("renders custom fallback when map is null", () => {
    render(<I18nText value={null} fallback="N/A" />);
    expect(screen.getByText("N/A")).toBeDefined();
  });
});

// ── DetailI18nTextField ──

describe("DetailI18nTextField", () => {
  it("renders inside DetailFieldWrapper with label", () => {
    render(<DetailI18nTextField label="Menu Name" value={{ en: "Admin", ko: "관리자" }} layout="inline" />);
    expect(screen.getByText("Menu Name")).toBeDefined();
    expect(screen.getByText("관리자")).toBeDefined();
  });

  it("shows em-dash when map is empty", () => {
    render(<DetailI18nTextField label="Name" value={{}} fallback="—" layout="inline" />);
    expect(screen.getByText("—")).toBeDefined();
  });
});

// ── DetailI18nTextareaField ──

describe("DetailI18nTextareaField", () => {
  it("contains whitespace-pre-wrap class on inner element", () => {
    const { container } = render(
      <DetailI18nTextareaField label="Description" value={{ en: "Hello\nWorld", ko: "안녕\n세계" }} layout="inline" />
    );
    const span = container.querySelector(".whitespace-pre-wrap");
    expect(span).not.toBeNull();
  });

  it("renders em-dash fallback when map is null", () => {
    render(<DetailI18nTextareaField label="Description" value={null} fallback="—" layout="inline" />);
    expect(screen.getByText("—")).toBeDefined();
  });
});
