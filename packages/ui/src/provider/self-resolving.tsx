import { type ComponentType, createElement, forwardRef, useContext } from "react";

import { UIComponentContext } from "./ui-component-context";
import type { UIComponents } from "./types";

/**
 * Wraps a base component so that static imports honor `UIProvider` overrides.
 *
 * The returned component reads the override for `key` from the nearest
 * {@link UIComponentContext} and renders it; when no override is present it
 * falls back to `Base`. Because `Base` is the raw `*Base` implementation (it
 * never reads the context itself) and {@link createOverrides} hands the same
 * `*Base` to override factories, an override produced by `withOverride(Base)`
 * renders `Base` directly — the self-resolving loop is structurally
 * impossible without any identity guard.
 *
 * Only leaf / primitive keys are passed here. Compound sub-components are
 * resolved exclusively through `useFlatUIComponents()` (hook path) and must
 * not be statically imported outside their owning file.
 */
export function createSelfResolving<P extends object>(
  key: keyof UIComponents,
  Base: ComponentType<P>,
): ComponentType<P> {
  const Resolved = forwardRef<unknown, P>((props, ref) => {
    const ctx = useContext(UIComponentContext);
    // Leaf keys map to a ComponentType override (never a compound group here).
    const Override = ctx[key] as ComponentType<P> | undefined;
    const Comp = Override ?? Base;
    return createElement(Comp, { ...props, ref } as P);
  });
  Resolved.displayName = typeof key === "string" ? key : "SelfResolving";
  return Resolved as unknown as ComponentType<P>;
}
