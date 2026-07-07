import { describe, expect, it } from "vitest";

import { asUtcDate, fromUtcDateIso, toUtcDateIso } from "../../utils/utc-date";

// All assertions are timezone-INDEPENDENT: toUtcDateIso reads LOCAL calendar
// fields of a local-midnight Date and re-emits at UTC midnight (no offset), and
// fromUtcDateIso reads UTC calendar fields — so a picked/stored calendar day
// round-trips to the same day in ANY runner timezone. The old
// `picked.toISOString()` (UTC conversion) would fail these east/west of UTC.

describe("toUtcDateIso", () => {
  it("emits UTC-midnight of the picked local calendar day (no offset shift)", () => {
    expect(toUtcDateIso(new Date(2026, 5, 30))).toBe("2026-06-30T00:00:00.000Z");
  });

  it("dayShift=1 encodes an inclusive end date as exclusive next-midnight", () => {
    expect(toUtcDateIso(new Date(2026, 5, 30), 1)).toBe("2026-07-01T00:00:00.000Z");
  });

  it("normalizes month/year boundaries via Date.UTC arithmetic", () => {
    expect(toUtcDateIso(new Date(2026, 11, 31), 1)).toBe("2027-01-01T00:00:00.000Z");
  });

  it("returns undefined for null / undefined / invalid", () => {
    expect(toUtcDateIso(null)).toBeUndefined();
    expect(toUtcDateIso(undefined)).toBeUndefined();
    expect(toUtcDateIso(new Date("invalid"))).toBeUndefined();
  });
});

describe("fromUtcDateIso", () => {
  it("reads the UTC calendar day into a local Date (zone-independent)", () => {
    const d = fromUtcDateIso("2026-06-30T00:00:00Z")!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5); // June (0-indexed)
    expect(d.getDate()).toBe(30);
  });

  it("dayShift=-1 undoes the inclusive end +1", () => {
    const d = fromUtcDateIso("2026-07-01T00:00:00Z", -1)!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(30);
  });

  it("normalizes year boundary on shift", () => {
    const d = fromUtcDateIso("2027-01-01T00:00:00Z", -1)!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });

  it("returns undefined for null / undefined / empty / invalid", () => {
    expect(fromUtcDateIso(null)).toBeUndefined();
    expect(fromUtcDateIso(undefined)).toBeUndefined();
    expect(fromUtcDateIso("  ")).toBeUndefined();
    expect(fromUtcDateIso("not-a-date")).toBeUndefined();
  });
});

describe("round-trip", () => {
  it("activation: fromUtcDateIso(toUtcDateIso(d)) preserves the calendar day", () => {
    const picked = new Date(2026, 5, 30);
    const back = fromUtcDateIso(toUtcDateIso(picked))!;
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(5);
    expect(back.getDate()).toBe(30);
  });

  it("deactivation: +1 on write, -1 on read preserves the picked day", () => {
    const picked = new Date(2026, 5, 30);
    const back = fromUtcDateIso(toUtcDateIso(picked, 1), -1)!;
    expect(back.getDate()).toBe(30);
    expect(back.getMonth()).toBe(5);
  });
});

describe("asUtcDate", () => {
  it("serializes via JSON.stringify to UTC-midnight datetime (not local yyyy-MM-dd)", () => {
    const tagged = asUtcDate(new Date(2026, 5, 30));
    expect(JSON.stringify({ d: tagged })).toBe('{"d":"2026-06-30T00:00:00.000Z"}');
  });

  it("bakes dayShift into the emitted value", () => {
    const tagged = asUtcDate(new Date(2026, 5, 30), 1);
    expect(JSON.stringify({ d: tagged })).toBe('{"d":"2026-07-01T00:00:00.000Z"}');
  });

  it("returns a clone (does not mutate the source Date's toJSON)", () => {
    const src = new Date(2026, 5, 30);
    asUtcDate(src, 1);
    // source keeps the default prototype toJSON (raw toISOString), unaffected
    expect(src.toJSON()).toBe(new Date(src.getTime()).toISOString());
  });

  it("defines toJSON as a non-enumerable own prop that survives an object spread", () => {
    const values = { name: "x", date: asUtcDate(new Date(2026, 5, 30), 1) };
    expect(Object.keys(values.date)).not.toContain("toJSON");
    expect(JSON.stringify({ ...values })).toBe('{"name":"x","date":"2026-07-01T00:00:00.000Z"}');
  });

  it("leaves getTime untouched", () => {
    const base = new Date(2026, 5, 30).getTime();
    expect(asUtcDate(new Date(2026, 5, 30)).getTime()).toBe(base);
  });
});
