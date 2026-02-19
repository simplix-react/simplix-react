import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Display mode for the {@link DetailBooleanField} component. */
export type BooleanDisplayMode = "text" | "icon";

/** Props for the {@link DetailBooleanField} component. */
export interface DetailBooleanFieldProps extends CommonDetailFieldProps {
  /** Boolean value to display. */
  value: boolean | null | undefined;
  /** Display mode: `"text"` shows Yes/No, `"icon"` shows check/x icons. Defaults to `"text"`. */
  mode?: BooleanDisplayMode;
  /** Custom labels for true/false values when using `"text"` mode. */
  labels?: { true: string; false: string };
}

/**
 * Read-only boolean display field. Shows Yes/No text or check/x icons.
 *
 * @example
 * ```tsx
 * <DetailBooleanField label="Active" value={user.isActive} />
 * <DetailBooleanField label="Verified" value={user.verified} mode="icon" />
 * ```
 */
export function DetailBooleanField({
  value,
  mode = "text",
  labels = { true: "Yes", false: "No" },
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailBooleanFieldProps) {
  if (value == null) {
    return (
      <DetailFieldWrapper
        label={label}
        labelKey={labelKey}
        labelPosition={labelPosition}
        size={size}
        className={className}
      >
        <span>{"\u2014"}</span>
      </DetailFieldWrapper>
    );
  }

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      labelPosition={labelPosition}
      size={size}
      className={className}
    >
      {mode === "icon" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 ${value ? "text-green-600" : "text-muted-foreground"}`}
          aria-label={value ? labels.true : labels.false}
        >
          {value ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </>
          )}
        </svg>
      ) : (
        <span>{value ? labels.true : labels.false}</span>
      )}
    </DetailFieldWrapper>
  );
}
