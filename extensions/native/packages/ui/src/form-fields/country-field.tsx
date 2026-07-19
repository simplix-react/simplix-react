import { useLocale } from "@simplix-react/i18n/react";
import { useMemo } from "react";

import { ComboboxSheet } from "../inputs/combobox-sheet";
import { COUNTRIES, countryDisplayName } from "./countries";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link CountryField} form component. */
export interface CountryFieldProps extends CommonFieldProps {
  /** ISO 3166-1 alpha-2 code. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Country picker over a search sheet. Names localize via `Intl.DisplayNames`
 * when the runtime provides it, falling back to bundled English names.
 */
export function CountryField({
  value,
  onChange,
  placeholder,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: CountryFieldProps) {
  const locale = useLocale();

  const options = useMemo(
    () =>
      COUNTRIES.map((entry) => ({
        value: entry.code,
        label: countryDisplayName(entry.code, locale),
        description: `${entry.code} · +${entry.callingCode}`,
      })).sort((a, b) => a.label.localeCompare(b.label)),
    [locale],
  );

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      warning={warning}
      description={description}
      required={required}
      className={className}
    >
      <ComboboxSheet
        value={value || undefined}
        onChange={onChange}
        options={options}
        title={label}
        placeholder={placeholder}
        disabled={disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
