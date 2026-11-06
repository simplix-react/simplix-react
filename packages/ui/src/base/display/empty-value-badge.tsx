import { useTranslation } from "@simplix-react/i18n/react";

import { Badge } from "./badge";

/** Props for the {@link EmptyValueBadge} component. */
export interface EmptyValueBadgeProps {
  /** Label override; defaults to the framework-translated "No value" text. */
  label?: string;
  className?: string;
}

/**
 * Muted dashed-outline badge that explicitly marks a missing value, so a
 * blank field reads as "no value" rather than a rendering error. Every
 * `DetailFields.*` component renders it as the default empty fallback; use it
 * directly in custom detail-style displays that bypass `DetailFields.*`. For
 * table cells and other compact non-field contexts, use {@link EmptyValue}
 * (a hyphen) instead.
 *
 * @example
 * ```tsx
 * {provider ? <ProviderSummary provider={provider} /> : <EmptyValueBadge />}
 * ```
 */
export function EmptyValueBadge({ label, className }: EmptyValueBadgeProps) {
  const { t } = useTranslation("simplix/ui");

  return (
    <Badge
      variant="outline"
      data-testid="empty-value-badge"
      empty
      className={className}
    >
      {label ?? t("field.noValue")}
    </Badge>
  );
}
