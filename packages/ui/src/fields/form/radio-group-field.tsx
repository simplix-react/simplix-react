import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import {
  radioGroupFieldDescriptionStyle,
  radioGroupFieldGroupStyle,
  radioGroupFieldLabelStyle,
  radioGroupFieldOptionStyle,
} from "./radio-group-field.style";

import { FieldWrapper } from "../shared/field-wrapper";


/** Props for the {@link RadioGroupField} form component. */
export interface RadioGroupFieldProps<T extends string = string>
  extends CommonFieldProps {
  /** Currently selected radio value. */
  value: T;
  /** Called when the selection changes. */
  onChange: (value: T) => void;
  /** Available radio options with label, value, and optional description. */
  options: Array<{ label: string; value: T; description?: string }>;
  /** Layout direction for the radio items. Defaults to `"column"`. */
  direction?: "column" | "row";
}

const directionClasses = {
  column: "flex flex-col",
  row: "flex flex-row",
} as const;

/**
 * Radio group field with support for option descriptions and horizontal/vertical layout.
 *
 * @example
 * ```tsx
 * <RadioGroupField
 *   label="Plan"
 *   value={plan}
 *   onChange={setPlan}
 *   options={[
 *     { label: "Free", value: "free", description: "Basic features" },
 *     { label: "Pro", value: "pro", description: "All features" },
 *   ]}
 * />
 * ```
 */
export function RadioGroupField<T extends string = string>({
  value,
  onChange,
  options,
  direction = "column",
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: RadioGroupFieldProps<T>) {
  const { RadioGroup, RadioGroupItem } = useFlatUIComponents();

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
      {({ labelId }) => (
        <RadioGroup
          value={value}
          onValueChange={(v) => onChange(v as T)}
          disabled={disabled}
          className={directionClasses[direction]}
          {...partAttributes(radioGroupFieldGroupStyle, { direction })}
          aria-labelledby={labelId}
          aria-label={variantProps.layout === "hidden" ? label : undefined}
        >
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center cursor-pointer"
              {...slotAttributes(radioGroupFieldOptionStyle, {})}
            >
              <RadioGroupItem value={opt.value} />
              <span {...slotAttributes(radioGroupFieldLabelStyle, {})}>
                {opt.label}
                {opt.description && (
                  <span className="block" {...slotAttributes(radioGroupFieldDescriptionStyle, {})}>
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          ))}
        </RadioGroup>
      )}
    </FieldWrapper>
  );
}
