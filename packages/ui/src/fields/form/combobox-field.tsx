import { useTranslation } from "@simplix-react/i18n/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { FieldChevron } from "../../base/inputs/field-chevron";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { Stack } from "../../primitives";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link ComboboxField} form component. */
export interface ComboboxFieldProps<T extends string = string>
  extends CommonFieldProps {
  value: T | null;
  onChange: (value: T | null) => void;
  options: Array<{ label: string; value: T; icon?: React.ReactNode }>;
  onSearch?: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  /** When true, options are rendered as-is from the server — local filtering is skipped. */
  serverSearch?: boolean;
  /** When set, an expand button renders in the trigger (e.g. to open a full search dialog). */
  onExpand?: () => void;
  /** Rendered below the option list (e.g. a "more results" hint). */
  footer?: React.ReactNode;
}

/**
 * Searchable dropdown field with popover-based filtering.
 * Trigger displays selected value as text; search input is inside the popover.
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
  placeholder,
  emptyMessage,
  serverSearch,
  onExpand,
  footer,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: ComboboxFieldProps<T>) {
  const { Input, Popover, PopoverTrigger, PopoverContent } = useFlatUIComponents();
  const { t } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selectPlaceholder = placeholder ?? t("field.selectOption");
  const searchPlaceholder = t("field.searchOption");
  const noResultsMessage = emptyMessage ?? t("field.noResults");

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    if (serverSearch) return options;
    if (!query) return options;
    const lower = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, query, serverSearch]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);
      onSearch?.(q);
    },
    [onSearch],
  );

  function handleSelect(optValue: T) {
    onChange(optValue);
    setQuery("");
    setOpen(false);
  }

  // Keep the keyboard highlight on a real row as the visible set changes
  // (typing, async server results, reopening).
  useEffect(() => {
    setHighlighted(0);
  }, [query, options, open]);

  // Keep the highlighted row visible while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-highlighted="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (filtered.length === 0) return;
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setHighlighted((prev) => (prev + delta + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        // Always swallow Enter — the field lives inside forms and must never submit them.
        e.preventDefault();
        const option = filtered[highlighted];
        if (option) handleSelect(option.value);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, highlighted],
  );

  function handleClear() {
    onChange(null);
    setQuery("");
    if (serverSearch) onSearch?.("");
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
      <Popover
        open={open}
        onOpenChange={(v) => {
          if (disabled) return;
          setOpen(v);
          if (!v) {
            setQuery("");
            // Server-search callers hold the query externally — reset it too so a
            // re-open starts from the default result set, matching the empty input.
            if (serverSearch) onSearch?.("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <span
            className={cn(
              "flex h-8 w-full items-center gap-1 rounded-md border border-input bg-background px-3 text-sm",
              "focus-within:border-foreground",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive focus-within:border-destructive",
            )}
          >
            <span className={cn("flex flex-1 items-center gap-1.5 truncate", !value && "text-muted-foreground")}>
              {selectedOption?.icon}
              {value ? selectedOption?.label ?? "" : selectPlaceholder}
            </span>
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
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
            {onExpand && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                aria-label={t("field.expandSearch")}
                title={t("field.expandSearch")}
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
                    d="M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <FieldChevron />
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Stack gap="none" className="p-2">
            <Input
              type="search"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={searchPlaceholder}
              className="mb-2"
              autoFocus
              aria-controls={listboxId}
              aria-activedescendant={filtered.length > 0 ? `${listboxId}-${highlighted}` : undefined}
            />
            <ul className="max-h-60 overflow-y-auto" role="listbox" id={listboxId} ref={listRef}>
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
                  {noResultsMessage}
                </li>
              )}
              {!loading &&
                filtered.map((opt, index) => (
                  <li
                    key={opt.value}
                    id={`${listboxId}-${index}`}
                    role="option"
                    aria-selected={opt.value === value}
                    data-highlighted={index === highlighted || undefined}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      // The accent background marks the CURSOR only; the selected
                      // option is indicated by the trailing check + weight, so the
                      // two states stay distinguishable while arrowing around.
                      index === highlighted && "bg-accent text-accent-foreground",
                      opt.value === value && "font-medium",
                    )}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlighted(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelect(opt.value);
                      }
                    }}
                  >
                    <span className="flex flex-1 items-center gap-1.5 truncate">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {/* Trailing check keeps every row's icon/label aligned to the same left edge. */}
                    {opt.value === value && (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-4 w-4 shrink-0"
                      >
                        <path
                          d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </li>
                ))}
            </ul>
            {footer}
          </Stack>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
