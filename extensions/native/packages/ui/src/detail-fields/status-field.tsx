import { StatusBadge } from "../controls/status-badge";
import type { StatusTone } from "../controls/status-tone";
import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link StatusField}. */
export interface StatusFieldProps extends CommonDetailFieldProps {
  /** Resolved status label (e.g. a boot-enum label). */
  value?: string | null;
  /** Semantic status tone. */
  tone: StatusTone;
  outline?: boolean;
}

/** Read-only status row rendered as a {@link StatusBadge}. */
export function StatusField({ value, tone, outline, ...rest }: StatusFieldProps) {
  return (
    <DetailField {...rest}>
      {value ? (
        <StatusBadge tone={tone} outline={outline}>
          {value}
        </StatusBadge>
      ) : null}
    </DetailField>
  );
}
