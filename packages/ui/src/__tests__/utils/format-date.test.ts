import { describe, expect, it } from "vitest";

import {
  toBcp47,
  isYearFirstLocale,
  getMonthNames,
  generateYears,
  formatDateShort,
  formatDateMedium,
  formatDateTime,
  formatRelativeTime,
  formatDateRange,
} from "../../utils/format-date";

describe("toBcp47", () => {
  it("converts short locale codes to BCP 47 tags", () => {
    expect(toBcp47("ko")).toBe("ko-KR");
    expect(toBcp47("en")).toBe("en-US");
    expect(toBcp47("ja")).toBe("ja-JP");
    expect(toBcp47("zh")).toBe("zh-CN");
  });

  it("passes through already-formed BCP 47 tags", () => {
    expect(toBcp47("en-GB")).toBe("en-GB");
    expect(toBcp47("fr-FR")).toBe("fr-FR");
  });

  it("passes through unknown locale codes as-is", () => {
    expect(toBcp47("de")).toBe("de");
  });
});

describe("isYearFirstLocale", () => {
  it("returns true for East Asian locales", () => {
    expect(isYearFirstLocale("ko")).toBe(true);
    expect(isYearFirstLocale("ja")).toBe(true);
    expect(isYearFirstLocale("zh")).toBe(true);
    expect(isYearFirstLocale("zh-CN")).toBe(true);
    expect(isYearFirstLocale("zh-TW")).toBe(true);
  });

  it("returns false for non-East Asian locales", () => {
    expect(isYearFirstLocale("en")).toBe(false);
    expect(isYearFirstLocale("fr")).toBe(false);
    expect(isYearFirstLocale("de")).toBe(false);
  });
});

describe("getMonthNames", () => {
  it("returns 12 month names", () => {
    const months = getMonthNames("en");
    expect(months).toHaveLength(12);
  });

  it("returns English short month names for en locale", () => {
    const months = getMonthNames("en");
    expect(months[0]).toBe("Jan");
    expect(months[11]).toBe("Dec");
  });

  it("returns Korean month names for ko locale", () => {
    const months = getMonthNames("ko");
    // Korean month format is numeric-based
    expect(months[0]).toContain("1");
    expect(months[11]).toContain("12");
  });
});

describe("generateYears", () => {
  it("generates sequential years", () => {
    expect(generateYears(2020, 2023)).toEqual([2020, 2021, 2022, 2023]);
  });

  it("generates reversed years when reverse is true", () => {
    expect(generateYears(2020, 2023, true)).toEqual([2023, 2022, 2021, 2020]);
  });

  it("generates a single year", () => {
    expect(generateYears(2024, 2024)).toEqual([2024]);
  });

  it("defaults to non-reversed order", () => {
    expect(generateYears(2000, 2002)).toEqual([2000, 2001, 2002]);
  });
});

describe("formatDateShort", () => {
  it("formats date without year", () => {
    const date = new Date(2026, 2, 3); // Mar 3
    const result = formatDateShort(date, "en-US");
    expect(result).toContain("Mar");
    expect(result).toContain("3");
  });
});

describe("formatDateMedium", () => {
  it("formats date with year", () => {
    const date = new Date(2026, 2, 3);
    const result = formatDateMedium(date, "en-US");
    expect(result).toContain("2026");
    expect(result).toContain("Mar");
    expect(result).toContain("3");
  });
});

describe("formatDateTime", () => {
  it("formats date with time", () => {
    const date = new Date(2026, 2, 3, 14, 30);
    const result = formatDateTime(date, "en-US");
    expect(result).toContain("2026");
    expect(result).toContain("Mar");
  });
});

describe("formatRelativeTime", () => {
  it("returns a string for past dates", () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(past, "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a string for future dates", () => {
    const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const result = formatRelativeTime(future, "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a string for very recent times", () => {
    const now = new Date();
    const result = formatRelativeTime(now, "en-US");
    expect(typeof result).toBe("string");
  });
});

describe("formatDateRange", () => {
  it("formats range with both from and to", () => {
    const from = new Date(2026, 2, 3);
    const to = new Date(2026, 2, 27);
    const result = formatDateRange(from, to, "en-US");
    expect(result).toContain("\u2013");
    expect(result).toContain("Mar");
  });

  it("formats range with only from", () => {
    const from = new Date(2026, 2, 3);
    const result = formatDateRange(from, undefined, "en-US");
    expect(result).toContain("\u2013");
    expect(result).toContain("...");
  });

  it("formats range with only to", () => {
    const to = new Date(2026, 2, 27);
    const result = formatDateRange(undefined, to, "en-US");
    expect(result).toContain("...");
    expect(result).toContain("\u2013");
  });

  it("returns null when both from and to are undefined", () => {
    expect(formatDateRange(undefined, undefined)).toBeNull();
  });
});
