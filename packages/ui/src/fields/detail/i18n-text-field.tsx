import { useLocalizedText } from "@simplix-react/i18n/react";
import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { cn } from "../../utils/cn";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";
import { DetailTextField } from "./text-field";

export interface I18nTextProps {
  value: Record<string, string> | null | undefined;
  fallback?: string;
}

export function I18nText({ value, fallback = "—" }: I18nTextProps) {
  const localized = useLocalizedText();
  const text = localized(value);
  return <>{text || fallback}</>;
}

export interface DetailI18nTextFieldProps extends CommonDetailFieldProps {
  value: Record<string, string> | null | undefined;
  fallback?: string;
  copyable?: boolean;
}

export function DetailI18nTextField({ value, fallback, copyable, ...rest }: DetailI18nTextFieldProps) {
  const localized = useLocalizedText();
  const resolved = localized(value);
  return <DetailTextField {...rest} value={resolved} fallback={fallback} copyable={copyable} />;
}

export interface DetailI18nTextareaFieldProps extends CommonDetailFieldProps {
  value: Record<string, string> | null | undefined;
  fallback?: string;
}

export function DetailI18nTextareaField({ value, fallback = "—", label, labelKey, layout, size, className }: DetailI18nTextareaFieldProps) {
  const localized = useLocalizedText();
  const resolved = localized(value);
  const display = resolved || fallback;
  return (
    <DetailFieldWrapper label={label} labelKey={labelKey} layout={layout} size={size} className={className}>
      <span className={cn("whitespace-pre-wrap")}>{display}</span>
    </DetailFieldWrapper>
  );
}
