import { Badge, type BadgeVariants } from "../controls/badge";
import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link BadgeField}. */
export interface BadgeFieldProps extends CommonDetailFieldProps {
  value?: string | null;
  variant?: BadgeVariants["variant"];
}

/** Read-only categorical value rendered as a {@link Badge}. */
export function BadgeField({ value, variant = "secondary", ...rest }: BadgeFieldProps) {
  return (
    <DetailField {...rest}>
      {value ? <Badge variant={variant}>{value}</Badge> : null}
    </DetailField>
  );
}
