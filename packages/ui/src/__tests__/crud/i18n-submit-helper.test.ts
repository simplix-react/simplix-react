import { describe, it, expect } from "vitest";

import { applyI18nFallback } from "../../crud/form/i18n-submit-helper";

const ENGLISH_FIRST = [{ value: "en" }, { value: "ko" }];
const KOREAN_FIRST = [{ value: "ko" }, { value: "en" }];
const SINGLE_LOCALE = [{ value: "en" }];

describe("applyI18nFallback", () => {
  describe("edge case 1 — empty / null / undefined map", () => {
    it("returns empty string when map is null", () => {
      expect(applyI18nFallback(null, ENGLISH_FIRST)).toBe("");
    });

    it("returns empty string when map is undefined", () => {
      expect(applyI18nFallback(undefined, ENGLISH_FIRST)).toBe("");
    });

    it("returns empty string when map is {}", () => {
      expect(applyI18nFallback({}, ENGLISH_FIRST)).toBe("");
    });
  });

  describe("edge case 2 — all-blank values", () => {
    it("returns empty string when every locale value is whitespace", () => {
      expect(applyI18nFallback({ en: "  ", ko: "" }, ENGLISH_FIRST)).toBe("");
    });

    it("skips blank entries and returns the first non-blank entry", () => {
      expect(applyI18nFallback({ en: "  ", ko: "안녕" }, ENGLISH_FIRST)).toBe("안녕");
    });
  });

  describe("edge case 3 — single-locale config", () => {
    it("returns the single-locale value when available", () => {
      expect(applyI18nFallback({ en: "Hello" }, SINGLE_LOCALE)).toBe("Hello");
    });

    it("returns empty string when single-locale value is missing", () => {
      expect(applyI18nFallback({ ko: "안녕" }, SINGLE_LOCALE)).toBe("");
    });
  });

  describe("edge case 4 — locale config order (CSL-2 / INP-2)", () => {
    it("returns en when locale order is [en, ko] and both are populated", () => {
      expect(applyI18nFallback({ en: "Hello", ko: "안녕" }, ENGLISH_FIRST)).toBe("Hello");
    });

    it("returns ko when locale order is [ko, en] and both are populated", () => {
      expect(applyI18nFallback({ en: "Hello", ko: "안녕" }, KOREAN_FIRST)).toBe("안녕");
    });

    it("does not use Object.values() insertion order (regression for CSL-2)", () => {
      // Map insertion order is { en, ko } but locale config order is [ko, en]
      // applyI18nFallback MUST follow locale config (ko), NOT insertion order (en)
      const map: Record<string, string> = {};
      map.en = "Hello";
      map.ko = "안녕";
      expect(applyI18nFallback(map, KOREAN_FIRST)).toBe("안녕");
    });
  });
});
