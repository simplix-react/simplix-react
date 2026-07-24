import { type ComponentRef, type ReactElement, forwardRef, lazy, Suspense } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import type { IconName } from "lucide-react/dynamic";

/** Props for the {@link DynamicIconLazy} component. */
export interface DynamicIconLazyProps extends Omit<LucideProps, "ref"> {
  /** Lucide icon name in kebab-case (e.g. "folder", "user-circle"). */
  name: IconName;
  /** Rendered while the glyph loads or when the name cannot be resolved (lucide pass-through). */
  fallback?: () => ReactElement | null;
}

const LazyInner = lazy(() =>
  import("lucide-react/dynamic").then((m) => ({ default: m.DynamicIcon })),
);

/**
 * Name-based lucide icon that defers the dynamic icon registry.
 *
 * `lucide-react/dynamic` ships a full-catalog import map, so a static import
 * anywhere in an eagerly-loaded module drags the whole registry into the
 * initial bundle. Every name-based icon render in the framework goes through
 * this wrapper instead — the registry (and the glyph) loads on first mount.
 */
export const DynamicIconLazy = forwardRef<ComponentRef<LucideIcon>, DynamicIconLazyProps>(
  ({ name, ...props }, ref) => (
    <Suspense fallback={null}>
      <LazyInner name={name} {...props} ref={ref} />
    </Suspense>
  ),
);
DynamicIconLazy.displayName = "DynamicIconLazy";

export type { IconName };
