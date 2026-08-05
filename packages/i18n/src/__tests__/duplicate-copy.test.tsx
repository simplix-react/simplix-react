// @vitest-environment jsdom
//
// A bundle can hold two copies of this package — a linked framework checkout answers
// its own peer imports from its own workspace, and a package manager keeps one physical
// copy per peer-dependency resolution. Everything below drives the two-copy case: the
// registration a package makes must reach the configuration the application builds, and
// the adapter a provider supplies must reach a component that subscribes through the
// other copy. Both used to fail without raising anything, so every framework string
// rendered as its own key.
//
// `vi.resetModules()` produces the second copy: the next dynamic import re-evaluates the
// module graph under test while `react` and the testing library, being externalized, stay
// single.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

type ModuleTranslationsModule =
  typeof import("../module-translations.js");
type DomainTranslationsModule = typeof import("../domain-translations.js");
type ProviderModule = typeof import("../react/i18n-provider.js");
type TranslationModule = typeof import("../react/use-translation.js");

/** Loads the module graph twice, so each pair of exports comes from its own copy. */
async function loadTwoCopies<T>(load: () => Promise<T>): Promise<[T, T]> {
  vi.resetModules();
  const first = await load();
  vi.resetModules();
  const second = await load();
  return [first, second];
}

function descriptor(mod: ModuleTranslationsModule) {
  return mod.buildModuleTranslations({
    namespace: "simplix",
    locales: ["ko"],
    components: {
      ui: { ko: () => Promise.resolve({ default: { list: { rows: "행:" } } }) },
    },
  });
}

describe("module translations across two copies of the package", () => {
  let copyA: ModuleTranslationsModule;
  let copyB: ModuleTranslationsModule;

  beforeEach(async () => {
    [copyA, copyB] = await loadTwoCopies(
      () => import("../module-translations.js"),
    );
    (copyA.getModuleTranslationRegistry() as Map<string, unknown>).clear();
  });

  it("loads as two genuinely distinct copies", () => {
    expect(copyB.registerModuleTranslations).not.toBe(
      copyA.registerModuleTranslations,
    );
  });

  it("a registration made through one copy is visible to the other", () => {
    copyA.registerModuleTranslations(descriptor(copyA));

    expect([...copyB.getModuleTranslationRegistry().keys()]).toEqual([
      "simplix:ui",
    ]);
  });

  it("notifies a listener subscribed through the other copy", () => {
    const seen: string[] = [];
    const unsubscribe = copyB.onModuleTranslationsRegistered((t) =>
      seen.push(t.namespace),
    );

    copyA.registerModuleTranslations(descriptor(copyA));
    unsubscribe();

    expect(seen).toEqual(["simplix"]);
  });
});

describe("domain translations across two copies of the package", () => {
  it("a registration made through one copy is visible to the other", async () => {
    const [copyA, copyB] = await loadTwoCopies<DomainTranslationsModule>(
      () => import("../domain-translations.js"),
    );
    (copyA.getDomainTranslationRegistry() as Map<string, unknown>).clear();

    const seen: string[] = [];
    const unsubscribe = copyB.onDomainTranslationsRegistered((c) =>
      seen.push(c.domain),
    );
    copyA.registerDomainTranslations({
      domain: "licensing",
      locales: { ko: () => Promise.resolve({ default: {} }) },
    });
    unsubscribe();

    expect(copyB.getDomainTranslationRegistry().has("licensing")).toBe(true);
    expect(seen).toEqual(["licensing"]);
  });
});

describe("the React context across two copies of the package", () => {
  afterEach(cleanup);

  it("resolves a string through a provider mounted by the other copy", async () => {
    vi.resetModules();
    const providerCopy = (await import(
      "../react/i18n-provider.js"
    )) as ProviderModule;
    const { I18nextAdapter } = await import("../i18next-adapter.js");

    vi.resetModules();
    const consumerCopy = (await import(
      "../react/use-translation.js"
    )) as TranslationModule;

    const adapter = new I18nextAdapter({
      defaultLocale: "ko",
      fallbackLocale: "ko",
      locales: [{ code: "ko", name: "한국어", englishName: "Korean" }],
      resources: { ko: { "simplix/ui": { list: { rows: "행:" } } } },
    });
    await adapter.initialize("ko");

    const { I18nProvider } = providerCopy;

    function Label() {
      const { t } = consumerCopy.useTranslation("simplix/ui");
      return <span data-testid="label">{t("list.rows")}</span>;
    }

    render(
      <I18nProvider adapter={adapter}>
        <Label />
      </I18nProvider>,
    );

    // Without shared context this reads "list.rows" — the hook finds no adapter and
    // hands the key straight back, which is exactly what reached the screen.
    expect(screen.getByTestId("label").textContent).toBe("행:");
  });
});
