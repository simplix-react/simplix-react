# `@simplix-react/ui` Design Customization Guide

> **Prerequisites:** Complete the initial styling setup described in [`consumer-styling-setup.md`](./consumer-styling-setup.md) — you should already have Tailwind wired up, the `@source` globs configured, and `@simplix-react/ui/styles.css` imported before following this guide.

This guide explains **how you can change the design** when using `@simplix-react/ui` in your consumer project. The files you copy and the approach you take depend on the scope of your change.

Related document: [`consumer-styling-setup.md`](./consumer-styling-setup.md) — initial setup and design token reference.

---

## Table of Contents

- [Changing the design — which file do you copy and edit?](#changing-the-design--which-file-do-you-copy-and-edit)
  - [1. You only want to change colors, fonts, and radius (90% of cases)](#1-you-only-want-to-change-colors-fonts-and-radius-90-of-cases)
  - [2. You want several color palettes and toggle between them](#2-you-want-several-color-palettes-and-toggle-between-them)
  - [3. You want just one specific component to look different](#3-you-want-just-one-specific-component-to-look-different-eg-only-button-in-a-corporate-style)
  - [4. You want just one specific instance to look slightly different](#4-you-want-just-one-specific-instance-to-look-slightly-different)
  - [5. You want to restyle the table scrollbar](#5-you-want-to-restyle-the-table-scrollbar)
  - [6. You want to change the component structure itself](#6-you-want-to-change-the-component-structure-itself-layout--behavior)
- [Decision tree summary](#decision-tree-summary)
- [What is included in default.css](#what-is-included-in-defaultcss)
  - [Radius definitions](#radius-definitions)
  - [Full structure of default.css](#full-structure-of-defaultcss)
- [Step-by-step theming guide](#step-by-step-theming-guide)
  - [Scenario A: Unify everything under one brand color (most common)](#scenario-a-unify-everything-under-one-brand-color-most-common)
  - [Scenario B: A multi-theme app where users pick a theme](#scenario-b-a-multi-theme-app-where-users-pick-a-theme)
  - [Scenario C: Auto-detect the system dark mode](#scenario-c-auto-detect-the-system-dark-mode)
  - [Key takeaways](#key-takeaways)
- [How the theme select works (Storybook example walkthrough)](#how-the-theme-select-works-storybook-example-walkthrough)
  - [The mechanism in one line](#the-mechanism-in-one-line)
  - [The structure in Storybook (three parts)](#the-structure-in-storybook-three-parts)
  - [The flow](#the-flow)
  - [Mechanism mapping](#mechanism-mapping)

---

## Changing the design — which file do you copy and edit?

### 1. You only want to change colors, fonts, and radius (90% of cases)

**Copy**: `apps/storybook/src/themes/default.css` → your consumer's `src/index.css` (or a separate `src/theme.css`).

**Edit**:
- Change only the values in `:root { --primary, --background, --foreground, ... }`.
- To change fonts, edit `@theme inline { --font-sans, --font-display, --font-mono }`.
- For corner rounding, change only the single `--radius` value — `--radius-sm/md/lg/xl` are automatically derived.
- For dark mode variants, edit the `.dark { ... }` block as well.

Once you fix this one file, **every Button, Input, Card, Badge, and so on is updated automatically** (you never touch the component code).

### 2. You want several color palettes and toggle between them

**Copy**: `apps/storybook/src/themes/blue.css` (or whichever of green/rose/orange/violet is closest to what you want).

**Edit**:
- Rename the selector: `[data-color-theme='blue']` → `[data-color-theme='mybrand']`.
- Replace the token values.
- Toggle `<html data-color-theme="mybrand">` in your consumer app.

### 3. You want just one specific component to look different (e.g., only Button in a corporate style)

**Nothing to copy**. Use a UIProvider override:

```tsx
import { UIProvider } from "@simplix-react/ui";
import { MyButton } from "./my-button";

<UIProvider overrides={{ Button: MyButton }}>
  <App />
</UIProvider>
```

Overridable items: `Input`, `Textarea`, `Label`, `Switch`, `Checkbox`, `Badge`, `Calendar`, `Select`, `RadioGroup` (`packages/ui/README.md:797`).

Components not in the list above — such as `Button` — **cannot be overridden, so you must use approach 4 instead.**

### 4. You want just one specific instance to look slightly different

**Copy nothing**. Override with the `className` prop:

```tsx
<Button className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
```

The `cn()` utility uses `tailwind-merge` to resolve conflicting classes automatically.

### 5. You want to restyle the table scrollbar

**Copy**: `packages/ui/src/styles.css` (30 lines) → into your consumer project.

**After editing**:
- **Remove** the `import "@simplix-react/ui/styles.css"` line.
- Import your consumer version instead.

### 6. You want to change the component structure itself (layout / behavior)

**Copy nothing**. Two approaches:
- (a) Replace the component wholesale with a UIProvider override (overridable components only).
- (b) Do not use the simplix component for that case and write your own instead.

Forking the source is discouraged — this package is updated frequently, and forks carry a high merge cost.

---

## Decision tree summary

| What you want | File to copy | Where to edit |
|---|---|---|
| Overall tone, color, font | `apps/storybook/src/themes/default.css` | Token values |
| Multiple color themes | `apps/storybook/src/themes/blue.css` | Selector + tokens |
| Replace one component wholesale | (no copy) | `<UIProvider overrides={{ ... }}>` |
| A single instance | (no copy) | `className` prop |
| Table scrollbar | `packages/ui/src/styles.css` | Copy into consumer, then swap the import |

In most cases you are done with **approach 1 alone (copy and edit default.css).**

---

## What is included in default.css

The single file `apps/storybook/src/themes/default.css` contains **the entire design system (115 lines)**.

### Radius definitions

**Inside `:root` (line 3)**:

```css
--radius: 0.625rem;
```

**Inside `@theme inline` (lines 76-79) — automatically derived**:

```css
--radius-sm: calc(var(--radius) - 4px);   /* 6px */
--radius-md: calc(var(--radius) - 2px);   /* 8px */
--radius-lg: var(--radius);               /* 10px */
--radius-xl: calc(var(--radius) + 4px);   /* 14px */
```

In other words, **when you change only the single `--radius` value**, the `rounded-sm/md/lg/xl` utilities all scale proportionally to follow it. You do not need to define the four values separately.

### Full structure of default.css

| Category | Where it is defined |
|---|---|
| Color token pairs (background, primary, muted, destructive, border, and so on — all of them) | `:root` (lines 4-24) |
| Chart colors `--chart-1` ~ `--chart-5` | `:root` (lines 25-29) |
| Eight sidebar tokens | `:root` (lines 31-38) |
| Dark mode overrides (all colors + charts) | `.dark { ... }` (lines 41-68) |
| **`--radius` base + sm/md/lg/xl derived values** | `:root` + `@theme inline` |
| Four font families (`--font-sans`, `--font-display`, `--font-title`, `--font-mono`) | `@theme inline` (lines 71-74) |
| Tailwind `--color-*` alias mappings (all of them) | `@theme inline` (lines 80-113) |

Because this **115-line file holds the entire design system**, you just copy it as-is and edit the values.

---

## Step-by-step theming guide

This is the full flow for applying a theme to simplix-react components in your consumer project.

### Scenario A: Unify everything under one brand color (most common)

#### Step 1. Copy the theme file

```bash
mkdir -p src/styles
cp /path/to/simplix-react/apps/storybook/src/themes/default.css \
   src/styles/theme.css
```

#### Step 2. Edit the token values (`src/styles/theme.css`)

```css
:root {
  --radius: 0.5rem;                          /* corner rounding */
  --primary: oklch(0.55 0.22 240);           /* brand blue */
  --primary-foreground: oklch(0.98 0 0);     /* text color on top of primary */
  --ring: oklch(0.55 0.22 240);              /* focus ring follows along too */
  /* leave the rest as-is */
}

.dark {
  --primary: oklch(0.65 0.20 240);           /* slightly lighter for dark mode */
  /* ... */
}
```

#### Step 3. Import it from the entry CSS (`src/index.css`)

```css
@import "tailwindcss";
@source "../node_modules/@simplix-react/ui/dist/**/*.js";
@source "./**/*.tsx";

@import "./styles/theme.css";    /* <- this one line */

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply m-0 font-sans antialiased text-foreground bg-background; }
}
```

#### Step 4. main.tsx

```ts
import "./index.css";
import "@simplix-react/ui";
import "@simplix-react/ui/styles.css";
```

**Done.** Every component — Button, Input, Card, and so on — automatically reflects the brand color. No attribute toggling required.

---

### Scenario B: A multi-theme app where users pick a theme

#### Step 1. Copy the theme files

```bash
mkdir -p src/styles/themes
cp /path/to/simplix-react/apps/storybook/src/themes/default.css src/styles/themes/
cp /path/to/simplix-react/apps/storybook/src/themes/blue.css    src/styles/themes/
cp /path/to/simplix-react/apps/storybook/src/themes/green.css   src/styles/themes/
cp /path/to/simplix-react/apps/storybook/src/themes/rose.css    src/styles/themes/
```

#### Step 2. Import them all (`src/index.css`)

```css
@import "tailwindcss";
@source "../node_modules/@simplix-react/ui/dist/**/*.js";
@source "./**/*.tsx";

@import "./styles/themes/default.css";    /* :root — always active (base) */
@import "./styles/themes/blue.css";       /* [data-color-theme='blue'] — on standby */
@import "./styles/themes/green.css";      /* [data-color-theme='green'] — on standby */
@import "./styles/themes/rose.css";       /* [data-color-theme='rose'] — on standby */
```

#### Step 3. The theme toggle hook (`src/hooks/use-theme.ts`)

```ts
import { useEffect, useState } from "react";

type Theme = "default" | "blue" | "green" | "rose";
type Mode = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "default"
  );
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem("mode") as Mode) || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.colorTheme = theme;
    root.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", theme);
    localStorage.setItem("mode", mode);
  }, [theme, mode]);

  return { theme, setTheme, mode, setMode };
}
```

#### Step 4. The select UI (`src/components/theme-switcher.tsx`)

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@simplix-react/ui";
import { useTheme } from "../hooks/use-theme";

export function ThemeSwitcher() {
  const { theme, setTheme, mode, setMode } = useTheme();

  return (
    <div className="flex gap-2">
      <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="blue">Blue</SelectItem>
          <SelectItem value="green">Green</SelectItem>
          <SelectItem value="rose">Rose</SelectItem>
        </SelectContent>
      </Select>

      <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>
        {mode === "light" ? "Dark" : "Light"}
      </button>
    </div>
  );
}
```

#### Step 5. Place it anywhere

```tsx
function App() {
  return (
    <UIProvider>
      <header>
        <ThemeSwitcher />     {/* the user selects here */}
      </header>
      <main>
        {/* every component switches colors according to the selected theme/mode */}
      </main>
    </UIProvider>
  );
}
```

---

### Scenario C: Auto-detect the system dark mode

Make the `useTheme` hook follow the OS setting:

```ts
useEffect(() => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    document.documentElement.classList.toggle("dark", mq.matches);
  };
  apply();
  mq.addEventListener("change", apply);
  return () => mq.removeEventListener("change", apply);
}, []);
```

---

### Key takeaways

| What you want | What you need to do |
|---|---|
| A single brand color | Override only the `:root` tokens → automatic |
| A multi-theme select | Import + toggle `data-color-theme` |
| Dark/light toggle | Toggle the `.dark` class on `<html>` |
| Persist the user's choice | `localStorage` + `useEffect` |
| A different theme for only part of the tree | Attach `data-color-theme` to that wrapper |

**In every scenario you never touch the simplix-react component code.** Once you set up the CSS variables, everything afterward is done purely by toggling attributes.

---

## How the theme select works (Storybook example walkthrough)

The following is background on how the theme select UI in Storybook works — you can use the exact same pattern in a regular React app too. This is included to show the underlying mechanism, not as a required setup step. Reference file: `apps/storybook/.storybook/preview.tsx`.

### The mechanism in one line

state → DOM attribute → CSS cascade → tokens → Tailwind → screen.

When React state changes, the DOM attribute changes, and everything after that runs on **pure CSS mechanisms**. A component does not even know what color it is — it simply declares `bg-primary`.

### The structure in Storybook (three parts)

#### (1) The select menu definition (lines 47-63)

```ts
globalTypes: {
  colorTheme: {
    description: "Color theme",
    toolbar: {
      title: "Theme",
      icon: "paintbrush",
      items: [
        { value: "default", title: "Default" },
        { value: "blue",    title: "Blue" },
        { value: "green",   title: "Green" },
        { value: "rose",    title: "Rose" },
        { value: "orange",  title: "Orange" },
        { value: "violet",  title: "Violet" },
      ],
      dynamicTitle: true,
    },
  },
}
```

The `value` is the string that becomes the `data-color-theme` value.

#### (2) The initial values (lines 90-94)

```ts
initialGlobals: {
  colorTheme: "default",
  mode: "light",
  locale: "en",
}
```

#### (3) The decorator — redraws the attribute on every render (lines 96-118)

```tsx
decorators: [
  (Story, context) => {
    const colorTheme = context.globals.colorTheme || "default";
    const mode = context.globals.mode || "light";

    return (
      <div
        data-color-theme={colorTheme}
        className={mode === "dark" ? "dark bg-background text-foreground" : "bg-background text-foreground"}
      >
        <Story />
      </div>
    );
  },
]
```

### The flow

1. The user selects "Blue" from the toolbar.
2. Storybook updates `context.globals.colorTheme = "blue"` and **re-runs** the decorator.
3. The decorator re-renders as `<div data-color-theme="blue">`.
4. The browser re-evaluates the CSS cascade → the `[data-color-theme='blue']` selector matches → tokens such as `--primary` are replaced with the blue values.
5. Every Tailwind utility that reads `var(--primary)` — `bg-primary`, `text-primary`, and so on — immediately shows the new color.

### Mechanism mapping

| Storybook part | Role | Equivalent in a regular React app |
|---|---|---|
| `globalTypes.colorTheme.items` | The list of options in the select menu | The `<SelectItem>` entries |
| `context.globals.colorTheme` | The currently selected value (state) | `useState<Theme>()` |
| `<div data-color-theme={...}>` | Binds the value to a DOM attribute | Set `documentElement.dataset.colorTheme` via `useEffect` |
| The CSS selector `[data-color-theme='blue']` | Fires when the attribute matches | Same |
| Tailwind `var(--primary)` | Reacts automatically to token value changes | Same |

---

> **Next step:** See [`consumer-styling-setup.md`](./consumer-styling-setup.md) for the initial styling setup and the full design token reference, and [`ui-components.md`](./ui-components.md) for the catalog of available UI components you are theming.
