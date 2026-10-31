import { describe, it, expect, beforeEach } from "vitest";
import { createI18nConfig } from "../create-i18n-config.js";
import { buildModuleTranslations, getModuleTranslationRegistry } from "../module-translations.js";
import { getDomainTranslationRegistry, registerDomainTranslations } from "../domain-translations.js";

/**
 * A loader that reports when it starts and finishes only when released, so a test can see how
 * many loads are in flight at one time.
 */
function gatedLoaders() {
  const started: string[] = [];
  const releases: Array<() => void> = [];
  const loader = (name: string, data: Record<string, unknown>) => () => {
    started.push(name);
    return new Promise<{ default: Record<string, unknown> }>((resolve) => {
      releases.push(() => resolve({ default: data }));
    });
  };
  return { started, releases, loader };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("i18nReady", () => {
  beforeEach(() => {
    (getModuleTranslationRegistry() as Map<string, unknown>).clear();
    (getDomainTranslationRegistry() as Map<string, unknown>).clear();
  });

  // The first render waits on i18nReady. Loading one catalogue after another makes that wait the
  // sum of every load's latency, which over a slow link held a blank page for many seconds.
  it("starts every module, domain and locale load before any of them finishes", async () => {
    const { started, releases, loader } = gatedLoaders();
    const modules = ["first", "second"].map((name) =>
      buildModuleTranslations({
        namespace: name,
        locales: ["en", "ko"],
        components: {
          panel: { en: loader(`${name}:en`, { title: "Title" }), ko: loader(`${name}:ko`, { title: "제목" }) },
        },
      }),
    );
    registerDomainTranslations({
      domain: "pet",
      locales: { en: loader("pet:en", { pet: { name: "Name" } }), ko: loader("pet:ko", { pet: { name: "이름" } }) },
    });

    const { adapter, i18nReady } = createI18nConfig({ moduleTranslations: modules });
    let ready = false;
    void i18nReady.then(() => {
      ready = true;
    });
    await flush();

    expect([...started].sort()).toEqual(["first:en", "first:ko", "pet:en", "pet:ko", "second:en", "second:ko"]);
    expect(ready).toBe(false);

    for (const release of releases) release();
    await i18nReady;
    expect(adapter.t("first/panel:title")).toBe("Title");
    expect(adapter.t("entity/pet:name")).toBe("Name");
  });
});
