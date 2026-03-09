import { describe, it, expect } from "vitest";
import { DEFAULT_LOCALES, SUPPORTED_LOCALES } from "../utils/locale-config.js";

describe("DEFAULT_LOCALES", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(DEFAULT_LOCALES)).toBe(true);
    expect(DEFAULT_LOCALES.length).toBeGreaterThan(0);
  });

  it("includes Korean locale", () => {
    const ko = DEFAULT_LOCALES.find((l) => l.code === "ko");
    expect(ko).toBeDefined();
    expect(ko!.name).toBe("\ud55c\uad6d\uc5b4");
    expect(ko!.englishName).toBe("Korean");
    expect(ko!.direction).toBe("ltr");
    expect(ko!.currency).toBe("KRW");
    expect(ko!.dateFormat).toBe("yyyy-MM-dd");
    expect(ko!.timeFormat).toBe("HH:mm:ss");
  });

  it("includes English locale", () => {
    const en = DEFAULT_LOCALES.find((l) => l.code === "en");
    expect(en).toBeDefined();
    expect(en!.name).toBe("English");
    expect(en!.englishName).toBe("English");
    expect(en!.direction).toBe("ltr");
    expect(en!.currency).toBe("USD");
    expect(en!.dateFormat).toBe("MM/dd/yyyy");
  });

  it("includes Japanese locale", () => {
    const ja = DEFAULT_LOCALES.find((l) => l.code === "ja");
    expect(ja).toBeDefined();
    expect(ja!.englishName).toBe("Japanese");
    expect(ja!.currency).toBe("JPY");
  });

  it("includes RTL locales", () => {
    const rtlLocales = DEFAULT_LOCALES.filter((l) => l.direction === "rtl");
    expect(rtlLocales.length).toBeGreaterThan(0);

    const ar = rtlLocales.find((l) => l.code === "ar");
    expect(ar).toBeDefined();
    expect(ar!.englishName).toBe("Arabic");

    const he = rtlLocales.find((l) => l.code === "he");
    expect(he).toBeDefined();
    expect(he!.englishName).toBe("Hebrew");
  });

  it("every locale has required fields", () => {
    for (const locale of DEFAULT_LOCALES) {
      expect(locale.code).toBeTruthy();
      expect(locale.name).toBeTruthy();
      expect(locale.englishName).toBeTruthy();
      expect(locale.direction).toMatch(/^(ltr|rtl)$/);
      expect(locale.dateFormat).toBeTruthy();
      expect(locale.timeFormat).toBeTruthy();
      expect(locale.currency).toBeTruthy();
    }
  });

  it("has unique locale codes", () => {
    const codes = DEFAULT_LOCALES.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

describe("SUPPORTED_LOCALES", () => {
  it("is derived from DEFAULT_LOCALES codes", () => {
    const expectedCodes = DEFAULT_LOCALES.map((l) => l.code);
    expect(SUPPORTED_LOCALES).toEqual(expectedCodes);
  });

  it("is a string array", () => {
    expect(Array.isArray(SUPPORTED_LOCALES)).toBe(true);
    for (const code of SUPPORTED_LOCALES) {
      expect(typeof code).toBe("string");
    }
  });

  it("has the same length as DEFAULT_LOCALES", () => {
    expect(SUPPORTED_LOCALES.length).toBe(DEFAULT_LOCALES.length);
  });

  it("contains common locale codes", () => {
    expect(SUPPORTED_LOCALES).toContain("en");
    expect(SUPPORTED_LOCALES).toContain("ko");
    expect(SUPPORTED_LOCALES).toContain("ja");
    expect(SUPPORTED_LOCALES).toContain("zh-CN");
    expect(SUPPORTED_LOCALES).toContain("fr");
    expect(SUPPORTED_LOCALES).toContain("de");
    expect(SUPPORTED_LOCALES).toContain("es");
  });
});
