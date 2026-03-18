// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@simplix-react/i18n/react", () => ({
  useLocale: () => "en",
}));

import {
  FALLBACK_TIMEZONES,
  getTimezoneList,
  useTimezoneOptions,
} from "../../utils/use-timezone-options";

describe("FALLBACK_TIMEZONES", () => {
  it("is a non-empty array of timezone strings", () => {
    expect(Array.isArray(FALLBACK_TIMEZONES)).toBe(true);
    expect(FALLBACK_TIMEZONES.length).toBeGreaterThan(0);
  });

  it("includes common timezones", () => {
    expect(FALLBACK_TIMEZONES).toContain("UTC");
    expect(FALLBACK_TIMEZONES).toContain("America/New_York");
    expect(FALLBACK_TIMEZONES).toContain("Asia/Seoul");
    expect(FALLBACK_TIMEZONES).toContain("Europe/London");
  });
});

describe("getTimezoneList", () => {
  it("returns an array of timezone strings", () => {
    const list = getTimezoneList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it("returns Intl.supportedValuesOf result when available", () => {
    const list = getTimezoneList();
    // Node/jsdom supports Intl.supportedValuesOf, so should return many timezones
    expect(list.length).toBeGreaterThanOrEqual(FALLBACK_TIMEZONES.length);
  });

  it("returns fallback when Intl.supportedValuesOf throws", () => {
    const original = Intl.supportedValuesOf;
    Intl.supportedValuesOf = () => { throw new Error("not supported"); };
    try {
      const list = getTimezoneList();
      expect(list).toEqual(FALLBACK_TIMEZONES);
    } finally {
      Intl.supportedValuesOf = original;
    }
  });
});

describe("useTimezoneOptions", () => {
  it("returns an object with groups map", () => {
    const { result } = renderHook(() => useTimezoneOptions());
    expect(result.current).toHaveProperty("groups");
    expect(result.current.groups).toBeInstanceOf(Map);
  });

  it("groups are keyed by region (e.g. America, Europe, Asia)", () => {
    const { result } = renderHook(() => useTimezoneOptions());
    const keys = [...result.current.groups.keys()];
    expect(keys.length).toBeGreaterThan(0);
    // Should contain common regions
    expect(keys).toContain("America");
    expect(keys).toContain("Europe");
    expect(keys).toContain("Asia");
  });

  it("each option has value, label, localizedName, and region", () => {
    const { result } = renderHook(() => useTimezoneOptions());

    for (const [region, options] of result.current.groups) {
      expect(options.length).toBeGreaterThan(0);
      for (const opt of options) {
        expect(opt).toHaveProperty("value");
        expect(opt).toHaveProperty("label");
        expect(opt).toHaveProperty("localizedName");
        expect(opt).toHaveProperty("region");
        expect(opt.region).toBe(region);
        expect(typeof opt.value).toBe("string");
        expect(typeof opt.label).toBe("string");
      }
    }
  });

  it("options within a group are sorted by label", () => {
    const { result } = renderHook(() => useTimezoneOptions());

    for (const [, options] of result.current.groups) {
      const labels = options.map((o) => o.label);
      const sorted = [...labels].sort((a, b) => a.localeCompare(b, "en"));
      expect(labels).toEqual(sorted);
    }
  });

  it("timezones without a slash go into 'Other' region", () => {
    // UTC has no slash, so it should be in "Other" if present in the list
    const { result } = renderHook(() => useTimezoneOptions());
    const list = getTimezoneList();
    if (list.includes("UTC")) {
      const other = result.current.groups.get("Other");
      expect(other).toBeDefined();
      expect(other!.some((o) => o.value === "UTC")).toBe(true);
    }
  });
});
