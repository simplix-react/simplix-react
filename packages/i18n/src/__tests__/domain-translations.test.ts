import { describe, it, expect, beforeEach } from "vitest";
import { createI18nConfig } from "../create-i18n-config.js";
import {
  registerDomainTranslations,
  getDomainTranslationRegistry,
} from "../domain-translations.js";

// Reset registry between tests by re-registering
function clearRegistry() {
  const registry = getDomainTranslationRegistry() as Map<string, unknown>;
  registry.clear();
}

describe("registerDomainTranslations", () => {
  beforeEach(() => {
    clearRegistry();
  });

  it("registers a domain translation config", () => {
    registerDomainTranslations({
      domain: "pet",
      locales: {
        en: () => Promise.resolve({ default: {} }),
      },
    });

    const registry = getDomainTranslationRegistry();
    expect(registry.has("pet")).toBe(true);
  });

  it("overwrites duplicate domain registrations", () => {
    registerDomainTranslations({
      domain: "pet",
      locales: {
        en: () => Promise.resolve({ default: { pet: { fields: { name: "Old" } } } }),
      },
    });

    registerDomainTranslations({
      domain: "pet",
      locales: {
        en: () => Promise.resolve({ default: { pet: { fields: { name: "New" } } } }),
      },
    });

    const registry = getDomainTranslationRegistry();
    expect(registry.size).toBe(1);
  });
});

describe("domain translations loading via createI18nConfig", () => {
  beforeEach(() => {
    clearRegistry();
  });

  it("loads entity field translations into entity/{name} namespace", async () => {
    registerDomainTranslations({
      domain: "pet",
      locales: {
        en: () =>
          Promise.resolve({
            default: {
              pet: {
                fields: {
                  id: "ID",
                  name: "Name",
                  status: "Status",
                },
              },
            },
          }),
      },
    });

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
    });

    await i18nReady;
    expect(adapter.tn("entity/pet", "fields.name")).toBe("Name");
    expect(adapter.tn("entity/pet", "fields.status")).toBe("Status");
  });

  it("loads enum translations into global enums namespace", async () => {
    registerDomainTranslations({
      domain: "pet",
      locales: {
        en: () =>
          Promise.resolve({
            default: {
              enums: {
                petStatus: {
                  available: "Available",
                  pending: "Pending",
                  sold: "Sold",
                },
              },
            },
          }),
      },
    });

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
    });

    await i18nReady;
    expect(adapter.tn("enums", "petStatus.available")).toBe("Available");
    expect(adapter.tn("enums", "petStatus.sold")).toBe("Sold");
  });

  it("loads Korean translations correctly", async () => {
    registerDomainTranslations({
      domain: "pet",
      locales: {
        ko: () =>
          Promise.resolve({
            default: {
              pet: {
                fields: { name: "이름", status: "상태" },
              },
              enums: {
                petStatus: { available: "판매중", pending: "대기중", sold: "판매완료" },
              },
            },
          }),
      },
    });

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "ko",
    });

    await i18nReady;
    expect(adapter.tn("entity/pet", "fields.name")).toBe("이름");
    expect(adapter.tn("enums", "petStatus.available")).toBe("판매중");
  });

  it("merges enums from multiple domains", async () => {
    registerDomainTranslations({
      domain: "pet",
      locales: {
        en: () =>
          Promise.resolve({
            default: {
              enums: {
                petStatus: { available: "Available", sold: "Sold" },
              },
            },
          }),
      },
    });

    registerDomainTranslations({
      domain: "store",
      locales: {
        en: () =>
          Promise.resolve({
            default: {
              enums: {
                orderStatus: { placed: "Placed", delivered: "Delivered" },
              },
            },
          }),
      },
    });

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
    });

    await i18nReady;
    expect(adapter.tn("enums", "petStatus.available")).toBe("Available");
    expect(adapter.tn("enums", "orderStatus.placed")).toBe("Placed");
  });

  it("handles translations without default export wrapper", async () => {
    registerDomainTranslations({
      domain: "pet",
      locales: {
        en: () =>
          Promise.resolve({
            pet: { fields: { name: "Name" } },
          } as unknown as { default: Record<string, unknown> }),
      },
    });

    const { adapter, i18nReady } = createI18nConfig({
      defaultLocale: "en",
    });

    await i18nReady;
    expect(adapter.tn("entity/pet", "fields.name")).toBe("Name");
  });
});
