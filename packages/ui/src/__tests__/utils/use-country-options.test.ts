// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useLocale: () => "en",
}));

vi.mock("country-flag-icons", () => ({
  countries: ["US", "KR", "JP", "DE", "XX"],
}));

vi.mock("country-flag-icons/react/3x2", () => ({
  US: () => null,
  KR: () => null,
  JP: () => null,
  DE: () => null,
  XX: undefined, // intentionally undefined to test the !Flag branch
}));

import { useCountryOptions } from "../../utils/use-country-options";

// The flag catalog loads lazily, so every assertion waits for the async fill.
async function renderLoaded() {
  const rendered = renderHook(() => useCountryOptions());
  await waitFor(() => expect(rendered.result.current.length).toBeGreaterThan(0));
  return rendered;
}

describe("useCountryOptions", () => {
  it("returns an array of country options once loaded", async () => {
    const { result } = await renderLoaded();

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(4);
  });

  it("each option has code, localName, englishName, and Flag", async () => {
    const { result } = await renderLoaded();

    for (const option of result.current) {
      expect(option).toHaveProperty("code");
      expect(option).toHaveProperty("localName");
      expect(option).toHaveProperty("englishName");
      expect(option).toHaveProperty("Flag");
      expect(typeof option.code).toBe("string");
      expect(typeof option.localName).toBe("string");
      expect(typeof option.englishName).toBe("string");
      expect(typeof option.Flag).toBe("function");
    }
  });

  it("options are sorted by localName", async () => {
    const { result } = await renderLoaded();

    const names = result.current.map((o) => o.localName);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "en"));
    expect(names).toEqual(sorted);
  });

  it("uses Intl.DisplayNames for name resolution", async () => {
    const { result } = await renderLoaded();

    const us = result.current.find((o) => o.code === "US");
    expect(us).toBeDefined();
    // Intl.DisplayNames in en locale should resolve US to "United States"
    expect(us!.englishName).toContain("United States");
  });

  it("skips countries without a flag component", async () => {
    // Our mock includes "XX" in countries but no XX flag in react/3x2
    const { result } = await renderLoaded();
    const codes = result.current.map((o) => o.code);
    expect(codes).toContain("US");
    expect(codes).toContain("KR");
    expect(codes).not.toContain("XX");
    // Should only have 4 options (US, KR, JP, DE), not 5
    expect(result.current.length).toBe(4);
  });
});
