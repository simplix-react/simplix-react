import { describe, expect, it } from "vitest";

import { parseDate } from "../../utils/parse-date";

describe("parseDate", () => {
  describe("null / undefined / empty", () => {
    it("returns undefined for null", () => {
      expect(parseDate(null)).toBeUndefined();
    });

    it("returns undefined for undefined", () => {
      expect(parseDate(undefined)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(parseDate("")).toBeUndefined();
    });

    it("returns undefined for whitespace-only string", () => {
      expect(parseDate("   ")).toBeUndefined();
    });
  });

  describe("Date objects", () => {
    it("passes through a valid Date", () => {
      const date = new Date(2024, 0, 15);
      expect(parseDate(date)).toBe(date);
    });

    it("returns undefined for invalid Date", () => {
      expect(parseDate(new Date("invalid"))).toBeUndefined();
    });
  });

  describe("ISO 8601 strings", () => {
    it("parses date-only string", () => {
      const result = parseDate("2024-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2024);
    });

    it("parses datetime string with timezone", () => {
      const result = parseDate("2024-01-15T10:30:00Z");
      expect(result).toBeInstanceOf(Date);
    });

    it("returns undefined for invalid date string", () => {
      expect(parseDate("not-a-date")).toBeUndefined();
    });
  });

  describe("numeric timestamps", () => {
    it("parses millisecond timestamp", () => {
      const ms = 1705276800000; // 2024-01-15T00:00:00Z
      const result = parseDate(ms);
      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2024);
    });

    it("auto-detects and converts second timestamp (value < 1e12)", () => {
      const seconds = 1705276800; // same date in seconds
      const result = parseDate(seconds);
      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2024);
    });

    it("returns undefined for NaN number", () => {
      expect(parseDate(NaN)).toBeUndefined();
    });
  });
});
