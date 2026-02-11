# How to Add Internationalization to Your App

> Set up multi-language support in a simplix-react application using `@simplix-react/i18n`.

## Before You Begin

- A simplix-react project initialized with `simplix init` (i18n enabled)
- Translation JSON files organized under `src/locales/<namespace>/<locale>.json`
- Install the i18n package if not already present:

```bash
pnpm add @simplix-react/i18n
```

## Solution

### Step 1 -- Create Translation Files

Organize translations by namespace and locale. Each namespace gets its own directory with one JSON file per locale:

```
src/
  locales/
    common/
      en.json
      ko.json
      ja.json
    dashboard/
      en.json
      ko.json
```

```json
// src/locales/common/en.json
{
  "greeting": "Hello, {{name}}!",
  "logout": "Log out",
  "items_count_one": "{{count}} item",
  "items_count_other": "{{count}} items"
}
```

```json
// src/locales/common/ko.json
{
  "greeting": "{{name}}님, 안녕하세요!",
  "logout": "로그아웃",
  "items_count_one": "{{count}}개 항목",
  "items_count_other": "{{count}}개 항목"
}
```

### Step 2 -- Configure i18n

Use `createI18nConfig` to initialize the adapter. Vite's `import.meta.glob` loads all translation files eagerly at build time:

```ts
// src/app/i18n/index.ts
import { createI18nConfig } from "@simplix-react/i18n";

const appTranslations = import.meta.glob("../../locales/**/*.json", {
  eager: true,
});

export const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  fallbackLocale: "en",
  appTranslations,
  debug: false,
});
```

`createI18nConfig` returns two values:

| Return value | Type | Description |
| --- | --- | --- |
| `adapter` | `I18nextAdapter` | The configured adapter instance |
| `i18nReady` | `Promise<void>` | Resolves when all translations (including module translations) are loaded |

### Step 3 -- Wrap Your App with I18nProvider

The `I18nProvider` component exposes the adapter to all descendant components via React context. Wait for `i18nReady` before rendering:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "@simplix-react/i18n/react";
import { adapter, i18nReady } from "./app/i18n/index.js";
import { App } from "./app/index.js";

async function bootstrap() {
  await i18nReady;

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <I18nProvider adapter={adapter}>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
}

bootstrap();
```

### Step 4 -- Use Translation Hooks in Components

#### useTranslation -- Namespace-Scoped Translations

The primary hook for translating text. It scopes all lookups to a single namespace and re-renders automatically on locale changes:

```tsx
import { useTranslation } from "@simplix-react/i18n/react";

function Greeting() {
  const { t, locale } = useTranslation("common");

  return (
    <div>
      <p>{t("greeting", { name: "Alice" })}</p>
      <small>Current locale: {locale}</small>
    </div>
  );
}
```

The returned object contains:

| Property | Type | Description |
| --- | --- | --- |
| `t` | `(key, values?) => string` | Translates a key within the namespace |
| `locale` | `string` | Currently active locale code |
| `exists` | `(key) => boolean` | Checks whether a key exists |

#### useLocale -- Reactive Locale Code

Returns only the active locale code. Re-renders on locale change:

```tsx
import { useLocale } from "@simplix-react/i18n/react";

function LocaleBadge() {
  const locale = useLocale();
  return <span>{locale.toUpperCase()}</span>;
}
```

#### useI18n -- Direct Adapter Access

Returns the full `II18nAdapter` instance for advanced operations (formatting, locale info, programmatic locale switching):

```tsx
import { useI18n } from "@simplix-react/i18n/react";

function PriceDisplay({ amount }: { amount: number }) {
  const i18n = useI18n();
  if (!i18n) return null;

  return <span>{i18n.formatCurrency(amount)}</span>;
}
```

### Step 5 -- Switch Locales at Runtime

Use the adapter's `setLocale` method. All hooks subscribed via `useSyncExternalStore` re-render automatically:

```tsx
import { useI18n } from "@simplix-react/i18n/react";

function LocaleSwitcher() {
  const i18n = useI18n();
  if (!i18n) return null;

  return (
    <select
      value={i18n.locale}
      onChange={(e) => i18n.setLocale(e.target.value)}
    >
      {i18n.availableLocales.map((code) => {
        const info = i18n.getLocaleInfo(code);
        return (
          <option key={code} value={code}>
            {info?.name ?? code}
          </option>
        );
      })}
    </select>
  );
}
```

## Variations

### Lazy-Loading Module Translations

For large apps, split translations per module using `buildModuleTranslations`. Module translations are loaded on demand rather than bundled eagerly:

```ts
// modules/dashboard/src/locales/index.ts
import { buildModuleTranslations } from "@simplix-react/i18n";

export const dashboardTranslations = buildModuleTranslations({
  namespace: "dashboard",
  locales: ["en", "ko", "ja"],
  components: {
    header: {
      en: () => import("./header/en.json"),
      ko: () => import("./header/ko.json"),
      ja: () => import("./header/ja.json"),
    },
    sidebar: {
      en: () => import("./sidebar/en.json"),
      ko: () => import("./sidebar/ko.json"),
      ja: () => import("./sidebar/ja.json"),
    },
  },
});
```

Pass module translations to `createI18nConfig`:

```ts
import { createI18nConfig } from "@simplix-react/i18n";
import { dashboardTranslations } from "@myapp/dashboard/locales";

const appTranslations = import.meta.glob("../../locales/**/*.json", {
  eager: true,
});

export const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  appTranslations,
  moduleTranslations: [dashboardTranslations],
});
```

Module translations are namespaced as `dashboard/header`, `dashboard/sidebar`, etc. Use them in components:

```tsx
const { t } = useTranslation("dashboard/header");
t("title"); // looks up "dashboard/header:title"
```

### Custom Locale Configuration

Override the built-in locales (ko, en, ja) with custom `LocaleConfig` entries:

```ts
import { createI18nConfig } from "@simplix-react/i18n";
import type { LocaleConfig } from "@simplix-react/i18n";

const customLocales: LocaleConfig[] = [
  {
    code: "en",
    name: "English",
    englishName: "English",
    direction: "ltr",
    dateFormat: "MM/dd/yyyy",
    currency: "USD",
  },
  {
    code: "ar",
    name: "العربية",
    englishName: "Arabic",
    direction: "rtl",
    dateFormat: "dd/MM/yyyy",
    currency: "SAR",
  },
];

export const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "en",
  supportedLocales: customLocales,
  appTranslations: import.meta.glob("../../locales/**/*.json", { eager: true }),
});
```

### Formatting Dates, Numbers, and Currency

The adapter provides `Intl`-based formatting that respects the active locale:

```tsx
import { useI18n } from "@simplix-react/i18n/react";

function OrderSummary({ total, date }: { total: number; date: Date }) {
  const i18n = useI18n();
  if (!i18n) return null;

  return (
    <dl>
      <dt>Date</dt>
      <dd>{i18n.formatDate(date, { dateStyle: "long" })}</dd>

      <dt>Total</dt>
      <dd>{i18n.formatCurrency(total, "KRW")}</dd>

      <dt>Quantity</dt>
      <dd>{i18n.formatNumber(1234.5, { maximumFractionDigits: 0 })}</dd>

      <dt>Placed</dt>
      <dd>{i18n.formatRelativeTime(date)}</dd>
    </dl>
  );
}
```

### Type-Safe Translation Keys with i18n-codegen

Generate TypeScript types from your JSON files to catch missing keys at compile time:

```bash
simplix i18n-codegen
```

This produces `keys.d.ts` files alongside your locale JSON. Use the generated type with `useTranslation`:

```tsx
import type { CommonKeys } from "../locales/keys.d.ts";

const { t } = useTranslation<CommonKeys>("common");
t("greeting"); // ✔ type-checked
t("typo");     // ✖ compile error
```

## Related

- [CLI Usage](./cli-usage.md) -- `simplix init` with i18n, `simplix i18n-codegen`
- [Testing with Mocks](./testing-with-mocks.md) -- Testing components that use i18n
- [@simplix-react/i18n source](../../packages/i18n/src/)
