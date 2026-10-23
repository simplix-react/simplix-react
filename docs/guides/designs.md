# Choose and add a design

A design decides how every component looks; behaviour, keyboard handling and motion are the same in every design. `@simplix-react/ui` ships two designs, `classic` (the default) and `clarity`, and a colour theme (`data-color-theme`) and a card fill (`data-fill`) apply on top of either.

## Choose a design

Pass the design to the root `UIProvider`. It writes `data-design` on the document element, so dialogs, popovers and toasts rendered into `document.body` take it too.

```tsx
import { UIProvider } from "@simplix-react/ui";
import { CLARITY_DESIGN } from "@simplix-react/ui/design";

<UIProvider design={CLARITY_DESIGN}>{app}</UIProvider>;
```

A design brings its own `UIDefaults` (clarity sets `density: "comfortable"`); the provider's `defaults` still win over them. Without a `design`, the classic design applies.

## Mark what a component draws

Every element that carries a look is marked, and the look itself lives in a `.style.ts` declaration beside the component.

```ts
// toolbar.style.ts
import { defineSlotStyle } from "@simplix-react/ui/design";

export const toolbarStyle = defineSlotStyle({
  slot: "toolbar",
  base: "gap-2 rounded-md border bg-card p-2",
  variants: { tone: { plain: "", warn: "border-warning" } },
  defaultVariants: { tone: "plain" },
});
```

```tsx
// toolbar.tsx
<div className="flex items-center" {...slotAttributes(toolbarStyle, { tone })} />
```

- Structure classes (display, flex and grid flow, position, overflow, size) stay on the element; look classes (colour, border, radius, shadow, spacing, type) go into the declaration.
- An element that another component renders (a `Badge`, `Stack`, `PopoverContent`) is marked with `partAttributes` and a declaration with `as: "part"`; the component's own `data-slot` stays, and the part rule draws over it.
- Entry and exit motion (`animate-in`, `fade-*`, `zoom-*`, `slide-*`) stays on the element: it is the same in every design, and the generator refuses it in a declaration.

Regenerate the stylesheets after changing a declaration:

```bash
pnpm --filter @simplix-react/ui design:css
pnpm --filter @simplix-react/ui design:check
```

`design:check` fails when a generated stylesheet is stale or when a design leaves a classic rule undrawn.

## Add a design

A design other than classic is a spec: class replacements applied to every declaration, then per-slot overrides merged over the result with tailwind-merge.

```ts
// src/design/<id>.spec.ts
import type { DesignSpec } from "./design-spec";

const spec: DesignSpec = {
  id: "<id>",
  replace: { "rounded-md": "rounded-[var(--radius-control)]", "shadow-sm": "shadow-none" },
  slots: {
    "table-header": "bg-[var(--table-head)]",
    "button variant=outline": "bg-card",
  },
};

export default spec;
```

1. Write the spec and a `theme/designs/<id>-tokens.css` scoped to `[data-design='<id>']`.
2. Generate it: `node scripts/build-design-css.mjs --design-spec src/design/<id>.spec.ts --out src/theme/designs/<id>.css`, and add the command to `design:css` and `design:check`.
3. Import the tokens and the stylesheet in `theme.css` after `classic.css` and before the colour presets, so a colour theme still overrides the design's accent, radius and typeface.
4. Add a `Design` to `src/design/design.ts` and to `DESIGNS`.
5. Run `node scripts/check-design-css.mjs --tailwind-from <an app that depends on Tailwind>`, which compiles every rule.

A UI kit adds its own slots the same way, with `--root <kit package>` and a spec that starts from the framework's `CLARITY_REPLACE`.

## Card fills

A colour theme names a fill (`ColorTheme.fill`): `plain`, `outline`, `raised`, `tint` or `lead`. The app writes it as `data-fill` on the document element; `theme/fills.css` draws it on `card` and `stat-card` under every design, and `lead` fills the tile a kit marks `data-emphasis="true"` with `--lead`.
