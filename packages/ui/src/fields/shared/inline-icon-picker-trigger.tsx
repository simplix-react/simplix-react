import { lazy, Suspense } from "react";
import { Plus } from "lucide-react";

import { cn } from "../../utils/cn";

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

function TriggerPlaceholder({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-dashed bg-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <Plus className="size-4 text-muted-foreground" />
    </button>
  );
}

export function InlineIconPickerTrigger(props: InlineIconPickerTriggerProps) {
  return (
    <Suspense fallback={<TriggerPlaceholder disabled={props.disabled} />}>
      <LazyTrigger {...props} />
    </Suspense>
  );
}
