import { useCallback, useState } from "react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { cn } from "../../utils/cn";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailImageField} component. */
export interface DetailImageFieldProps extends CommonDetailFieldProps {
  /** Image source URL. */
  value: string | null | undefined;
  /** Alt text for the image. */
  alt?: string;
  /** Image width in pixels or CSS value. Defaults to `96`. */
  width?: number | string;
  /** Image height in pixels or CSS value. Defaults to `96`. */
  height?: number | string;
  /** Additional CSS class for the image element. */
  imageClassName?: string;
}

/**
 * Read-only image display field with error fallback placeholder.
 *
 * @example
 * ```tsx
 * <DetailImageField label="Avatar" value={user.avatarUrl} alt="User avatar" />
 * ```
 */
export function DetailImageField({
  value,
  alt = "",
  width = 96,
  height = 96,
  imageClassName,
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailImageFieldProps) {
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  const showPlaceholder = value == null || hasError;

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      labelPosition={labelPosition}
      size={size}
      className={className}
    >
      {showPlaceholder ? (
        <span
          className={cn(
            "flex items-center justify-center rounded-md bg-muted text-muted-foreground",
            imageClassName,
          )}
          style={{ width, height }}
          aria-label={alt || "No image"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </span>
      ) : (
        <img
          src={value}
          alt={alt}
          onError={handleError}
          className={cn("rounded-md object-cover", imageClassName)}
          style={{ width, height }}
        />
      )}
    </DetailFieldWrapper>
  );
}
