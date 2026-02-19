import { useCallback, useMemo, useRef, useState } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../base/popover";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link ComboboxField} form component. */
export interface ComboboxFieldProps<T extends string = string>
  extends CommonFieldProps {
  value: T | null;
  onChange: (value: T | null) => void;
  options: Array<{ label: string; value: T }>;
  onSearch?: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  emptyMessage?: string;
}

/**
 * Searchable dropdown field with type-ahead filtering.
 * Supports async search via onSearch callback and loading state.
 *
 * @example
 * ```tsx
 * <ComboboxField
 *   label="Country"
 *   value={country}
 *   onChange={setCountry}
 *   options={countries}
 *   onSearch={searchCountries}
 *   loading={isSearching}
 * />
 * ```
 */
export function ComboboxField<T extends string = string>({
  value,
  onChange,
  options,
  onSearch,
  loading = false,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: ComboboxFieldProps<T>) {
  const { Input } = useUIComponents();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!query) return options;
    const lower = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, query]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);
      onSearch?.(q);
      if (!open) setOpen(true);
    },
    [onSearch, open],
  );

  function handleSelect(optValue: T) {
    onChange(optValue);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span
            className={cn(
              "relative flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive",
            )}
          >
            <Input
              ref={inputRef}
              value={open ? query : selectedLabel}
              onChange={handleInputChange}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!error}
              aria-label={
                variantProps.labelPosition === "hidden" ? label : undefined
              }
              className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                aria-label="Clear selection"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                >
                  <path
                    d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ul className="max-h-60 overflow-y-auto p-1" role="listbox">
            {loading && (
              <li className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading...
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            )}
            {!loading &&
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    opt.value === value && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => handleSelect(opt.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelect(opt.value);
                    }
                  }}
                >
                  {opt.value === value && (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                    >
                      <path
                        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className={cn(opt.value === value && "ml-0")}>
                    {opt.label}
                  </span>
                </li>
              ))}
          </ul>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
