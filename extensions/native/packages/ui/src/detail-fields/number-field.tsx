import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link NumberField}. */
export interface NumberFieldProps extends CommonDetailFieldProps {
  value?: number | null;
  /** Unit suffix (e.g. `"kg"`, `"%"`). */
  unit?: string;
  /** Custom formatter; defaults to the locale-neutral `String(value)`. */
  format?: (value: number) => string;
}

/** Read-only numeric value row with an optional unit suffix. */
export function NumberField({ value, unit, format, ...rest }: NumberFieldProps) {
  const display =
    value == null ? null : `${format ? format(value) : String(value)}${unit ? ` ${unit}` : ""}`;
  return <DetailField {...rest}>{display}</DetailField>;
}
