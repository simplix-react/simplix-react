import { useMemo, useRef, useState } from "react";
import { AsYouType, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { Flex } from "../../primitives/flex";
import { cn } from "../../utils/cn";
import { useCountryOptions } from "../../utils/use-country-options";
import type { CountryOption } from "../../utils/use-country-options";
import { FieldWrapper } from "../shared/field-wrapper";

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

interface PhoneCountryOption extends CountryOption {
  callingCode: string;
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
 * International phone number field: a searchable country calling-code selector
 * (flag + dial code) paired with an as-you-type formatted national number
 * input. The emitted value is always E.164 (`+<code><number>`), so it round-trips
 * a server-side phone column unambiguously.
 */
export function PhoneField({
  value,
  onChange,
  defaultCountry,
  placeholder,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: PhoneFieldProps) {
  const { Popover, PopoverTrigger, PopoverContent, Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Input } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const countryOptions = useCountryOptions();
  const [open, setOpen] = useState(false);

  const options = useMemo<PhoneCountryOption[]>(
    () =>
      countryOptions.flatMap((option) => {
        const callingCode = callingCodeOf(option.code);
        return callingCode ? [{ ...option, callingCode }] : [];
      }),
    [countryOptions],
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
    setOpen(false);
    const digits = national.replace(/[^\d]/g, "");
    if (!digits) return;
    const formatter = new AsYouType(nextCountry);
    const formatted = formatter.input(digits);
    setNational(formatted);
    emit(formatter.getNumber()?.number ?? `+${getCountryCallingCode(nextCountry)}${digits}`);
  };

  const selected = country ? options.find((option) => option.code === country) : undefined;

  const filterFn = (itemValue: string, search: string) => {
    const option = options.find((o) => o.code === itemValue);
    if (!option) return 0;
    const haystack = `${option.code} ${option.localName} ${option.englishName} +${option.callingCode}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) ? 1 : 0;
  };

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      className={className}
      {...variantProps}
    >
      <Flex gap="xs" className="w-full min-w-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-sm",
                "hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring",
                disabled && "cursor-not-allowed opacity-50",
                error && "border-destructive",
                !selected && "text-muted-foreground",
              )}
              aria-label={t("field.selectCountry")}
            >
              {selected ? (
                <>
                  <selected.Flag className="h-3 w-4.5 shrink-0 rounded-[1px]" />
                  <span className="tabular-nums">+{selected.callingCode}</span>
                </>
              ) : (
                <span>+?</span>
              )}
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-50">
                <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.64245 3.00605 7.35753 3.00605 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command filter={filterFn}>
              <CommandInput placeholder={t("field.searchCountry")} className="h-8" />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>{t("filter.noResultsFound")}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.code}
                      value={option.code}
                      onSelect={() => handleCountrySelect(option.code)}
                    >
                      <option.Flag className="mr-2 h-3 w-4.5 shrink-0 rounded-[1px]" />
                      <span className="truncate">{option.localName}</span>
                      <span className="ml-auto pl-2 text-muted-foreground tabular-nums">+{option.callingCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          type="tel"
          value={national}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNationalChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("h-8 min-w-0 flex-1", error && "border-destructive")}
        />
      </Flex>
    </FieldWrapper>
  );
}
