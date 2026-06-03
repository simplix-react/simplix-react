# `@simplix-react/ui` Consumer Styling / Token Setup Guide

This document is a reference for **what you must define on the consumer side** when you add `@simplix-react/ui` as a dependency in another project and use its components.

> **Prerequisites:** You have a simplix-react project (or any React app) that adds `@simplix-react/ui` as a dependency, and a build that supports Tailwind CSS v4 (via `@tailwindcss/vite`). You should also be comfortable defining CSS variables in a Tailwind v4 `@theme` block.

## In One Sentence

This package ships almost no CSS files. The **design tokens (CSS variables) and Tailwind configuration that the component class names reference must be provided by you, the consumer**, and the only CSS the package ships is a single file that corrects table scrollbar rendering.

---

## 1. The Style File the Package Actually Ships (Exactly One)

| File | Contents | When to use |
|---|---|---|
| `@simplix-react/ui/styles.css` (source: `packages/ui/src/styles.css` → copied verbatim to `dist/styles.css` at build time) | ~30 lines of cross-browser scrollbar correction for `[data-slot="table-container"]` | Required if you use the `Table` family. Otherwise optional |

Internally it references `var(--muted)` and `var(--border)`, so if you do not define these tokens, the affected areas are rendered as transparent.

Build-config evidence: `packages/ui/tsup.config.ts` → `onSuccess: "cp src/styles.css dist/styles.css"`

---

## 2. CSS Variables You Must Define (Design Tokens)

Because the component class names use Tailwind utilities such as `bg-background`, `text-muted-foreground`, `border-input`, and `bg-primary/10`, the following variables must be defined in a Tailwind v4 `@theme` block.

Evidence locations:
- `packages/ui/src/base/inputs/textarea.tsx:12` — `border-input bg-background placeholder:text-muted-foreground aria-[invalid=true]:border-destructive`
- `packages/ui/src/base/inputs/icon-picker.tsx:319-337` — `bg-primary/10 text-primary bg-muted`

### 2-1. Color Tokens (Used in Pairs)

| Token | Pair | Where it is used |
|---|---|---|
| `--background` | `--foreground` | Global body, every surface |
| `--card` | `--card-foreground` | `Card`, `CrudDetail` sections |
| `--popover` | `--popover-foreground` | `Popover`, `DropdownMenu`, `Select`, `Tooltip` content |
| `--primary` | `--primary-foreground` | `Button` (default), active states, ring emphasis |
| `--secondary` | `--secondary-foreground` | `Button` (secondary), secondary emphasis |
| `--muted` | `--muted-foreground` | Disabled text, hover surface, placeholder |
| `--accent` | `--accent-foreground` | Hover/focus surface, menu items |
| `--destructive` | `--destructive-foreground` | Delete button, errors, `aria-invalid` |
| `--warning` | — | Notifications / warnings |
| `--info` | — | Informational notifications |
| `--border` | — | All separators, input/card borders |
| `--input` | — | `Input`, `Textarea` borders (usually the same as `--border`) |
| `--ring` | — | focus-visible ring |

### 2-2. Chart Tokens (Used by `base/charts/`)

`--chart-1` through `--chart-5`

### 2-3. Sidebar Tokens (Optional — Used by Layout / Menu Components)

`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`

### 2-4. Corner Radius

`--radius` (base) → `--radius-sm | --radius-md | --radius-lg | --radius-xl` are automatically derived from it via `calc()`

### 2-5. Font Families

- `--font-sans` — Body text (Tailwind `font-sans`)
- `--font-display` — Heading emphasis (Tailwind `font-display`)
- `--font-mono` — Code (Tailwind `font-mono`)
- `--font-title` — Referenced directly by some headings (Optional)

---

## 3. Tailwind Configuration Requirements

This package assumes **Tailwind CSS v4** (catalog version `^4.2.1`). Your consumer build needs the following.

1. Add the `@tailwindcss/vite` plugin to `vite.config.ts`
2. In your consumer entry CSS:
   - `@import "tailwindcss";`
   - **`@source "../node_modules/@simplix-react/ui/dist/**/*.js";`** — if you omit this, the component classes are tree-shaken away and the styles disappear
   - Define the tokens above in an `@theme { ... }` block

The starter that the CLI generates looks exactly like this: `packages/cli/src/templates/project/app/index-css.hbs`

---

## 4. Dark Mode / Multi-Color Themes

- **Dark mode**: Toggle a `.dark` class on `<html>` or a wrapper → tokens are overridden in the `.dark { ... }` block
- **Color scheme swap**: Redefine tokens via an attribute selector such as `data-color-theme="blue"`
- **Six reference implementations**: `apps/storybook/src/themes/{default,blue,green,rose,orange,violet}.css`

These six files are the most complete token definition examples, so you can copy them directly as the starting point for the `index.css` you create.

---

## 5. i18n Side Effect (Intentional side-effect import)

Merely importing `@simplix-react/ui` runs `src/locales/index.ts`, which automatically registers the `simplix` namespace (en/ko/ja) in the `@simplix-react/i18n` module registry.

- The `sideEffects` field in `package.json` is configured to preserve these files
- **Import order matters**: You must import `@simplix-react/ui` **before** calling `createI18nConfig()` (see the comment in `apps/storybook/.storybook/preview.tsx:11`)

---

## 6. Minimum Consumer Setup (Practical Checklist)

```bash
pnpm add @simplix-react/ui @simplix-react/i18n @simplix-react/form @simplix-react/react \
         @tanstack/react-query react react-dom
pnpm add -D tailwindcss@^4.2 @tailwindcss/vite
```

`vite.config.ts`:
```ts
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`src/index.css`:
```css
@import "tailwindcss";
@source "../node_modules/@simplix-react/ui/dist/**/*.js";
@source "./**/*.tsx";

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  /* ... copy every token from apps/storybook/src/themes/default.css */
}
.dark { /* dark override */ }

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... map all --color-* aliases */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply m-0 font-sans antialiased text-foreground bg-background; }
}
```

`src/main.tsx`:
```ts
import "./index.css";
import "@simplix-react/ui";              // i18n side-effect first
import "@simplix-react/ui/styles.css";   // required if you use Table
// then createI18nConfig(), createRoot, etc.
```

App root:
```tsx
<UIProvider>
  <CrudProvider router={createReactRouterAdapter({ useNavigate, useSearchParams, useLocation })}>
    <App />
  </CrudProvider>
</UIProvider>
```

---

## 7. File Location Index (For Troubleshooting)

| File | Role |
|---|---|
| `packages/ui/src/styles.css` | The **only** CSS the package ships (scrollbar correction) |
| `packages/ui/tsup.config.ts` | Copies the CSS to `dist/styles.css` without processing |
| `packages/ui/src/index.ts` | Public surface (exports all components/hooks/types) |
| `packages/ui/src/locales/{en,ko,ja}.json` | Translations bundled with the package |
| `packages/ui/src/locales/index.ts` | Automatic i18n module registration (side effect) |
| `apps/storybook/src/index.css` | Reference for Tailwind import + `@source` + `@layer base` |
| `apps/storybook/src/themes/default.css` | Complete example of `:root` + `.dark` + `@theme inline` (115 lines) — the base for consumers to copy |
| `apps/storybook/src/themes/{blue,green,rose,orange,violet}.css` | The `data-color-theme="..."` multi-theme pattern |
| `apps/storybook/.storybook/preview.tsx` | Import order + theme toggle demo |
| `packages/cli/src/templates/project/app/index-css.hbs` | CLI-generated starter (minimal production token set) |
| `packages/cli/src/templates/project/app/vite-config.hbs` | Vite + Tailwind v4 plugin setup |
| `packages/cli/src/templates/project/app/main-tsx.hbs` | Entry import order |
| `packages/ui/README.md:148` | 5-step customization guide, including UIProvider overrides |

---

> **Next Step:** Once your tokens and Tailwind setup are in place, see [`consumer-design-customization.md`](./consumer-design-customization.md) to learn how to change colors, fonts, radius, per-component styles, and component structure. For the components themselves, see [`ui-components.md`](./ui-components.md).
