import type { ReactNode } from "react";

import { EmptyValueBadge } from "../../base/display/empty-value-badge";

/**
 * Resolves the empty rendering of a `DetailFields.*` component: an explicitly
 * passed `fallback` string wins; otherwise the shared {@link EmptyValueBadge}
 * marks the missing value.
 */
export function detailFallback(fallback: string | undefined): ReactNode {
  return fallback !== undefined ? <span>{fallback}</span> : <EmptyValueBadge />;
}
