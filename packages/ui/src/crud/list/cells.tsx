import { useMemo } from "react";

import { useCountryOptions } from "../../utils/use-country-options";
import { useLibphonenumber } from "../../utils/use-libphonenumber";

/**
 * Country cell — flag plus localized country name. Backs
 * `CrudList.Column display="country"` (ISO 3166-1 alpha-2 value).
 */
export function CountryCell({ value }: { value: string }) {
  const options = useCountryOptions();
  const option = useMemo(
    () => (value ? options.find((o) => o.code === value) : undefined),
    [options, value],
  );

  if (!value) return null;
  return option ? (
    <span className="inline-flex items-center gap-1.5">
      <option.Flag className="h-3 w-4.5 shrink-0 rounded-[1px]" />
      <span>{option.localName}</span>
    </span>
  ) : (
    <span>{value}</span>
  );
}

/**
 * Phone cell — flag plus the E.164 number formatted in its national convention
 * (international when the country is unknown). Backs
 * `CrudList.Column display="phone"`.
 */
export function PhoneCell({ value }: { value: string }) {
  const options = useCountryOptions();
  const lib = useLibphonenumber();
  const parsed = useMemo(
    () => (value && lib ? lib.parsePhoneNumberFromString(value) : undefined),
    [value, lib],
  );
  const option = useMemo(
    () => (parsed?.country ? options.find((o) => o.code === parsed.country) : undefined),
    [options, parsed],
  );

  if (!value) return null;
  return parsed ? (
    <span className="inline-flex items-center gap-1.5">
      {option && <option.Flag className="h-3 w-4.5 shrink-0 rounded-[1px]" />}
      <span className="tabular-nums">
        {option ? parsed.formatNational() : parsed.formatInternational()}
      </span>
    </span>
  ) : (
    <span>{value}</span>
  );
}
