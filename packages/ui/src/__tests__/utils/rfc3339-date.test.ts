import { describe, expect, it } from "vitest";

import { parseRfc3339, serializeRfc3339Local } from "../../utils/rfc3339-date";

// Assertions are timezone-INDEPENDENT: serializeRfc3339Local reads the LOCAL
// wall-clock fields (so the date/time portion is exactly what was constructed, in
// any runner TZ) and appends the runtime's own offset (computed here the same way
// for comparison). parseRfc3339 + local getters round-trip the wall-clock.

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
