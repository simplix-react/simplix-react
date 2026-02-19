import { useCallback, useState } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { cn } from "../../utils/cn";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailTextField} component. */
export interface DetailTextFieldProps extends CommonDetailFieldProps {
  /** Text value to display. */
  value: string | null | undefined;
  /** Fallback text when value is null/undefined. Defaults to em-dash. */
  fallback?: string;
  /** Whether to show a copy-to-clipboard button. */
  copyable?: boolean;
}

/**
 * Read-only text display field with optional copy-to-clipboard functionality.
 *
 * @example
 * ```tsx
 * <DetailTextField label="Email" value={user.email} copyable />
 * ```
 */
export function DetailTextField({
  value,
  fallback = "\u2014",
  copyable,
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailTextFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (value == null) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const displayValue = value ?? fallback;

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      labelPosition={labelPosition}
      size={size}
      className={className}
    >
      <span className="inline-flex items-center gap-1.5">
        <span>{displayValue}</span>
        {copyable && value != null && (
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground",
              copied && "text-green-600",
            )}
            aria-label={copied ? "Copied" : "Copy to clipboard"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              {copied ? (
                <path d="M20 6 9 17l-5-5" />
              ) : (
                <>
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </>
              )}
            </svg>
          </button>
        )}
      </span>
    </DetailFieldWrapper>
  );
}
