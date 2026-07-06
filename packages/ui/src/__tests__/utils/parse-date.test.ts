import { describe, expect, it } from "vitest";

import { asPlainDate, parseDate } from "../../utils/parse-date";

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

  // These assertions are timezone-INDEPENDENT regression guards: the old
  // implementation (new Date("2026-07-06") = UTC midnight, untagged) would
  // serialize as a UTC ISO string and fail these in ANY runner timezone.
  describe("date-only strings (LocalDate, format:date)", () => {
    it("parses as a LOCAL calendar date, not UTC midnight", () => {
      const result = parseDate("2026-07-06")!;
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(6); // July (0-indexed)
      expect(result.getDate()).toBe(6);
    });

    it("tags the result so it serializes as zone-neutral yyyy-MM-dd", () => {
      expect(JSON.stringify({ d: parseDate("2026-07-06") })).toBe('{"d":"2026-07-06"}');
      expect((parseDate("2026-07-06") as Date).toJSON()).toBe("2026-07-06");
    });

    it("is idempotent: re-parsing a tagged Date preserves the tag", () => {
      const once = parseDate("2026-07-06")!;
      const twice = parseDate(once)!;
      expect(twice).toBe(once);
      expect(JSON.stringify({ d: twice })).toBe('{"d":"2026-07-06"}');
    });

    it("does NOT tag datetime strings — Instant paths keep UTC toISOString", () => {
      const dt = parseDate("2026-07-06T10:30:00Z")!;
      expect(dt.toJSON()).toBe("2026-07-06T10:30:00.000Z");
    });
  });

  describe("asPlainDate", () => {
    it("serializes to local yyyy-MM-dd via JSON.stringify (not UTC toISOString)", () => {
      const tagged = asPlainDate(new Date(2026, 6, 6)); // local 2026-07-06
      expect(JSON.stringify({ date: tagged })).toBe('{"date":"2026-07-06"}');
    });

    it("leaves getTime/valueOf untouched (only toJSON is overridden)", () => {
      const base = new Date(2026, 6, 6).getTime();
      expect(asPlainDate(new Date(2026, 6, 6)).getTime()).toBe(base);
    });

    it("defines toJSON as a non-enumerable own property (not copied by spread)", () => {
      const tagged = asPlainDate(new Date(2026, 6, 6));
      expect(Object.keys(tagged)).not.toContain("toJSON");
      expect(Object.prototype.hasOwnProperty.call(tagged, "toJSON")).toBe(true);
    });

    it("survives an object spread of the container (the submit-path pattern)", () => {
      const values = { name: "x", date: asPlainDate(new Date(2026, 6, 6)) };
      const spread = { ...values };
      expect(JSON.stringify(spread)).toBe('{"name":"x","date":"2026-07-06"}');
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
