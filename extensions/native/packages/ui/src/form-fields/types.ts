/**
 * Shared props for all mobile form field components — the same field contract
 * (naming, validation display, required marking) as the web `FormFields`.
 * Layout variants are intentionally absent: the mobile grammar stacks the
 * label above the input.
 */
export interface CommonFieldProps {
  label?: string;
  /** i18n key rendered when `label` is absent. */
  labelKey?: string;
  /** Error message displayed below the field (highest priority). */
  error?: string;
  /** Warning message displayed below the field (shown when no error). */
  warning?: string;
  /** Help text displayed below the field. */
  description?: string;
  /** Whether the field is required (shows asterisk). */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  className?: string;
}
