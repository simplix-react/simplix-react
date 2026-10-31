import type { LocaleCode, LocaleConfig } from "@simplix-react/i18n";
import { type CSSProperties, useState, type ReactNode } from "react";
import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { FieldWrapper } from "../shared/field-wrapper";
import { getFilledLanguages } from "../shared/filled-languages";
import { LanguageInset } from "../shared/language-inset";
import { LanguageFillBar, LanguageSelector, type LanguageSelectorPlacement } from "../shared/language-selector";
import { useUIDefaults } from "../../provider/ui-defaults-context";
import { InlineIconPickerTrigger } from "../shared/inline-icon-picker-trigger";
import { ColorPicker } from "../../base/inputs/color-picker";

export type I18nValue = Record<LocaleCode, string>;

export interface I18nTextFieldProps extends CommonFieldProps {
  value: I18nValue;
  onChange: (value: I18nValue) => void;
  languages: LocaleConfig[];
  selectedLanguage?: LocaleCode;
  onLanguageChange?: (language: LocaleCode) => void;
  /**
   * Where the language selector is drawn. Omitted, the installation's choice applies
   * (`UIProvider` `defaults.languageSelectorPlacement`, `"label"` unless set).
   */
  languageSelectorPlacement?: LanguageSelectorPlacement;
  placeholder?: string | I18nValue;
  maxLength?: number;
  type?: "text" | "email" | "url" | "tel";
  inputProps?: React.ComponentProps<"input">;
  /**
   * Control rendered on the leading side of the input (same row).
   * Takes precedence over {@link I18nTextFieldProps.iconValue}.
   */
  prefixControl?: ReactNode;
  /** Control rendered on the trailing side of the input (same row). */
  suffixControl?: ReactNode;
  /** Convenience: current icon name. When provided, an IconPicker is rendered as prefixControl. */
  iconValue?: string;
  /** Convenience: called when the icon changes. */
  onIconChange?: (value: string) => void;
  /** Convenience: current color (hex). When provided, a ColorPicker is rendered as suffixControl. */
  colorValue?: string;
  /** Convenience: called when the color changes. */
  onColorChange?: (value: string) => void;
}

export function I18nTextField({
  value,
  onChange,
  languages,
  selectedLanguage,
  onLanguageChange,
  languageSelectorPlacement,
  placeholder,
  maxLength,
  type = "text",
  inputProps,
  prefixControl,
  suffixControl,
  iconValue,
  onIconChange,
  colorValue,
  onColorChange,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: I18nTextFieldProps) {
  const { Input } = useFlatUIComponents();
  // Binding contract: selectedLanguage + onLanguageChange form a controlled pair.
  // (1) Both omitted = uncontrolled. (2) Both provided = controlled.
  // (3) onLanguageChange only = observer. selectedLanguage without onLanguageChange is not supported.
  const [internalLang, setInternalLang] = useState(languages[0]?.code);

  const currentLang = selectedLanguage ?? internalLang;
  const handleLangChange = onLanguageChange ?? setInternalLang;

  const uiDefaults = useUIDefaults();
  const placement = languageSelectorPlacement ?? uiDefaults.languageSelectorPlacement;

  const filledLanguages = getFilledLanguages(value);

  // Per-locale placeholder: undefined when key absent (no placeholder shown for that locale).
  const currentPlaceholder =
    typeof placeholder === "object" ? placeholder[currentLang] : placeholder;

  const languageSelector = languages.length > 1 ? (
    <LanguageSelector
      languages={languages}
      value={currentLang}
      onChange={handleLangChange}
      filledLanguages={filledLanguages}
      disabled={disabled}
      placement={placement}
      control="input"
    />
  ) : undefined;
  const insetSelector = placement === "inset" ? languageSelector : undefined;

  const resolvedPrefix = prefixControl ?? (onIconChange ? (
    <InlineIconPickerTrigger value={iconValue} onChange={onIconChange} disabled={disabled} />
  ) : undefined);
  const resolvedSuffix = suffixControl ?? (onColorChange ? (
    <ColorPicker value={colorValue ?? ""} onChange={onColorChange} disabled={disabled} />
  ) : undefined);

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      labelExtra={placement === "label" ? languageSelector : undefined}
      error={error}
      warning={warning}
      description={description}
      required={required}
      disabled={disabled}
      prefixControl={resolvedPrefix}
      suffixControl={resolvedSuffix}
      className={className}
      {...variantProps}
    >
      {({ id }) => {
        const renderControl = (reserve?: CSSProperties) => (
            <Input
              id={id}
              type={type}
              value={value?.[currentLang] ?? ""}
              onChange={(e) => onChange({ ...value, [currentLang]: e.target.value })}
              placeholder={currentPlaceholder}
              maxLength={maxLength}
              required={required}
              disabled={disabled}
              aria-invalid={!!error}
              aria-label={variantProps.layout === "hidden" ? label : undefined}
              {...inputProps}
              style={reserve ? { ...inputProps?.style, ...reserve } : inputProps?.style}
              className={inputProps?.className}
            />
        );
        return insetSelector ? (
          <LanguageInset
            control="input"
            selector={insetSelector}
            bar={<LanguageFillBar languages={languages} value={currentLang} filledLanguages={filledLanguages} />}
          >
            {renderControl}
          </LanguageInset>
        ) : (
          renderControl()
        );
      }}
    </FieldWrapper>
  );
}
