import { Plus } from "lucide-react";

import { Icon, IconPicker } from "../../base/inputs/icon-picker";
import type { IconName } from "../../base/inputs/icon-picker";
import { cn } from "../../utils/cn";

/**
 * Compact IconPicker rendered inline beside an input. Shows a `+` placeholder when
 * no icon is selected and the selected icon glyph otherwise — matching the convention
 * used by ColorPicker (single 36×36 button trigger).
 *
 * Used by {@link TextField} / {@link I18nTextField} when the `iconValue` / `onIconChange`
 * convenience props are provided. Consumers wanting a different trigger should pass
 * `prefixControl` directly with their own {@link IconPicker} subtree.
 */
export interface InlineIconPickerTriggerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function InlineIconPickerTrigger({
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
