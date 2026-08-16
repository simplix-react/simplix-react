import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
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
  /**
   * Compact mode: renders without FieldWrapper, and sizes itself to its longest option label
   * using a hidden native `<select>`. That measurement also means `className` never reaches the
   * rendered element — pass `fill` when the parent has to own the width.
   */
  compact?: boolean;
  /**
   * Compact mode only: give the width back to the parent. The hidden measuring `<select>` is
   * dropped, the field fills its container, and `className` lands on the wrapper — so a grid or
   * flex cell can size the field instead of the option list doing it. No effect without `compact`;
   * the non-compact path already passes `className` to the wrapper.
   */
  fill?: boolean;
}

/**
 * Dropdown select field built on Radix Select primitives.
 *
 * @remarks
 * Two widths, and which one applies is decided by `compact`. The default (non-compact) field
 * renders inside `FieldWrapper` and takes the width its container gives it, with `className`
 * reaching that wrapper. `compact` instead measures itself against its longest option label —
 * a hidden native `<select>` carrying every label does the measuring, so the field is as wide
 * as its widest option and `className` is dropped on the floor. Pass `fill` alongside `compact`
 * to take that measurement out and let the parent set the width.
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
 *
 * // Compact mode whose width the parent owns (a grid cell, a flex row)
 * <SelectField
 *   compact
 *   fill
 *   className="min-w-0"
 *   value={areaId}
 *   onChange={setAreaId}
 *   options={areaOptions}
 * />
 * ```
 */
export function SelectField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  compact = false,
  fill = false,
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

  // `id` lands on the trigger button — the labelable element the wrapper's
  // label points at. Compact mode has no wrapper and so no id.
  const renderSelect = (id?: string) => (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as T)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
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

  if (compact && fill) {
    // No measuring select: the trigger is `w-full`, so the width is whatever the parent gives.
    return <span className={cn("block w-full", className)}>{renderSelect()}</span>;
  }

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
        <span className="col-start-1 row-start-1">{renderSelect()}</span>
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
      {({ id }) => renderSelect(id)}
    </FieldWrapper>
  );
}
