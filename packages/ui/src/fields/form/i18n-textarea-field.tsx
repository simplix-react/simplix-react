import type { LocaleCode, LocaleConfig } from "@simplix-react/i18n";
import { type CSSProperties, useState } from "react";
import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";
import { getFilledLanguages } from "../shared/filled-languages";
import { LanguageInset } from "../shared/language-inset";
import { LanguageFillBar, LanguageSelector, type LanguageSelectorPlacement } from "../shared/language-selector";
import { useUIDefaults } from "../../provider/ui-defaults-context";
import { resizeClasses } from "../shared/textarea-utils";
import type { I18nValue } from "./i18n-text-field";

export interface I18nTextareaFieldProps extends CommonFieldProps {
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
  rows?: number;
  /** How the textarea resizes. Under the `inset` placement it does not, as the column takes its corner. */
  resize?: "none" | "vertical" | "both";
  textareaProps?: React.ComponentProps<"textarea">;
}

export function I18nTextareaField({
  value,
  onChange,
  languages,
  selectedLanguage,
  onLanguageChange,
  languageSelectorPlacement,
  placeholder,
  maxLength,
  rows,
  resize = "vertical",
  textareaProps,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: I18nTextareaFieldProps) {
  const { Textarea } = useFlatUIComponents();
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
      control="textarea"
    />
  ) : undefined;
  const insetSelector = placement === "inset" ? languageSelector : undefined;

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
      className={className}
      {...variantProps}
    >
      {({ id }) => {
        const renderControl = (reserve?: CSSProperties) => (
            <Textarea
              id={id}
              value={value?.[currentLang] ?? ""}
              onChange={(e) => onChange({ ...value, [currentLang]: e.target.value })}
              placeholder={currentPlaceholder}
              maxLength={maxLength}
              rows={rows}
              required={required}
              disabled={disabled}
              aria-invalid={!!error}
              aria-label={variantProps.layout === "hidden" ? label : undefined}
              {...textareaProps}
              style={reserve ? { ...textareaProps?.style, ...reserve } : textareaProps?.style}
              // The inset column takes the inline-end edge the resize grip sits on, so it keeps none.
              className={cn(resizeClasses[insetSelector ? "none" : resize], textareaProps?.className)}
            />
        );
        return insetSelector ? (
          <LanguageInset
            control="textarea"
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
