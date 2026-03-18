import { describe, expect, it } from "vitest";

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  addDays,
  isSameDay,
  isSameMonth,
  isSameWeek,
} from "../../utils/date-math";

describe("startOfDay", () => {
  it("zeros out hours, minutes, seconds, milliseconds", () => {
    const d = new Date(2025, 2, 15, 14, 30, 45, 500);
    const result = startOfDay(d);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("does not modify the original date", () => {
    const d = new Date(2025, 5, 10, 12, 0, 0);
    startOfDay(d);
    expect(d.getHours()).toBe(12);
  });
});

describe("endOfDay", () => {
  it("sets time to 23:59:59.999", () => {
    const d = new Date(2025, 0, 1, 8, 15, 30);
    const result = endOfDay(d);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
});

describe("startOfWeek", () => {
  it("returns Monday for a Wednesday", () => {
    // 2025-03-12 is a Wednesday
    const wed = new Date(2025, 2, 12);
    const result = startOfWeek(wed);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(10);
  });

  it("returns Monday for a Monday", () => {
    // 2025-03-10 is a Monday
    const mon = new Date(2025, 2, 10);
    const result = startOfWeek(mon);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(10);
  });

  it("returns previous Monday for a Sunday", () => {
    // 2025-03-16 is a Sunday
    const sun = new Date(2025, 2, 16);
    const result = startOfWeek(sun);
    expect(result.getDay()).toBe(1);
    expect(result.getDate()).toBe(10);
  });

  it("handles month boundary (Sunday at start of month)", () => {
    // 2025-06-01 is a Sunday
    const sun = new Date(2025, 5, 1);
    const result = startOfWeek(sun);
    expect(result.getDay()).toBe(1);
    // Should go back to May 26
    expect(result.getMonth()).toBe(4); // May
    expect(result.getDate()).toBe(26);
  });
});

describe("endOfWeek", () => {
  it("returns Sunday of the same week", () => {
    // 2025-03-12 is Wednesday, end of week is Sunday 2025-03-16
    const wed = new Date(2025, 2, 12);
    const result = endOfWeek(wed);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(16);
  });

  it("returns same Sunday when given Sunday", () => {
    const sun = new Date(2025, 2, 16);
    const result = endOfWeek(sun);
    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(16);
  });
});

describe("startOfMonth", () => {
  it("returns the first day of the month", () => {
    const d = new Date(2025, 7, 25);
    const result = startOfMonth(d);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(7);
    expect(result.getFullYear()).toBe(2025);
  });
});

describe("endOfMonth", () => {
  it("returns the last day of the month", () => {
    // February 2025 (non-leap year) has 28 days
    const d = new Date(2025, 1, 10);
    const result = endOfMonth(d);
    expect(result.getDate()).toBe(28);
    expect(result.getMonth()).toBe(1);
  });

  it("handles leap year February", () => {
    // February 2024 (leap year) has 29 days
    const d = new Date(2024, 1, 5);
    const result = endOfMonth(d);
    expect(result.getDate()).toBe(29);
  });

  it("handles 31-day months", () => {
    const d = new Date(2025, 0, 15); // January
    const result = endOfMonth(d);
    expect(result.getDate()).toBe(31);
  });
});

describe("startOfYear", () => {
  it("returns January 1st", () => {
    const d = new Date(2025, 6, 15);
    const result = startOfYear(d);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });
});

describe("endOfYear", () => {
  it("returns December 31st", () => {
    const d = new Date(2025, 3, 20);
    const result = endOfYear(d);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(31);
  });
});

describe("subDays", () => {
  it("subtracts days from a date", () => {
    const d = new Date(2025, 2, 15);
    const result = subDays(d, 5);
    expect(result.getDate()).toBe(10);
    expect(result.getMonth()).toBe(2);
  });

  it("crosses month boundary backward", () => {
    const d = new Date(2025, 2, 3); // March 3
    const result = subDays(d, 5);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(26);
  });

  it("subtracts zero days", () => {
    const d = new Date(2025, 0, 1);
    const result = subDays(d, 0);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
  });
});

describe("addDays", () => {
  it("adds days to a date", () => {
    const d = new Date(2025, 2, 15);
    const result = addDays(d, 10);
    expect(result.getDate()).toBe(25);
    expect(result.getMonth()).toBe(2);
  });

  it("crosses month boundary forward", () => {
    const d = new Date(2025, 0, 30); // January 30
    const result = addDays(d, 3);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(2);
  });

  it("adds zero days", () => {
    const d = new Date(2025, 5, 15);
    const result = addDays(d, 0);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(5);
  });
});

describe("isSameDay", () => {
  it("returns true for same day with different times", () => {
    const a = new Date(2025, 2, 15, 10, 0, 0);
    const b = new Date(2025, 2, 15, 23, 59, 59);
    expect(isSameDay(a, b)).toBe(true);
  });

  it("returns false for different days", () => {
    const a = new Date(2025, 2, 15);
    const b = new Date(2025, 2, 16);
    expect(isSameDay(a, b)).toBe(false);
  });

  it("returns false for same day different months", () => {
    const a = new Date(2025, 2, 15);
    const b = new Date(2025, 3, 15);
    expect(isSameDay(a, b)).toBe(false);
  });

  it("returns false for same day/month different years", () => {
    const a = new Date(2025, 2, 15);
    const b = new Date(2024, 2, 15);
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("isSameMonth", () => {
  it("returns true for dates in the same month and year", () => {
    const a = new Date(2025, 5, 1);
    const b = new Date(2025, 5, 30);
    expect(isSameMonth(a, b)).toBe(true);
  });

  it("returns false for different months", () => {
    const a = new Date(2025, 5, 1);
    const b = new Date(2025, 6, 1);
    expect(isSameMonth(a, b)).toBe(false);
  });

  it("returns false for same month different years", () => {
    const a = new Date(2025, 5, 1);
    const b = new Date(2024, 5, 1);
    expect(isSameMonth(a, b)).toBe(false);
  });
});

describe("isSameWeek", () => {
  it("returns true for dates in the same Mon-Sun week", () => {
    // 2025-03-10 (Mon) and 2025-03-16 (Sun)
    const mon = new Date(2025, 2, 10);
    const sun = new Date(2025, 2, 16);
    expect(isSameWeek(mon, sun)).toBe(true);
  });

  it("returns false for dates in different weeks", () => {
    const sun = new Date(2025, 2, 16); // end of week
    const mon = new Date(2025, 2, 17); // start of next week
    expect(isSameWeek(sun, mon)).toBe(false);
  });

  it("returns true for the same date", () => {
    const d = new Date(2025, 2, 12);
    expect(isSameWeek(d, d)).toBe(true);
  });
});
