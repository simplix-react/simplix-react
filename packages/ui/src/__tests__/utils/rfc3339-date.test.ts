import { describe, expect, it } from "vitest";

import {
  asZonedInstant,
  decodeCalendarDate,
  decodeInstant,
  decodeWallClockTime,
  formatWallClockTime,
  parseRfc3339,
  serializeCalendarDate,
  serializeInstant,
  serializeRfc3339Local,
  serializeWallClockTime,
} from "../../utils/rfc3339-date";

// Assertions are timezone-INDEPENDENT: serializeRfc3339Local reads the LOCAL
// wall-clock fields (so the date/time portion is exactly what was constructed, in
// any runner TZ) and appends the runtime's own offset (computed here the same way
// for comparison). parseRfc3339 + local getters round-trip the wall-clock. The
// zone-explicit cases below derive their offset from the IANA zone, not the runner.

/** The runtime's east-positive offset string for a given Date, e.g. "+09:00". */
function localOffset(d: Date): string {
  const m = -d.getTimezoneOffset();
  const sign = m >= 0 ? "+" : "-";
  const abs = Math.abs(m);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

describe("serializeRfc3339Local", () => {
  it("emits local midnight at seconds precision with the runtime offset (no millis, no Z)", () => {
    const picked = new Date(2026, 6, 8); // local 2026-07-08 00:00:00
    expect(serializeRfc3339Local(picked)).toBe(`2026-07-08T00:00:00${localOffset(picked)}`);
  });

  it("preserves a non-midnight wall-clock (e.g. a -1 minute deactivation shift)", () => {
    const shifted = new Date(2026, 6, 7, 23, 59, 0); // local 2026-07-07 23:59:00
    expect(serializeRfc3339Local(shifted)).toBe(`2026-07-07T23:59:00${localOffset(shifted)}`);
  });

  it("matches the canonical shape yyyy-MM-ddTHH:mm:ss±hh:mm", () => {
    expect(serializeRfc3339Local(new Date(2026, 0, 1))).toMatch(
      /^2026-01-01T00:00:00[+-]\d{2}:\d{2}$/,
    );
  });

  it("returns undefined for null / undefined / invalid", () => {
    expect(serializeRfc3339Local(null)).toBeUndefined();
    expect(serializeRfc3339Local(undefined)).toBeUndefined();
    expect(serializeRfc3339Local(new Date("invalid"))).toBeUndefined();
  });
});

describe("parseRfc3339", () => {
  it("parses an offset-aware string to the correct absolute instant", () => {
    expect(parseRfc3339("2026-07-08T00:00:00+09:00")!.getTime()).toBe(Date.UTC(2026, 6, 7, 15, 0, 0));
  });

  it("returns undefined for null / undefined / empty / invalid", () => {
    expect(parseRfc3339(null)).toBeUndefined();
    expect(parseRfc3339(undefined)).toBeUndefined();
    expect(parseRfc3339("  ")).toBeUndefined();
    expect(parseRfc3339("not-a-date")).toBeUndefined();
  });
});

describe("round-trip", () => {
  it("serialize -> parse recovers the same local wall-clock day", () => {
    const picked = new Date(2026, 6, 8);
    const back = parseRfc3339(serializeRfc3339Local(picked))!;
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(6);
    expect(back.getDate()).toBe(8);
    expect(back.getHours()).toBe(0);
  });
});

describe("asZonedInstant (toJSON tagging)", () => {
  it("tags toJSON so JSON.stringify emits the display-zone offset, not the browser's", () => {
    const seoul = asZonedInstant(new Date(2026, 6, 8, 9, 30, 0), "Asia/Seoul");
    expect(JSON.parse(JSON.stringify({ t: seoul })).t).toBe("2026-07-08T09:30:00+09:00");
    const ny = asZonedInstant(new Date(2026, 6, 8, 9, 30, 0), "America/New_York");
    expect(JSON.parse(JSON.stringify({ t: ny })).t).toBe("2026-07-08T09:30:00-04:00");
  });
});

describe("serializeInstant (display zone)", () => {
  it("stamps the target zone offset, not the browser", () => {
    const floating = new Date(2026, 6, 8, 0, 0, 0); // fields 2026-07-08 00:00:00 (any runner TZ)
    expect(serializeInstant(floating, "Asia/Seoul")).toBe("2026-07-08T00:00:00+09:00");
    expect(serializeInstant(floating, "America/New_York")).toBe("2026-07-08T00:00:00-04:00"); // EDT in July
    expect(serializeInstant(floating, "UTC")).toBe("2026-07-08T00:00:00+00:00");
  });

  it("no zone → browser offset (legacy path, same as serializeRfc3339Local)", () => {
    const d = new Date(2026, 6, 8);
    expect(serializeInstant(d)).toBe(`2026-07-08T00:00:00${localOffset(d)}`);
    expect(serializeInstant(d)).toBe(serializeRfc3339Local(d));
  });

  it("returns undefined for null / undefined / invalid", () => {
    expect(serializeInstant(null, "Asia/Seoul")).toBeUndefined();
    expect(serializeInstant(undefined)).toBeUndefined();
    expect(serializeInstant(new Date("invalid"), "UTC")).toBeUndefined();
  });
});

describe("decodeInstant (display zone)", () => {
  it("reprojects an instant onto the target zone's wall clock, textual not local-getter", () => {
    const back = decodeInstant("2026-07-08T00:00:00+09:00", "Asia/Seoul")!; // instant 2026-07-07T15:00Z
    expect([back.getFullYear(), back.getMonth(), back.getDate(), back.getHours()]).toEqual([2026, 6, 8, 0]);
    const ny = decodeInstant("2026-07-08T00:00:00+09:00", "America/New_York")!; // same instant, EDT
    expect([ny.getFullYear(), ny.getMonth(), ny.getDate(), ny.getHours()]).toEqual([2026, 6, 7, 11]);
  });

  it("no zone → the true instant (legacy)", () => {
    const inst = decodeInstant("2026-07-08T00:00:00+09:00")!;
    expect(inst.getTime()).toBe(Date.UTC(2026, 6, 7, 15, 0, 0));
  });

  it("accepts a Date or epoch-ms input", () => {
    const ms = Date.UTC(2026, 6, 7, 15, 0, 0);
    const fromMs = decodeInstant(ms, "Asia/Seoul")!;
    expect([fromMs.getFullYear(), fromMs.getMonth(), fromMs.getDate(), fromMs.getHours()]).toEqual([2026, 6, 8, 0]);
    const fromDate = decodeInstant(new Date(ms), "Asia/Seoul")!;
    expect([fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), fromDate.getHours()]).toEqual([2026, 6, 8, 0]);
  });

  it("returns undefined for null / invalid", () => {
    expect(decodeInstant(null, "UTC")).toBeUndefined();
    expect(decodeInstant("not-a-date", "UTC")).toBeUndefined();
  });

  it("round-trips serialize∘decode for a display zone (unambiguous summer instant)", () => {
    const s = "2026-07-08T12:00:00-04:00";
    const z = "America/New_York";
    expect(serializeInstant(decodeInstant(s, z), z)).toBe(s);
  });

  it("resolves a fall-back ambiguous wall clock to the earlier offset (2-pass determinism)", () => {
    // 2026-11-01 01:30 America/New_York occurs twice (DST ends); the 2-pass
    // wall-clock→instant resolution deterministically picks the first (EDT).
    const z = "America/New_York";
    expect(serializeInstant(decodeInstant("2026-11-01T01:30:00-05:00", z), z)).toBe("2026-11-01T01:30:00-04:00");
  });
});

describe("calendar-date / wall-clock primitives", () => {
  it("serializeCalendarDate → bare yyyy-MM-dd", () => {
    expect(serializeCalendarDate(new Date(2026, 6, 8))).toBe("2026-07-08");
    expect(serializeCalendarDate(null)).toBeUndefined();
    expect(serializeCalendarDate(new Date("invalid"))).toBeUndefined();
  });

  it("decodeCalendarDate → local-midnight of the same day (textual)", () => {
    const d = decodeCalendarDate("2026-07-08")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 6, 8]);
    expect(JSON.stringify({ d })).toContain("2026-07-08"); // asPlainDate toJSON tag
  });

  it("decodeCalendarDate rejects a non-date-only string", () => {
    expect(decodeCalendarDate("2026-07-08T00:00:00+09:00")).toBeUndefined();
    expect(decodeCalendarDate(null)).toBeUndefined();
  });

  it("wall-clock round-trips", () => {
    expect(serializeWallClockTime({ hours: 9, minutes: 5 })).toBe("09:05");
    expect(serializeWallClockTime({ hours: 9, minutes: 5 }, { seconds: true })).toBe("09:05:00");
    expect(decodeWallClockTime("22:30:15")).toEqual({ hours: 22, minutes: 30 });
    expect(decodeWallClockTime("09:05")).toEqual({ hours: 9, minutes: 5 });
    expect(decodeWallClockTime("bad")).toBeUndefined();
    expect(decodeWallClockTime("25:00")).toBeUndefined();
    expect(serializeWallClockTime(null)).toBeUndefined();
  });

  it("formatWallClockTime renders a locale time from an HH:mm[:ss] string or TimeValue", () => {
    // 00:00 is a real value (midnight), not "unset".
    expect(formatWallClockTime("00:00", "en-US")).toMatch(/12:00.*AM/i);
    expect(formatWallClockTime("18:00", "en-US")).toMatch(/6:00.*PM/i);
    expect(formatWallClockTime("18:00:00", "en-US")).toMatch(/6:00.*PM/i); // seconds dropped
    expect(formatWallClockTime({ hours: 9, minutes: 5 }, "en-US")).toMatch(/9:05.*AM/i);
    expect(formatWallClockTime("bad")).toBeUndefined();
    expect(formatWallClockTime(null)).toBeUndefined();
    expect(formatWallClockTime(undefined)).toBeUndefined();
  });
});
