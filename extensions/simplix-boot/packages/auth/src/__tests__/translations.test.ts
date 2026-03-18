import { describe, expect, it, vi } from "vitest";

const mockRegister = vi.fn();

vi.mock("@simplix-react/i18n", () => ({
  registerDomainTranslations: mockRegister,
}));

describe("translations side-effect", () => {
  it("registers auth domain translations on import", async () => {
    await import("../translations.js");

    expect(mockRegister).toHaveBeenCalledWith({
      domain: "auth",
      locales: {
        en: expect.any(Function),
        ko: expect.any(Function),
        ja: expect.any(Function),
      },
    });
  });

  it("locale loaders return JSON modules", async () => {
    await import("../translations.js");

    const config = mockRegister.mock.calls[0][0];
    const enModule = await config.locales.en();
    const koModule = await config.locales.ko();
    const jaModule = await config.locales.ja();

    expect(enModule.default).toBeDefined();
    expect(koModule.default).toBeDefined();
    expect(jaModule.default).toBeDefined();
  });
});
