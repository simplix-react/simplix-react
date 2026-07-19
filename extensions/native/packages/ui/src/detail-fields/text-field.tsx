import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link TextField}. */
export interface TextFieldProps extends CommonDetailFieldProps {
  value?: string | null;
}

/** Read-only text value row. */
export function TextField({ value, ...rest }: TextFieldProps) {
  return <DetailField {...rest}>{value}</DetailField>;
}
