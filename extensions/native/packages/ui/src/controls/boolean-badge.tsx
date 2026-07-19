import { useTranslation } from "@simplix-react/i18n/react";

import { StatusBadge } from "./status-badge";

/** Props for the {@link BooleanBadge} component. */
export interface BooleanBadgeProps {
  value: boolean | null | undefined;
  /** Label for the `true` state. Defaults to the localized "Yes". */
  trueLabel?: string;
  /** Label for the `false` state. Defaults to the localized "No". */
  falseLabel?: string;
  className?: string;
}

/**
 * Boolean value badge: success tone for `true`, neutral tone for `false`.
 * Nullish values render the `false` presentation.
 */
export function BooleanBadge({ value, trueLabel, falseLabel, className }: BooleanBadgeProps) {
  const { t } = useTranslation("simplix/native");
  const isTrue = value === true;

  return (
    <StatusBadge tone={isTrue ? "success" : "neutral"} className={className}>
      {isTrue ? (trueLabel ?? t("common.yes")) : (falseLabel ?? t("common.no"))}
    </StatusBadge>
  );
}
