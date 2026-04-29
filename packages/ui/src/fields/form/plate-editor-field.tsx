import type { Value } from "platejs";
import type { CommonFieldProps } from "../../crud/shared/types";
import { EMPTY_EDITOR_VALUE } from "../plate-editor/types";
import { PlateEditorBasic } from "../plate-editor/plate-editor-basic";
import { PlateEditorStandard } from "../plate-editor/plate-editor-standard";
import { PlateEditorAdvanced } from "../plate-editor/plate-editor-advanced";
import { FieldWrapper } from "../shared/field-wrapper";

export type PlateEditorVariant = "basic" | "standard" | "advanced";

const PRESET_BY_VARIANT = {
  basic: PlateEditorBasic,
  standard: PlateEditorStandard,
  advanced: PlateEditorAdvanced,
} as const;

export interface PlateEditorFieldProps extends CommonFieldProps {
  value: string;
  onChange: (value: string) => void;
  variant?: PlateEditorVariant;
  placeholder?: string;
  defaultHeight?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  resizable?: boolean;
}

export function PlateEditorField({
  value,
  onChange,
  variant = "standard",
  placeholder,
  defaultHeight,
  minHeight,
  maxHeight,
  resizable,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: PlateEditorFieldProps) {
  let plateValue: Value = EMPTY_EDITOR_VALUE;
  if (value) {
    try {
      plateValue = JSON.parse(value) as Value;
    } catch {
      plateValue = EMPTY_EDITOR_VALUE;
    }
  }

  const handleChange = (v: Value) => {
    onChange(JSON.stringify(v));
  };

  const PresetComponent = PRESET_BY_VARIANT[variant];

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      warning={warning}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      <PresetComponent
        value={plateValue}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={disabled}
        disabled={disabled}
        defaultHeight={defaultHeight}
        minHeight={minHeight}
        maxHeight={maxHeight}
        resizable={resizable}
      />
    </FieldWrapper>
  );
}
