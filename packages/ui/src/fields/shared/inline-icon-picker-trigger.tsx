import { lazy, Suspense } from "react";
import { Plus } from "lucide-react";

import { slotAttributes } from "../../design/slot-style";
import {
  inlineIconPickerGlyphStyle,
  inlineIconPickerPlaceholderStyle,
} from "./inline-icon-picker-trigger.style";

/**
 * Compact IconPicker rendered inline beside an input. Shows a `+` placeholder when
 * no icon is selected and the selected icon glyph otherwise — matching the convention
 * used by ColorPicker (single 36×36 button trigger).
 *
 * Used by {@link TextField} / {@link I18nTextField} when the `iconValue` / `onIconChange`
 * convenience props are provided. Consumers wanting a different trigger should pass
 * `prefixControl` directly with their own {@link IconPicker} subtree.
 *
 * The IconPicker payload (full icon metadata and localized name dictionaries) is
 * heavy, so the real trigger is code-split and loads only when this component
 * mounts; forms without icon-enabled fields never fetch it.
 */
export interface InlineIconPickerTriggerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

const LazyTrigger = lazy(() =>
  import("./inline-icon-picker-trigger-impl").then((m) => ({
    default: m.InlineIconPickerTriggerImpl,
  })),
);

function TriggerPlaceholder({ disabled, ariaLabel }: { disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-9 w-9 shrink-0 items-center justify-center"
      {...slotAttributes(inlineIconPickerPlaceholderStyle, {})}
    >
      <Plus className="size-4" {...slotAttributes(inlineIconPickerGlyphStyle, {})} />
    </button>
  );
}

export function InlineIconPickerTrigger(props: InlineIconPickerTriggerProps) {
  return (
    <Suspense fallback={<TriggerPlaceholder disabled={props.disabled} ariaLabel={props["aria-label"]} />}>
      <LazyTrigger {...props} />
    </Suspense>
  );
}
