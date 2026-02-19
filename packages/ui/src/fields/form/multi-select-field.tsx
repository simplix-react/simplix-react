import { useMemo, useRef, useState } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../base/popover";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link MultiSelectField} form component. */
export interface MultiSelectFieldProps<T extends string = string>
  extends CommonFieldProps {
  /** Currently selected values. */
  value: T[];
  /** Called when the selection changes. */
  onChange: (value: T[]) => void;
  /** Available options with label/value pairs. */
  options: Array<{ label: string; value: T }>;
  placeholder?: string;
  /** Maximum number of selections allowed. */
  maxCount?: number;
}

/**
 * Multi-select dropdown field with badge chips and search filtering.
 *
 * @example
 * ```tsx
 * <MultiSelectField
 *   label="Tags"
 *   value={tags}
 *   onChange={setTags}
 *   options={[
 *     { label: "React", value: "react" },
 *     { label: "Vue", value: "vue" },
 *     { label: "Angular", value: "angular" },
 *   ]}
 * />
 * ```
 */
export function MultiSelectField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  maxCount,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: MultiSelectFieldProps<T>) {
  const { Badge, Input } = useUIComponents();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query) return options;
    const lower = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, query]);

  const selectedLabels = useMemo(() => {
    const valueSet = new Set(value);
    return options.filter((o) => valueSet.has(o.value));
  }, [options, value]);

  function toggleOption(optValue: T) {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      if (maxCount != null && value.length >= maxCount) return;
      onChange([...value, optValue]);
    }
  }

  function removeOption(optValue: T) {
    onChange(value.filter((v) => v !== optValue));
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
              "relative flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50",
              error && "border-destructive",
            )}
            role="combobox"
            aria-expanded={open}
            aria-label={
              variantProps.labelPosition === "hidden" ? label : undefined
            }
          >
            {selectedLabels.map((opt) => (
              <Badge
                key={opt.value}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {opt.label}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(opt.value);
                    }}
                    className="ml-0.5 rounded-sm hover:bg-muted"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <svg
                      width="14"
                      height="14"
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
              </Badge>
            ))}
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder={value.length === 0 ? placeholder : ""}
              disabled={disabled}
              className="h-auto min-w-[60px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ul className="max-h-60 overflow-y-auto p-1" role="listbox">
            {filtered.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">
                No results found.
              </li>
            )}
            {filtered.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    selected && "bg-accent/50",
                  )}
                  onClick={() => toggleOption(opt.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleOption(opt.value);
                    }
                  }}
                >
                  <span
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50",
                    )}
                  >
                    {selected && (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                      >
                        <path
                          d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
