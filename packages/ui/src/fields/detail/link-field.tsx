import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Props for the {@link DetailLinkField} component. */
export interface DetailLinkFieldProps extends CommonDetailFieldProps {
  /** Display text for the link. */
  value: string;
  /** Link URL. */
  href: string;
  /** Whether the link opens in a new tab with `rel="noopener noreferrer"`. */
  external?: boolean;
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
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailLinkFieldProps) {
  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      labelPosition={labelPosition}
      size={size}
      className={className}
    >
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
    </DetailFieldWrapper>
  );
}
