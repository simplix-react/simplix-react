import { useLocale, useTranslation } from "@simplix-react/i18n/react";
import { useMemo } from "react";

import { ComboboxSheet } from "../inputs/combobox-sheet";
import { COUNTRIES, countryDisplayName, countryFlagEmoji } from "./countries";
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
 * Country picker over a search sheet: flag + localized name rows, searchable
 * by localized name, English name, ISO code, and calling code. Names resolve
 * via `Intl.DisplayNames` when available, then the bundled CLDR names.
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
  const { t } = useTranslation("simplix/native");

  const options = useMemo(
    () =>
      COUNTRIES.map((entry) => ({
        entry,
        localName: countryDisplayName(entry.code, locale),
      }))
        .sort((a, b) => a.localName.localeCompare(b.localName, locale))
        .map(({ entry, localName }) => ({
          value: entry.code,
          label: `${countryFlagEmoji(entry.code)}  ${localName}`.trim(),
          description: `${entry.code} · +${entry.callingCode}`,
          searchText: `${localName} ${entry.name} ${entry.code} +${entry.callingCode}`,
        })),
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
        title={label ?? t("field.selectCountry")}
        placeholder={placeholder ?? t("field.selectCountry")}
        disabled={disabled}
        invalid={!!error}
      />
    </FieldWrapper>
  );
}
