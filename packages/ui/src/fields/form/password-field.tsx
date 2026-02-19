import { useState } from "react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link PasswordField} form component. */
export interface PasswordFieldProps extends CommonFieldProps {
  /** Current input value. */
  value: string;
  /** Called when the value changes. */
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** Additional props forwarded to the underlying input element. */
  inputProps?: React.ComponentProps<"input">;
}

/**
 * Password input field with visibility toggle button.
 *
 * @example
 * ```tsx
 * <PasswordField label="Password" value={password} onChange={setPassword} required />
 * ```
 */
export function PasswordField({
  value,
  onChange,
  placeholder,
  maxLength,
  inputProps,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: PasswordFieldProps) {
  const { Input } = useUIComponents();
  const [visible, setVisible] = useState(false);

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
      <span className="relative flex items-center">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-label={
            variantProps.labelPosition === "hidden" ? label : undefined
          }
          {...inputProps}
          className={cn(
            "pr-10",
            error && "border-destructive",
            inputProps?.className,
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            {visible ? (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="m2 2 20 20" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </span>
    </FieldWrapper>
  );
}
