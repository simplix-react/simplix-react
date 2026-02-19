import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { useUIComponents } from "../../provider";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";

/** Display mode for the {@link DetailListField} component. */
export type ListDisplayMode = "badges" | "comma" | "bullet";

/** Props for the {@link DetailListField} component. */
export interface DetailListFieldProps extends CommonDetailFieldProps {
  /** Array of string values to display. */
  value: string[] | null | undefined;
  /** Display mode. Defaults to `"badges"`. */
  mode?: ListDisplayMode;
}

/**
 * Read-only list display field. Renders string arrays as badges, comma-separated text, or a bullet list.
 *
 * @example
 * ```tsx
 * <DetailListField label="Tags" value={["react", "typescript"]} />
 * <DetailListField label="Skills" value={skills} mode="comma" />
 * <DetailListField label="Steps" value={steps} mode="bullet" />
 * ```
 */
export function DetailListField({
  value,
  mode = "badges",
  label,
  labelKey,
  labelPosition,
  size,
  className,
}: DetailListFieldProps) {
  const { Badge } = useUIComponents();

  if (value == null || value.length === 0) {
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
      {mode === "badges" && (
        <span className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </span>
      )}
      {mode === "comma" && <span>{value.join(", ")}</span>}
      {mode === "bullet" && (
        <ul className="list-inside list-disc space-y-0.5">
          {value.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </DetailFieldWrapper>
  );
}
