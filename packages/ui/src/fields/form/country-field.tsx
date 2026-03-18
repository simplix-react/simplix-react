import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { MapPinIcon } from "../../crud/shared/icons";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { Flex } from "../../primitives/flex";
import { cn } from "../../utils/cn";
import { countryFromTimezone } from "../../utils/timezone-country-map";
import { useCountryOptions } from "../../utils/use-country-options";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link CountryField} form component. */
export interface CountryFieldProps extends CommonFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Country selector field with flag icons and localized names.
 * Supports search by country code, localized name, and English name.
 */
export function CountryField({
  value,
  onChange,
  placeholder,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: CountryFieldProps) {
  const { Popover, PopoverTrigger, PopoverContent, Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const options = useCountryOptions();
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((o) => o.code === value),
    [options, value],
  );

  const filterFn = useCallback(
    (itemValue: string, search: string): number => {
      const lower = search.toLowerCase();
      const option = options.find((o) => o.code === itemValue);
      if (!option) return 0;
      if (option.code.toLowerCase().includes(lower)) return 1;
      if (option.localName.toLowerCase().includes(lower)) return 1;
      if (option.englishName.toLowerCase().includes(lower)) return 1;
      return 0;
    },
    [options],
  );

  function handleSelect(code: string) {
    onChange(value === code ? "" : code);
    setOpen(false);
  }

  function handleClear() {
    onChange("");
    setOpen(false);
  }

  function handleDetect() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const country = countryFromTimezone(tz);
      if (country) {
        onChange(country);
      }
    } catch {
      // detection not supported
    }
  }

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      <Flex gap="xs" align="center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "flex h-8 w-full min-w-0 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 text-sm",
                "hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring",
                disabled && "cursor-not-allowed opacity-50",
                error && "border-destructive",
                !value && "text-muted-foreground",
              )}
            >
              {selectedOption ? (
                <span className="flex items-center gap-2 truncate">
                  <selectedOption.Flag className="h-3 w-4.5 shrink-0 rounded-[1px]" />
                  <span className="truncate">{selectedOption.localName}</span>
                </span>
              ) : (
                <span>{placeholder ?? t("field.selectCountry")}</span>
              )}
              <span className="flex shrink-0 items-center gap-1">
                {value && !disabled && (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        handleClear();
                      }
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                    aria-label={t("field.clear")}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                      <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-50">
                  <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.64245 3.00605 7.35753 3.00605 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command filter={filterFn}>
              <CommandInput placeholder={placeholder ?? t("field.searchCountry")} className="h-8" />
              <CommandList className="max-h-[200px]">
                <CommandEmpty>{t("filter.noResultsFound")}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.code}
                      value={option.code}
                      onSelect={() => handleSelect(option.code)}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn("mr-2 h-4 w-4", value === option.code ? "opacity-100" : "opacity-0")}
                      >
                        <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                      <option.Flag className="mr-2 h-3 w-4.5 shrink-0 rounded-[1px]" />
                      <span className="truncate">{option.localName}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {!disabled && (
          <button
            type="button"
            onClick={handleDetect}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={t("field.detectCountry")}
          >
            <MapPinIcon className="h-4 w-4" />
          </button>
        )}
      </Flex>
    </FieldWrapper>
  );
}
