import type { LocaleCode, LocaleConfig } from "@simplix-react/i18n";
import type { Value } from "platejs";
import { useEffect, useState } from "react";
import type { CommonFieldProps } from "../../crud/shared/types";
import { EMPTY_EDITOR_VALUE } from "../plate-editor/types";
import { PlateEditorBasic } from "../plate-editor/plate-editor-basic";
import { PlateEditorStandard } from "../plate-editor/plate-editor-standard";
import { PlateEditorAdvanced } from "../plate-editor/plate-editor-advanced";
import { isPlateEditorEmpty, parsePlateI18nFromJson } from "../shared/plate-editor-helpers";
import { FieldWrapper } from "../shared/field-wrapper";
import { LanguageSelector } from "../shared/language-selector";
import type { PlateEditorVariant } from "./plate-editor-field";

const PRESET_BY_VARIANT = {
  basic: PlateEditorBasic,
  standard: PlateEditorStandard,
  advanced: PlateEditorAdvanced,
} as const;

export interface PlateEditorI18nFieldProps extends CommonFieldProps {
  value: Record<LocaleCode, string>;
  onChange: (value: Record<LocaleCode, string>) => void;
  languages: LocaleConfig[];
  selectedLanguage?: LocaleCode;
  onLanguageChange?: (language: LocaleCode) => void;
  variant?: PlateEditorVariant;
  placeholder?: string;
  defaultHeight?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  resizable?: boolean;
}

export function PlateEditorI18nField({
  value,
  onChange,
  languages,
  selectedLanguage,
  onLanguageChange,
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
}: PlateEditorI18nFieldProps) {
  const [internalLang, setInternalLang] = useState(languages[0]?.code);

  const currentLang = selectedLanguage ?? internalLang;
  const handleLangChange = onLanguageChange ?? setInternalLang;

  useEffect(() => {
    // process is not typed in browser bundles — access via globalThis to avoid @types/node dependency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeEnv = (globalThis as any).process?.env?.NODE_ENV as string | undefined;
    if (nodeEnv !== "production" && selectedLanguage && !onLanguageChange) {
      console.warn("PlateEditorI18nField: selectedLanguage provided without onLanguageChange — unsupported binding mode");
    }
  }, [selectedLanguage, onLanguageChange]);

  const languageCodes = languages.map((l) => l.code);
  const parsedMap = parsePlateI18nFromJson(value, languageCodes, EMPTY_EDITOR_VALUE);
  const filledLanguages = Object.entries(parsedMap)
    .filter(([, v]) => !isPlateEditorEmpty(v))
    .map(([k]) => k);

  const currentPlateValue: Value = parsedMap[currentLang] ?? EMPTY_EDITOR_VALUE;

  const handleChange = (v: Value) => {
    onChange({ ...value, [currentLang]: JSON.stringify(v) });
  };

  const languageSelector = languages.length > 1 ? (
    <LanguageSelector
      languages={languages}
      value={currentLang}
      onChange={handleLangChange}
      filledLanguages={filledLanguages}
      disabled={disabled}
    />
  ) : undefined;

  const PresetComponent = PRESET_BY_VARIANT[variant];

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
      <PresetComponent
        key={currentLang}
        value={currentPlateValue}
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
