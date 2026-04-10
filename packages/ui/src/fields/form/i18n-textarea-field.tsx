import type { LocaleCode, LocaleConfig } from "@simplix-react/i18n";
import { useState } from "react";
import type { CommonFieldProps } from "../../crud/shared/types";
import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";
import { LanguageSelector } from "../shared/language-selector";
import { resizeClasses } from "../shared/textarea-utils";
import type { I18nValue } from "./i18n-text-field";

export interface I18nTextareaFieldProps extends CommonFieldProps {
  value: I18nValue;
  onChange: (value: I18nValue) => void;
  languages: LocaleConfig[];
  selectedLanguage?: LocaleCode;
  onLanguageChange?: (language: LocaleCode) => void;
  placeholder?: string | I18nValue;
  maxLength?: number;
  rows?: number;
  resize?: "none" | "vertical" | "both";
  textareaProps?: React.ComponentProps<"textarea">;
}

export function I18nTextareaField({
  value,
  onChange,
  languages,
  selectedLanguage,
  onLanguageChange,
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

  const filledLanguages = Object.entries(value ?? {})
    .filter(([, v]) => v?.trim())
    .map(([k]) => k);

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
    />
  ) : undefined;

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      labelExtra={languageSelector}
      error={error}
      warning={warning}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      <Textarea
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
        className={cn(
          resizeClasses[resize],
          error && "border-destructive",
          textareaProps?.className,
        )}
      />
    </FieldWrapper>
  );
}
