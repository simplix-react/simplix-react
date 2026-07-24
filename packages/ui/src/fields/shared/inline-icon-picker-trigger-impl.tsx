import { Plus } from "lucide-react";

import { Icon, IconPicker } from "../../base/inputs/icon-picker";
import type { IconName } from "../../base/inputs/icon-picker";
import { cn } from "../../utils/cn";
import type { InlineIconPickerTriggerProps } from "./inline-icon-picker-trigger";

/**
 * Eager implementation of {@link InlineIconPickerTrigger}. Kept in its own module
 * so the IconPicker payload (icon metadata, category/name dictionaries) loads only
 * when a form actually renders an icon-enabled field.
 */
export function InlineIconPickerTriggerImpl({
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: InlineIconPickerTriggerProps) {
  return (
    <IconPicker value={value as IconName | undefined} onChange={onChange}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 bg-background transition-all",
          "hover:bg-accent",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          value ? "border-solid" : "border-dashed",
        )}
      >
        {value ? (
          <Icon name={value as IconName} className="size-4" />
        ) : (
          <Plus className="size-4 text-muted-foreground" />
        )}
      </button>
    </IconPicker>
  );
}
