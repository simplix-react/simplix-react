import { describe, expect, it } from "vitest";

import { offsetAsUtc } from "../datetime/browser-zone-label";

describe("offsetAsUtc", () => {
  it("writes a bare Greenwich offset against UTC", () => {
    expect(offsetAsUtc("GMT+9")).toBe("UTC+9");
    expect(offsetAsUtc("GMT-03:30")).toBe("UTC-03:30");
  });
  it("leaves a named abbreviation alone", () => {
    expect(offsetAsUtc("KST")).toBe("KST");
    expect(offsetAsUtc("GMT")).toBe("GMT");
    expect(offsetAsUtc("EDT")).toBe("EDT");
  });
});
