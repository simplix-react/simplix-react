import { useLocale, useTranslation } from "@simplix-react/i18n/react";
import {
  AsYouType,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";

import { ComboboxSheet } from "../inputs/combobox-sheet";
import { Input } from "../inputs/input";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";
import { COUNTRIES, countryDisplayName, countryFlagEmoji } from "./countries";
import { FieldWrapper } from "./field-wrapper";
import type { CommonFieldProps } from "./types";

/** Props for the {@link PhoneField} form component. */
export interface PhoneFieldProps extends CommonFieldProps {
  /** E.164 phone number (e.g. `"+821012345678"`), or an empty string. */
  value: string;
  /** Receives the E.164 number for the current input, or `""` when cleared. */
  onChange: (value: string) => void;
  /** ISO 3166-1 alpha-2 country preselected when the value carries no country. */
  defaultCountry?: string;
  placeholder?: string;
}

function callingCodeOf(code: string): string | undefined {
  try {
    return getCountryCallingCode(code as CountryCode);
  } catch {
    return undefined;
  }
}

/** Formats an E.164 value for display in its national convention. */
function toNational(value: string, country: CountryCode | undefined): string {
  const parsed = parsePhoneNumberFromString(value, country);
  if (parsed) return parsed.formatNational();
  return value.replace(/^\+\d*/, "");
}

/**
 * International phone number field: a calling-code selector sheet (flag +
 * dial code) paired with an as-you-type formatted national number input.
 * The emitted value is always E.164 (`+<code><number>`), matching the web
 * `PhoneField`, so it round-trips a server-side phone column unambiguously.
 */
export function PhoneField({
  value,
  onChange,
  defaultCountry,
  placeholder,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
}: PhoneFieldProps) {
  const locale = useLocale();
  const { t } = useTranslation("simplix/native");

  const options = useMemo(
    () =>
      COUNTRIES.flatMap((entry) => {
        const callingCode = callingCodeOf(entry.code);
        if (!callingCode) return [];
        const localName = countryDisplayName(entry.code, locale);
        return [{ entry, callingCode, localName }];
      })
        .sort((a, b) => a.localName.localeCompare(b.localName, locale))
        .map(({ entry, callingCode, localName }) => ({
          value: entry.code,
          label: `${countryFlagEmoji(entry.code)}  ${localName}`.trim(),
          description: `+${callingCode}`,
          searchText: `${localName} ${entry.name} ${entry.code} +${callingCode}`,
        })),
    [locale],
  );

  // Country and national text are derived from the incoming value once, then
  // owned locally while the user types; an external value change (form reset,
  // server refresh) re-derives both.
  const initialCountry = (): CountryCode | undefined => {
    const parsed = value ? parsePhoneNumberFromString(value) : undefined;
    if (parsed?.country) return parsed.country;
    if (defaultCountry && callingCodeOf(defaultCountry)) return defaultCountry as CountryCode;
    return undefined;
  };
  const [country, setCountry] = useState<CountryCode | undefined>(initialCountry);
  const [national, setNational] = useState(() => (value ? toNational(value, initialCountry()) : ""));
  const lastEmitted = useRef(value);

  if (value !== lastEmitted.current) {
    lastEmitted.current = value;
    const nextCountry = value ? (parsePhoneNumberFromString(value)?.country ?? country) : country;
    setCountry(nextCountry);
    setNational(value ? toNational(value, nextCountry) : "");
  }

  const emit = (next: string) => {
    lastEmitted.current = next;
    onChange(next);
  };

  const handleNationalChange = (text: string) => {
    if (!country) {
      setNational(text);
      emit(text.replace(/[^\d+]/g, ""));
      return;
    }
    const digits = text.replace(/[^\d]/g, "");
    if (!digits) {
      setNational("");
      emit("");
      return;
    }
    const formatter = new AsYouType(country);
    const formatted = formatter.input(digits);
    setNational(formatted);
    emit(formatter.getNumber()?.number ?? `+${getCountryCallingCode(country)}${digits}`);
  };

  const handleCountrySelect = (code: string) => {
    const nextCountry = code as CountryCode;
    setCountry(nextCountry);
    const digits = national.replace(/[^\d]/g, "");
    if (!digits) return;
    const formatter = new AsYouType(nextCountry);
    const formatted = formatter.input(digits);
    setNational(formatted);
    emit(formatter.getNumber()?.number ?? `+${getCountryCallingCode(nextCountry)}${digits}`);
  };

  const selectedCallingCode = country ? callingCodeOf(country) : undefined;

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
      <View className="w-full flex-row items-center gap-2">
        <ComboboxSheet
          value={country}
          onChange={handleCountrySelect}
          options={options}
          title={t("field.selectCountry")}
          renderTrigger={({ open }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("field.selectCountry")}
              disabled={disabled}
              onPress={open}
              className={cn(
                "h-11 flex-row items-center gap-1.5 rounded-md border border-input bg-background px-3",
                error && "border-destructive",
                disabled && "opacity-50",
              )}
            >
              {country && selectedCallingCode ? (
                <>
                  <Text size="base">{countryFlagEmoji(country)}</Text>
                  <Text size="base" className="tabular-nums">
                    +{selectedCallingCode}
                  </Text>
                </>
              ) : (
                <Text size="base" tone="muted">
                  +?
                </Text>
              )}
              <Text tone="muted">▾</Text>
            </Pressable>
          )}
        />
        <Input
          value={national}
          onChangeText={handleNationalChange}
          placeholder={placeholder}
          keyboardType="phone-pad"
          editable={!disabled}
          invalid={!!error}
          className="min-w-0 flex-1"
        />
      </View>
    </FieldWrapper>
  );
}
