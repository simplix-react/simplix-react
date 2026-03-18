import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildEntityKeyMap,
  downloadI18nMessages,
  overlayLocaleJson,
  transformToLocaleData,
} from "../i18n.js";

describe("buildEntityKeyMap", () => {
  it("maps pascalName to name", () => {
    const result = buildEntityKeyMap([
      { pascalName: "Pet", name: "pet" },
      { pascalName: "AccessPoint", name: "accessPoint" },
    ]);
    expect(result.get("Pet")).toBe("pet");
    expect(result.get("AccessPoint")).toBe("accessPoint");
  });

  it("returns empty map for empty input", () => {
    const result = buildEntityKeyMap([]);
    expect(result.size).toBe(0);
  });
});

describe("transformToLocaleData", () => {
  it("transforms entity field translations per locale", () => {
    const serverData = {
      entities: {
        Pet: {
          fields: {
            name: { translations: { en: "Name", ko: "이름" } },
            age: { translations: { en: "Age", ko: "나이" } },
          },
        },
      },
    };
    const entityKeyMap = new Map([["Pet", "pet"]]);

    const result = transformToLocaleData(serverData, entityKeyMap, ["en", "ko"]);

    expect(result.get("en")).toEqual({
      pet: { fields: { name: "Name", age: "Age" } },
    });
    expect(result.get("ko")).toEqual({
      pet: { fields: { name: "이름", age: "나이" } },
    });
  });

  it("skips entities not in the key map", () => {
    const serverData = {
      entities: {
        Unknown: {
          fields: {
            name: { translations: { en: "Name" } },
          },
        },
      },
    };
    const entityKeyMap = new Map([["Pet", "pet"]]);

    const result = transformToLocaleData(serverData, entityKeyMap, ["en"]);
    expect(result.size).toBe(0);
  });

  it("skips fields without translation for the requested locale", () => {
    const serverData = {
      entities: {
        Pet: {
          fields: {
            name: { translations: { en: "Name" } },
            age: { translations: { ko: "나이" } },
          },
        },
      },
    };
    const entityKeyMap = new Map([["Pet", "pet"]]);

    const result = transformToLocaleData(serverData, entityKeyMap, ["en"]);
    expect(result.get("en")).toEqual({
      pet: { fields: { name: "Name" } },
    });
  });

  it("transforms enum translations", () => {
    const serverData = {
      entities: {},
      enums: {
        Status: {
          values: {
            ACTIVE: { translations: { en: "Active", ko: "활성" } },
            INACTIVE: { translations: { en: "Inactive", ko: "비활성" } },
          },
        },
      },
    };
    const entityKeyMap = new Map<string, string>();

    const result = transformToLocaleData(serverData, entityKeyMap, ["en", "ko"]);

    expect(result.get("en")).toEqual({
      enums: {
        Status: { ACTIVE: "Active", INACTIVE: "Inactive" },
      },
    });
    expect(result.get("ko")).toEqual({
      enums: {
        Status: { ACTIVE: "활성", INACTIVE: "비활성" },
      },
    });
  });

  it("skips locale with no translated data", () => {
    const serverData = {
      entities: {
        Pet: {
          fields: {
            name: { translations: { en: "Name" } },
          },
        },
      },
    };
    const entityKeyMap = new Map([["Pet", "pet"]]);

    const result = transformToLocaleData(serverData, entityKeyMap, ["en", "ja"]);
    expect(result.has("en")).toBe(true);
    expect(result.has("ja")).toBe(false);
  });

  it("returns empty map when no data matches", () => {
    const serverData = { entities: {} };
    const entityKeyMap = new Map<string, string>();
    const result = transformToLocaleData(serverData, entityKeyMap, ["en"]);
    expect(result.size).toBe(0);
  });

  it("skips enum values without translation for the requested locale", () => {
    const serverData = {
      entities: {},
      enums: {
        Status: {
          values: {
            ACTIVE: { translations: { en: "Active" } },
            INACTIVE: { translations: { ko: "비활성" } },
          },
        },
      },
    };
    const entityKeyMap = new Map<string, string>();

    const result = transformToLocaleData(serverData, entityKeyMap, ["en"]);

    expect(result.get("en")).toEqual({
      enums: {
        Status: { ACTIVE: "Active" },
      },
    });
  });

  it("skips entire enum when no values have translations for the locale", () => {
    const serverData = {
      entities: {},
      enums: {
        Status: {
          values: {
            ACTIVE: { translations: { ko: "활성" } },
            INACTIVE: { translations: { ko: "비활성" } },
          },
        },
      },
    };
    const entityKeyMap = new Map<string, string>();

    const result = transformToLocaleData(serverData, entityKeyMap, ["en"]);

    // No enums should be present for "en" locale since no translations match
    expect(result.size).toBe(0);
  });

  it("skips enums key when all enum entries have no matching translations", () => {
    const serverData = {
      entities: {
        Pet: {
          fields: {
            name: { translations: { en: "Name" } },
          },
        },
      },
      enums: {
        Status: {
          values: {
            ACTIVE: { translations: { ko: "활성" } },
          },
        },
      },
    };
    const entityKeyMap = new Map([["Pet", "pet"]]);

    const result = transformToLocaleData(serverData, entityKeyMap, ["en"]);

    // Should have entity data but no enums key
    const localeData = result.get("en")!;
    expect(localeData.pet).toEqual({ fields: { name: "Name" } });
    expect(localeData["enums"]).toBeUndefined();
  });
});

describe("overlayLocaleJson", () => {
  it("merges overlay values into base", () => {
    const base = { a: "1", b: "2" };
    const overlay = { b: "3", c: "4" };
    expect(overlayLocaleJson(base, overlay)).toEqual({
      a: "1",
      b: "3",
      c: "4",
    });
  });

  it("deep merges nested objects", () => {
    const base = { pet: { fields: { name: "Name", age: "Age" } } };
    const overlay = { pet: { fields: { name: "Pet Name" } } };
    expect(overlayLocaleJson(base, overlay)).toEqual({
      pet: { fields: { name: "Pet Name", age: "Age" } },
    });
  });

  it("overlay replaces non-object values", () => {
    const base = { a: "old" };
    const overlay = { a: "new" };
    expect(overlayLocaleJson(base, overlay)).toEqual({ a: "new" });
  });

  it("does not modify the base object", () => {
    const base = { a: "1" };
    const overlay = { a: "2" };
    overlayLocaleJson(base, overlay);
    expect(base.a).toBe("1");
  });

  it("returns base when overlay is empty", () => {
    const base = { a: "1" };
    expect(overlayLocaleJson(base, {})).toEqual({ a: "1" });
  });

  it("returns overlay when base is empty", () => {
    const overlay = { a: "1" };
    expect(overlayLocaleJson({}, overlay)).toEqual({ a: "1" });
  });

  it("does not deep merge arrays", () => {
    const base = { items: [1, 2] };
    const overlay = { items: [3, 4] };
    expect(overlayLocaleJson(base, overlay)).toEqual({ items: [3, 4] });
  });
});

describe("downloadI18nMessages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on success", async () => {
    const mockData = {
      entities: { Pet: { fields: { name: { translations: { en: "Name" } } } } },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    );

    const result = await downloadI18nMessages("http://localhost:8080", "/api/v1/dev/i18n/messages");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/dev/i18n/messages",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("returns undefined on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await downloadI18nMessages("http://localhost:8080", "/api/v1/dev/i18n/messages");
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns undefined on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await downloadI18nMessages("http://localhost:8080", "/api/v1/dev/i18n/messages");
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns undefined on non-Error rejection (e.g. string throw)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue("timeout"),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await downloadI18nMessages("http://localhost:8080", "/api/v1/dev/i18n/messages");
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("timeout"));
  });
});
