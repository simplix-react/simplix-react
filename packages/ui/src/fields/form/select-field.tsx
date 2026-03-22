import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link SelectField} form component. */
export interface SelectFieldProps<T extends string = string>
  extends CommonFieldProps {
  /** Currently selected value. */
  value: T;
  /** Called when the selection changes. */
  onChange: (value: T) => void;
  /** Available options with label/value pairs. */
  options: Array<{ label: string; value: T; disabled?: boolean; icon?: React.ReactNode; tag?: string }>;
  placeholder?: string;
  /** Compact mode: renders without FieldWrapper, auto-width based on content. */
  compact?: boolean;
}

/**
 * Dropdown select field built on Radix Select primitives.
 *
 * @example
 * ```tsx
 * <SelectField
 *   label="Role"
 *   value={role}
 *   onChange={setRole}
 *   options={[
 *     { label: "Admin", value: "admin" },
 *     { label: "User", value: "user" },
 *   ]}
 * />
 *
 * // Compact mode (no label, auto-width, for table cells)
 * <SelectField
 *   compact
 *   value={scheduleId}
 *   onChange={setScheduleId}
 *   options={scheduleOptions}
 *   placeholder="Select..."
 * />
 * ```
 */
export function SelectField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  compact = false,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: SelectFieldProps<T>) {
  const { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } = useFlatUIComponents();

  const selectElement = (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as T)}
      disabled={disabled}
    >
      <SelectTrigger
        aria-invalid={!!error}
        aria-label={compact ? label ?? placeholder : variantProps.layout === "hidden" ? label : undefined}
        className={compact ? "h-8 text-sm" : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
          >
            {opt.icon || opt.tag ? (
              <span className="flex w-full items-center gap-1.5">
                {opt.icon}
                <span>{opt.label}</span>
                {opt.tag && (
                  <span className="ml-auto text-xs text-muted-foreground">{opt.tag}</span>
                )}
              </span>
            ) : (
              opt.label
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (compact) {
    return (
      <span className="inline-grid items-center">
        {/* Hidden native select: browser auto-sizes to longest option label */}
        <select
          className="invisible col-start-1 row-start-1 h-8 appearance-none border px-3 pr-8 text-sm"
          aria-hidden="true"
          tabIndex={-1}
        >
          {placeholder && <option>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="col-start-1 row-start-1">{selectElement}</span>
      </span>
    );
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
      {selectElement}
    </FieldWrapper>
  );
}
