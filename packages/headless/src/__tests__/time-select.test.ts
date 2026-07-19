import { describe, expect, it } from "vitest";

import {
  clampTimeValue,
  clampToRange,
  isHourDisabled,
  isHourOutOfRange,
  isMinuteDisabled,
  isMinuteOutOfRange,
  padTimeUnit,
  to12Hour,
  to24Hour,
  withTime,
  wrapValue,
} from "../time-select";

describe("to12Hour", () => {
  it("maps midnight to 12 AM", () => {
    expect(to12Hour(0)).toEqual({ hour12: 12, pm: false });
  });

  it("maps noon to 12 PM", () => {
    expect(to12Hour(12)).toEqual({ hour12: 12, pm: true });
  });

  it("maps morning hours", () => {
    expect(to12Hour(9)).toEqual({ hour12: 9, pm: false });
  });

  it("maps afternoon hours", () => {
    expect(to12Hour(15)).toEqual({ hour12: 3, pm: true });
    expect(to12Hour(23)).toEqual({ hour12: 11, pm: true });
  });
});

describe("to24Hour", () => {
  it("maps 12 AM to 0", () => {
    expect(to24Hour(12, false)).toBe(0);
  });

  it("maps 12 PM to 12", () => {
    expect(to24Hour(12, true)).toBe(12);
  });

  it("maps AM hours directly", () => {
    expect(to24Hour(9, false)).toBe(9);
  });

  it("maps PM hours with +12", () => {
    expect(to24Hour(3, true)).toBe(15);
    expect(to24Hour(11, true)).toBe(23);
  });

  it("round-trips every hour", () => {
    for (let h = 0; h < 24; h++) {
      const { hour12, pm } = to12Hour(h);
      expect(to24Hour(hour12, pm)).toBe(h);
    }
  });
});

describe("wrapValue", () => {
  it("wraps above max to min", () => {
    expect(wrapValue(13, 1, 12)).toBe(1);
    expect(wrapValue(60, 0, 59)).toBe(0);
  });

  it("wraps below min to max", () => {
    expect(wrapValue(0, 1, 12)).toBe(12);
    expect(wrapValue(-1, 0, 59)).toBe(59);
  });

  it("keeps in-range values", () => {
    expect(wrapValue(5, 1, 12)).toBe(5);
  });
});

describe("withTime", () => {
  it("sets hours/minutes and zeroes seconds", () => {
    const base = new Date(2024, 5, 15, 10, 30, 45, 500);
    const result = withTime(base, 14, 5);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(5);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("does not mutate the input date", () => {
    const base = new Date(2024, 5, 15, 10, 30);
    withTime(base, 0, 0);
    expect(base.getHours()).toBe(10);
  });
});

describe("isHourDisabled", () => {
  const base = new Date(2024, 5, 15);
  const min = new Date(2024, 5, 15, 9, 30);
  const max = new Date(2024, 5, 15, 18, 15);

  it("disables hours entirely before minDate", () => {
    expect(isHourDisabled(base, 8, min, max)).toBe(true);
  });

  it("keeps the minDate hour enabled (partial availability)", () => {
    expect(isHourDisabled(base, 9, min, max)).toBe(false);
  });

  it("keeps in-range hours enabled", () => {
    expect(isHourDisabled(base, 12, min, max)).toBe(false);
  });

  it("keeps the maxDate hour enabled (partial availability)", () => {
    expect(isHourDisabled(base, 18, min, max)).toBe(false);
  });

  it("disables hours entirely after maxDate", () => {
    expect(isHourDisabled(base, 19, min, max)).toBe(true);
  });

  it("ignores bounds on other days", () => {
    const otherDay = new Date(2024, 5, 16);
    expect(isHourDisabled(otherDay, 8, min, undefined)).toBe(false);
  });

  it("is never disabled without bounds", () => {
    expect(isHourDisabled(base, 0)).toBe(false);
    expect(isHourDisabled(base, 23)).toBe(false);
  });
});

describe("isMinuteDisabled", () => {
  const base = new Date(2024, 5, 15);
  const min = new Date(2024, 5, 15, 9, 30);
  const max = new Date(2024, 5, 15, 18, 15);

  it("disables minutes before minDate within the same hour", () => {
    expect(isMinuteDisabled(base, 9, 29, min, max)).toBe(true);
    expect(isMinuteDisabled(base, 9, 30, min, max)).toBe(false);
  });

  it("disables minutes after maxDate within the same hour", () => {
    expect(isMinuteDisabled(base, 18, 15, min, max)).toBe(false);
    expect(isMinuteDisabled(base, 18, 16, min, max)).toBe(true);
  });

  it("keeps all minutes enabled for fully in-range hours", () => {
    expect(isMinuteDisabled(base, 12, 0, min, max)).toBe(false);
    expect(isMinuteDisabled(base, 12, 59, min, max)).toBe(false);
  });
});

describe("clampToRange", () => {
  const min = new Date(2024, 5, 15, 9, 0);
  const max = new Date(2024, 5, 15, 18, 0);

  it("clamps below min", () => {
    const result = clampToRange(new Date(2024, 5, 15, 8, 0), min, max);
    expect(result.getTime()).toBe(min.getTime());
  });

  it("clamps above max", () => {
    const result = clampToRange(new Date(2024, 5, 15, 19, 0), min, max);
    expect(result.getTime()).toBe(max.getTime());
  });

  it("returns in-range dates unchanged", () => {
    const d = new Date(2024, 5, 15, 12, 0);
    expect(clampToRange(d, min, max)).toBe(d);
  });

  it("returns a copy when clamping (no shared reference)", () => {
    const result = clampToRange(new Date(2024, 5, 15, 8, 0), min, max);
    expect(result).not.toBe(min);
  });
});

describe("isHourOutOfRange / isMinuteOutOfRange", () => {
  const min = { hours: 9, minutes: 30 };
  const max = { hours: 18, minutes: 15 };

  it("marks hours fully outside the range", () => {
    expect(isHourOutOfRange(8, min, max)).toBe(true);
    expect(isHourOutOfRange(19, min, max)).toBe(true);
  });

  it("keeps partially available boundary hours", () => {
    expect(isHourOutOfRange(9, min, max)).toBe(false);
    expect(isHourOutOfRange(18, min, max)).toBe(false);
  });

  it("marks minutes outside the range within boundary hours", () => {
    expect(isMinuteOutOfRange(9, 29, min, max)).toBe(true);
    expect(isMinuteOutOfRange(9, 30, min, max)).toBe(false);
    expect(isMinuteOutOfRange(18, 15, min, max)).toBe(false);
    expect(isMinuteOutOfRange(18, 16, min, max)).toBe(true);
  });

  it("is never out of range without bounds", () => {
    expect(isHourOutOfRange(0)).toBe(false);
    expect(isMinuteOutOfRange(23, 59)).toBe(false);
  });
});

describe("clampTimeValue", () => {
  const min = { hours: 9, minutes: 30 };
  const max = { hours: 18, minutes: 15 };

  it("clamps below min and above max", () => {
    expect(clampTimeValue({ hours: 8, minutes: 0 }, min, max)).toEqual(min);
    expect(clampTimeValue({ hours: 20, minutes: 0 }, min, max)).toEqual(max);
  });

  it("returns in-range times unchanged", () => {
    const t = { hours: 12, minutes: 0 };
    expect(clampTimeValue(t, min, max)).toBe(t);
  });

  it("returns a copy when clamping (no shared reference)", () => {
    expect(clampTimeValue({ hours: 8, minutes: 0 }, min, max)).not.toBe(min);
  });
});

describe("padTimeUnit", () => {
  it("pads single digits", () => {
    expect(padTimeUnit(7)).toBe("07");
  });

  it("keeps two digits", () => {
    expect(padTimeUnit(12)).toBe("12");
  });
});
