import { Plus } from "lucide-react";

import { Icon, IconPicker } from "../../base/inputs/icon-picker";
import type { IconName } from "../../base/inputs/icon-picker";
import { slotAttributes } from "../../design/slot-style";
import type { InlineIconPickerTriggerProps } from "./inline-icon-picker-trigger";
import {
  inlineIconPickerGlyphStyle,
  inlineIconPickerTriggerStyle,
} from "./inline-icon-picker-trigger.style";

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
        className="flex h-9 w-9 shrink-0 items-center justify-center"
        {...slotAttributes(inlineIconPickerTriggerStyle, { filled: Boolean(value) })}
      >
        {value ? (
          <Icon name={value as IconName} className="size-4" />
        ) : (
          <Plus className="size-4" {...slotAttributes(inlineIconPickerGlyphStyle, {})} />
        )}
      </button>
    </IconPicker>
  );
}
