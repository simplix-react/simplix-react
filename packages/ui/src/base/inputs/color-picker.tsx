import { useMemo } from "react";
import { Plus } from "lucide-react";

import { useLocale } from "@simplix-react/i18n/react";

import { CheckIcon, XIcon } from "../../crud/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../overlay/popover";
import { cn } from "../../utils/cn";
import { partAttributes, slotAttributes } from "../../design/slot-style";
import {
  colorPickerBodyStyle,
  colorPickerClearStyle,
  colorPickerCustomLabelStyle,
  colorPickerCustomStyle,
  colorPickerFooterStyle,
  colorPickerInputStyle,
  colorPickerPaletteStyle,
  colorPickerPlaceholderStyle,
  colorPickerSwatchStyle,
  colorPickerTriggerStyle,
  colorPickerPopoverStyle,
} from "./color-picker.style";
import {
  type ColorPickerLocale,
  getColorName,
  getColorPickerLocale,
} from "./color-picker/locales";

/** A preset color entry for the color picker palette. */
export interface PresetColor {
  /** Hex color value (e.g. `"#EF4444"`). */
  value: string;
  /**
   * Locale key for the color name (e.g. `"red"`). When provided the localized name
   * is resolved via the active locale; otherwise {@link PresetColor.name} is shown.
   */
  key?: string;
  /** Fallback name when {@link PresetColor.key} is absent or unresolved. */
  name: string;
}

const DEFAULT_PRESET_COLORS: PresetColor[] = [
  { value: "#EF4444", key: "red", name: "Red" },
  { value: "#F97316", key: "orange", name: "Orange" },
  { value: "#F59E0B", key: "amber", name: "Amber" },
  { value: "#EAB308", key: "yellow", name: "Yellow" },
  { value: "#84CC16", key: "lime", name: "Lime" },
  { value: "#22C55E", key: "green", name: "Green" },
  { value: "#14B8A6", key: "teal", name: "Teal" },
  { value: "#06B6D4", key: "cyan", name: "Cyan" },
  { value: "#3B82F6", key: "blue", name: "Blue" },
  { value: "#6366F1", key: "indigo", name: "Indigo" },
  { value: "#8B5CF6", key: "violet", name: "Violet" },
  { value: "#A855F7", key: "purple", name: "Purple" },
  { value: "#EC4899", key: "pink", name: "Pink" },
  { value: "#F43F5E", key: "rose", name: "Rose" },
  { value: "#64748B", key: "slate", name: "Slate" },
  { value: "#78716C", key: "stone", name: "Stone" },
];

/** Props for the {@link ColorPicker} component. */
export interface ColorPickerProps {
  /** Current hex color value (e.g. `"#ff0000"`). */
  value: string;
  /** Called when the value changes. */
  onChange: (value: string) => void;
  /** Preset color palette. Defaults to 16 common colors. */
  presetColors?: PresetColor[];
  /** Show the native color picker for custom colors. @defaultValue true */
  showCustomPicker?: boolean;
  /** Allow clearing the selected color. @defaultValue true */
  clearable?: boolean;
  /** Disable the picker. */
  disabled?: boolean;
  /** Accessible label for the trigger button. */
  "aria-label"?: string;
  /** Additional class names for the trigger button. */
  className?: string;
  /** Render a custom clear button. Falls back to a built-in ghost button. */
  renderClear?: (onClear: () => void) => React.ReactNode;
  /**
   * BCP-47 language code for picker UI text (e.g. `"ko"`, `"en"`, `"ja"`).
   * When omitted, follows the active i18n locale from {@link useLocale} (re-renders
   * on locale change). Bundled languages: ko/en/ja — unknown codes fall back to English.
   */
  lang?: string;
}

/**
 * Standalone color picker with a popover palette, optional custom native picker, and clear action.
 *
 * @example
 * ```tsx
 * <ColorPicker value={color} onChange={setColor} />
 * ```
 */
export function ColorPicker({
  value,
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  showCustomPicker = true,
  clearable = true,
  disabled,
  "aria-label": ariaLabel,
  className,
  renderClear,
  lang,
}: ColorPickerProps) {
  const activeLocale = useLocale();
  const locale = useMemo<ColorPickerLocale>(() => {
    return getColorPickerLocale(lang ?? activeLocale);
  }, [lang, activeLocale]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center disabled:cursor-not-allowed",
            className,
          )}
          {...slotAttributes(colorPickerTriggerStyle, { empty: !value })}
          style={{ backgroundColor: value || "transparent" }}
          aria-label={ariaLabel ?? locale.triggerPlaceholder}
        >
          {!value && (
            <Plus className="size-4" {...slotAttributes(colorPickerPlaceholderStyle, {})} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" align="start" {...partAttributes(colorPickerPopoverStyle, {})}>
        <div {...slotAttributes(colorPickerBodyStyle, {})}>
          {/* Preset color palette */}
          <div className="grid grid-cols-8" {...slotAttributes(colorPickerPaletteStyle, {})}>
            {presetColors.map((color) => {
              const displayName = color.key ? getColorName(locale, color.key) : color.name;
              return (
                <button
                  key={color.value}
                  type="button"
                  className="size-6"
                  {...slotAttributes(colorPickerSwatchStyle, {
                    selected: value?.toUpperCase() === color.value.toUpperCase(),
                  })}
                  style={{ backgroundColor: color.value }}
                  onClick={() => onChange(color.value)}
                  title={displayName}
                >
                  {value?.toUpperCase() === color.value.toUpperCase() && (
                    <CheckIcon className="size-4" />
                  )}
                </button>
              );
            })}
          </div>
          {/* Custom color picker and clear */}
          {(showCustomPicker || (clearable && value)) && (
            <div
              className="flex items-center justify-between"
              {...slotAttributes(colorPickerFooterStyle, {})}
            >
              {showCustomPicker && (
                <div className="flex items-center" {...slotAttributes(colorPickerCustomStyle, {})}>
                  <input
                    type="color"
                    value={value || "#3B82F6"}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="h-8 w-8 cursor-pointer"
                    {...slotAttributes(colorPickerInputStyle, {})}
                  />
                  <span {...slotAttributes(colorPickerCustomLabelStyle, {})}>
                    {locale.custom}
                  </span>
                </div>
              )}
              {clearable && value && (
                renderClear ? renderClear(() => onChange("")) : (
                  <button
                    type="button"
                    className="inline-flex h-7 items-center"
                    {...slotAttributes(colorPickerClearStyle, {})}
                    onClick={() => onChange("")}
                  >
                    <XIcon className="size-3" />
                    {locale.clear}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
