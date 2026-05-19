import type { CommonFieldProps } from "../../crud/shared/types";
import { IconPicker } from "../../base/inputs";
import type { IconData, IconName } from "../../base/inputs";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link IconField} form component. */
export interface IconFieldProps extends CommonFieldProps {
  /** Currently selected icon name (kebab-case, e.g. `"folder"`). Controlled. */
  value: string;
  /** Called when the selected icon changes. Pass `""` to clear. */
  onChange: (value: string) => void;
  /** Show categorized icon browser instead of a random 100 sample. @defaultValue true */
  categorized?: boolean;
  /** Custom icon list to display instead of the built-in catalog. */
  iconsList?: IconData[];
  /** Placeholder text shown on the trigger button when no icon is selected. */
  triggerPlaceholder?: string;
  /** Whether the Popover renders in a portal (modal mode). @defaultValue false */
  modal?: boolean;
  /** BCP-47 locale tag for the icon picker UI (e.g. `"ko-KR"`). Defaults to `navigator.language`. */
  lang?: string;
}

/**
 * Icon picker field integrating {@link IconPicker} with {@link FieldWrapper} for
 * label, description, error, and required-marker support.
 *
 * @example
 * ```tsx
 * <IconField label="Icon" value={icon} onChange={setIcon} />
 * ```
 */
export function IconField({
  value,
  onChange,
  categorized,
  iconsList,
  triggerPlaceholder,
  modal,
  lang,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: IconFieldProps) {
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
      <IconPicker
        value={value as IconName}
        onChange={onChange}
        categorized={categorized}
        iconsList={iconsList}
        triggerPlaceholder={triggerPlaceholder}
        modal={modal}
        lang={lang}
        disabled={disabled}
        aria-label={variantProps.layout === "hidden" ? label : undefined}
      />
    </FieldWrapper>
  );
}
