import { parsePhoneNumberFromString } from "libphonenumber-js";

import { DetailField, type CommonDetailFieldProps } from "./detail-field";

/** Props for the detail {@link PhoneField}. */
export interface PhoneFieldProps extends CommonDetailFieldProps {
  value?: string | null;
}

/** Read-only phone number row, formatted internationally when parseable. */
export function PhoneField({ value, ...rest }: PhoneFieldProps) {
  const parsed = value ? parsePhoneNumberFromString(value) : undefined;
  return <DetailField {...rest}>{parsed ? parsed.formatInternational() : value}</DetailField>;
}
