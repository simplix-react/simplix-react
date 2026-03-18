import { describe, expect, it } from "vitest";

import { countryFromTimezone } from "../../utils/timezone-country-map";

describe("countryFromTimezone", () => {
  it("returns correct country code for known timezones", () => {
    expect(countryFromTimezone("Asia/Seoul")).toBe("KR");
    expect(countryFromTimezone("America/New_York")).toBe("US");
    expect(countryFromTimezone("Europe/London")).toBe("GB");
    expect(countryFromTimezone("Asia/Tokyo")).toBe("JP");
    expect(countryFromTimezone("Australia/Sydney")).toBe("AU");
  });

  it("returns correct code for African timezones", () => {
    expect(countryFromTimezone("Africa/Cairo")).toBe("EG");
    expect(countryFromTimezone("Africa/Lagos")).toBe("NG");
    expect(countryFromTimezone("Africa/Johannesburg")).toBe("ZA");
  });

  it("returns correct code for Pacific timezones", () => {
    expect(countryFromTimezone("Pacific/Auckland")).toBe("NZ");
    expect(countryFromTimezone("Pacific/Honolulu")).toBe("US");
    expect(countryFromTimezone("Pacific/Fiji")).toBe("FJ");
  });

  it("returns correct code for Indian Ocean timezones", () => {
    expect(countryFromTimezone("Indian/Maldives")).toBe("MV");
    expect(countryFromTimezone("Indian/Mauritius")).toBe("MU");
  });

  it("returns correct code for Atlantic timezones", () => {
    expect(countryFromTimezone("Atlantic/Reykjavik")).toBe("IS");
    expect(countryFromTimezone("Atlantic/Bermuda")).toBe("BM");
  });

  it("returns correct code for Antarctica timezones", () => {
    expect(countryFromTimezone("Antarctica/Palmer")).toBe("AQ");
    expect(countryFromTimezone("Antarctica/McMurdo")).toBe("NZ");
  });

  it("returns undefined for unknown timezone", () => {
    expect(countryFromTimezone("Unknown/Place")).toBeUndefined();
    expect(countryFromTimezone("")).toBeUndefined();
    expect(countryFromTimezone("UTC")).toBeUndefined();
  });

  it("handles countries with multiple timezones", () => {
    // US has many timezones
    expect(countryFromTimezone("America/Chicago")).toBe("US");
    expect(countryFromTimezone("America/Denver")).toBe("US");
    expect(countryFromTimezone("America/Los_Angeles")).toBe("US");
    // Russia has many timezones
    expect(countryFromTimezone("Europe/Moscow")).toBe("RU");
    expect(countryFromTimezone("Asia/Vladivostok")).toBe("RU");
  });
});
