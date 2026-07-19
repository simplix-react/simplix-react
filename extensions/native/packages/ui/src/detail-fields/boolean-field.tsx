import { BooleanBadge } from "../controls/boolean-badge";
import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link BooleanField}. */
export interface BooleanFieldProps extends CommonDetailFieldProps {
  value?: boolean | null;
  trueLabel?: string;
  falseLabel?: string;
}

/** Read-only boolean row rendered as a {@link BooleanBadge}. */
export function BooleanField({ value, trueLabel, falseLabel, ...rest }: BooleanFieldProps) {
  return (
    <DetailField {...rest}>
      {value == null ? null : (
        <BooleanBadge value={value} trueLabel={trueLabel} falseLabel={falseLabel} />
      )}
    </DetailField>
  );
}
