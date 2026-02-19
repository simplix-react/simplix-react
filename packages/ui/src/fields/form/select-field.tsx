import type { CommonFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link SelectField} form component. */
export interface SelectFieldProps<T extends string = string>
  extends CommonFieldProps {
  /** Currently selected value. */
  value: T;
  /** Called when the selection changes. */
  onChange: (value: T) => void;
  /** Available options with label/value pairs. */
  options: Array<{ label: string; value: T; disabled?: boolean }>;
  placeholder?: string;
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
 * ```
 */
export function SelectField<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: SelectFieldProps<T>) {
  const { Select } = useUIComponents();

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
      <Select.Root
        value={value}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
      >
        <Select.Trigger
          aria-invalid={!!error}
          aria-label={
            variantProps.labelPosition === "hidden" ? label : undefined
          }
        >
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content>
          {options.map((opt) => (
            <Select.Item
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </FieldWrapper>
  );
}
