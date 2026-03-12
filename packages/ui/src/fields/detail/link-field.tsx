import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailLinkField} component. */
export interface DetailLinkFieldProps extends CommonDetailFieldProps {
  /** Display text for the link. */
  value: string | null | undefined;
  /** Link URL. */
  href: string | null | undefined;
  /** Whether the link opens in a new tab with `rel="noopener noreferrer"`. */
  external?: boolean;
  /** Fallback text when value is null, undefined, or empty string. Defaults to em-dash. */
  fallback?: string;
}

/**
 * Read-only hyperlink display field.
 *
 * @example
 * ```tsx
 * <DetailLinkField label="Website" value="example.com" href="https://example.com" external />
 * ```
 */
export function DetailLinkField({
  value,
  href,
  external,
  fallback = "\u2014",
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailLinkFieldProps) {
  const hasValue = value != null && value !== "" && href != null && href !== "";

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {hasValue ? (
        <a
          href={href}
          className="text-primary underline-offset-4 hover:underline"
          {...(external && {
            target: "_blank",
            rel: "noopener noreferrer",
          })}
        >
          {value}
        </a>
      ) : (
        <span>{fallback}</span>
      )}
    </DetailFieldWrapper>
  );
}
