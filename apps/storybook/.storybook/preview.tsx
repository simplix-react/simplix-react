import { useEffect, type ReactNode } from "react";
// @ts-ignore
import type { Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createI18nConfig } from "@simplix-react/i18n";
// @ts-ignore
import { I18nProvider } from "@simplix-react/i18n/react";
// IMPORTANT: import the JS entry BEFORE createI18nConfig() so that
// registerModuleTranslations() side-effect populates the registry.
import "@simplix-react/ui";
import "@simplix-react/ui/styles.css";
import "../src/index.css";

// Initialize i18n once for all stories
const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "en",
  supportedLocales: ["en", "ko", "ja"],
});

/** Syncs the Storybook toolbar locale with the i18n adapter inside useEffect. */
function LocaleSync({ locale, children }: { locale: string; children: ReactNode }) {
  useEffect(() => {
    if (adapter.locale !== locale) {
      adapter.setLocale(locale);
    }
  }, [locale]);
  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
  globalTypes: {
    colorTheme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default" },
          { value: "blue", title: "Blue" },
          { value: "green", title: "Green" },
          { value: "rose", title: "Rose" },
          { value: "orange", title: "Orange" },
          { value: "violet", title: "Violet" },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Light / Dark mode",
      toolbar: {
        title: "Mode",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Locale",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: [
          { value: "en", right: "EN", title: "English" },
          { value: "ko", right: "KO", title: "한국어" },
          { value: "ja", right: "JA", title: "日本語" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorTheme: "default",
    mode: "light",
    locale: "en",
  },
  decorators: [
    (Story, context) => {
      const colorTheme = context.globals.colorTheme || "default";
      const mode = context.globals.mode || "light";
      const locale = context.globals.locale || "en";

      return (
        <I18nProvider adapter={adapter}>
          <LocaleSync locale={locale}>
            <QueryClientProvider client={queryClient}>
              <MemoryRouter>
                <div
                  data-color-theme={colorTheme}
                  className={mode === "dark" ? "dark bg-background text-foreground" : "bg-background text-foreground"}
                  style={{ padding: "1rem" }}
                >
                  <Story />
                </div>
              </MemoryRouter>
            </QueryClientProvider>
          </LocaleSync>
        </I18nProvider>
      );
    },
  ],
  loaders: [async () => { await i18nReady; return {}; }],
};

export default preview;
