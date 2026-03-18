import { type ComponentType, createElement } from "react";

import { cn } from "../utils/cn";

/**
 * Creates a wrapped version of a component with default props/className.
 *
 * Use with {@link createOverrides} to build override maps:
 * ```tsx
 * import { createOverrides, withOverride } from "@simplix-react/ui";
 *
 * const overrides = createOverrides((defaults) => ({
 *   Button: withOverride(defaults.Button, { className: "rounded-full" }),
 *   Input: withOverride(defaults.Input, { className: "h-12 text-lg" }),
 * }));
 * ```
 */
export function withOverride<P extends { className?: string }>(
  Component: ComponentType<P>,
  defaultProps: Partial<P>,
): ComponentType<P> {
  function Wrapped(props: P) {
    const className = (defaultProps.className != null || props.className != null)
      ? cn(defaultProps.className, props.className)
      : undefined;
    return createElement(Component, {
      ...defaultProps,
      ...props,
      ...(className !== undefined && { className }),
    } as P);
  }
  Wrapped.displayName = `withOverride(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
}
