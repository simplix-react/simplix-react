import { useState } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../base/popover";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link DateField} form component. */
export interface DateFieldProps extends CommonFieldProps {
  /** Currently selected date, or `null` when no date is selected. */
  value: Date | null;
  /** Called when the date selection changes. */
  onChange: (value: Date | null) => void;
  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /** Date format string (reserved for future use). */
  format?: string;
  /** Placeholder text when no date is selected. */
  placeholder?: string;
}

function formatDate(date: Date, _format?: string): string {
  // Use locale date string by default
  return date.toLocaleDateString();
}

/**
 * Date picker field with calendar popover.
 *
 * @example
 * ```tsx
 * <DateField
 *   label="Birth Date"
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   maxDate={new Date()}
 * />
 * ```
 */
export function DateField({
  value,
  onChange,
  minDate,
  maxDate,
  format,
  placeholder = "Pick a date",
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: DateFieldProps) {
  const { Calendar } = useUIComponents();
  const [open, setOpen] = useState(false);

  function handleSelect(date: Date) {
    onChange(date);
    setOpen(false);
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
          <button
            type="button"
            disabled={disabled}
            aria-invalid={!!error}
            aria-label={
              variantProps.labelPosition === "hidden" ? label : undefined
            }
            className={cn(
              "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            {value ? formatDate(value, format) : placeholder}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            selected={value ?? undefined}
            onSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
