import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
} from "../format-date";

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
  // The rule under test reads the current year, so every case pins the clock.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 27));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("omits the year inside the current year", () => {
    const result = formatDateShort(new Date(2026, 2, 3), "en-US"); // Mar 3
    expect(result).toContain("Mar");
    expect(result).toContain("3");
    expect(result).not.toContain("2026");
  });

  it("writes the year outside the current year", () => {
    const result = formatDateShort(new Date(2024, 2, 3), "en-US");
    expect(result).toContain("Mar");
    expect(result).toContain("2024");
  });

  it("writes the year for a future year too", () => {
    expect(formatDateShort(new Date(2027, 0, 2), "en-US")).toContain("2027");
  });

  it("localizes the year field rather than appending it", () => {
    expect(formatDateShort(new Date(2026, 0, 1), "ko-KR")).toBe("1월 1일");
    expect(formatDateShort(new Date(2024, 0, 1), "ko-KR")).toBe("2024년 1월 1일");
  });

  it("judges the year in the timeZone it prints in", () => {
    // 2026-01-01T02:00Z is still 2025-12-31 in New York, so "the current year"
    // is 2025 there and 2026 in UTC — one instant, two answers for one date.
    vi.setSystemTime(new Date("2026-01-01T02:00:00Z"));
    const midJune2025 = new Date("2025-06-15T12:00:00Z");
    expect(formatDateShort(midJune2025, "en-US", "America/New_York")).not.toContain("2025");
    expect(formatDateShort(midJune2025, "en-US", "UTC")).toContain("2025");
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
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 27));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("omits the year when both ends are in the current year", () => {
    const result = formatDateRange(new Date(2026, 0, 1), new Date(2026, 11, 31), "ko-KR");
    expect(result).toBe("1월 1일 \u2013 12월 31일");
  });

  it("writes the year on both ends when the range is in another year", () => {
    const result = formatDateRange(new Date(2024, 0, 1), new Date(2024, 11, 31), "ko-KR");
    expect(result).toBe("2024년 1월 1일 \u2013 2024년 12월 31일");
  });

  it("writes the year on both ends when the range crosses new year", () => {
    const result = formatDateRange(new Date(2025, 11, 20), new Date(2026, 0, 5), "ko-KR");
    expect(result).toBe("2025년 12월 20일 \u2013 2026년 1월 5일");
  });

  it("writes the year on an open range whose one end is in another year", () => {
    expect(formatDateRange(new Date(2024, 2, 3), undefined, "ko-KR")).toBe("2024년 3월 3일 \u2013 ...");
    expect(formatDateRange(undefined, new Date(2026, 2, 3), "ko-KR")).toBe("... \u2013 3월 3일");
  });
});
