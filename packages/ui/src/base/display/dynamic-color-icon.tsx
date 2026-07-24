import { type CSSProperties, type ReactElement } from "react";
import type { IconName } from "lucide-react/dynamic";
import { DynamicIconLazy } from "./dynamic-icon-lazy";
import { cn } from "../../utils/cn";

/**
 * Supported icon libraries.
 * Currently only `"lucide"` is functional; future expansion is reserved.
 */
export type IconLibrary = "lucide" | "phosphor";

/** Props for the {@link DynamicColorIcon} component. */
export interface DynamicColorIconProps {
  /**
   * Icon name in any format (kebab-case, PascalCase, camelCase, snake_case).
   * Normalized to kebab-case internally. Accepts `null` for DTO compatibility.
   */
  iconName?: string | null;

  /**
   * Icon library to use.
   * @defaultValue "lucide"
   */
  iconLibrary?: IconLibrary;

  /**
   * Icon color as a CSS color value (e.g. `"#3b82f6"`).
   * Accepts `null` for DTO compatibility; falls back to `defaultColor`.
   */
  color?: string | null;

  /**
   * Fallback icon name when `iconName` is not found or not provided.
   * @defaultValue "circle"
   */
  defaultIcon?: string;

  /**
   * Fallback color when `color` is not provided.
   * @defaultValue "#94a3b8"
   */
  defaultColor?: string;

  /**
   * Fallback text shown when `iconName` is empty/null.
   * The first character (after trim) is rendered as a letter glyph at the same
   * box size. When set, takes precedence over `defaultIcon`.
   */
  fallbackText?: string;

  /** Additional CSS classes applied to the icon element. */
  className?: string;

  /**
   * Icon size. Numbers are converted to pixels; strings are used as-is.
   * @defaultValue 16
   */
  size?: number | string;

  /** Inline style overrides applied after computed styles. */
  style?: CSSProperties;
}

function normalizeIconName(name: string): string {
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    return name;
  }

  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

/**
 * Renders a dynamically loaded lucide icon with a configurable color and size.
 *
 * @example
 * ```tsx
 * <DynamicColorIcon iconName="folder" color="#3b82f6" />
 * ```
 */
export function DynamicColorIcon({
  iconName,
  iconLibrary = "lucide",
  color,
  defaultIcon = "circle",
  defaultColor = "#94a3b8",
  fallbackText,
  className,
  size = 16,
  style,
}: DynamicColorIconProps) {
  const resolvedIconName = iconName ? normalizeIconName(iconName) : defaultIcon;
  const resolvedColor = color || defaultColor;
  const dim = typeof size === "number" ? `${size}px` : size;

  if (iconLibrary !== "lucide") {
    console.warn(
      `DynamicColorIcon: Icon library "${iconLibrary}" is not supported yet. Falling back to lucide.`
    );
  }

  if (!iconName && fallbackText) {
    const letter = fallbackText.trim().charAt(0);
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center shrink-0 text-xs font-bold",
          className
        )}
        style={{
          color: resolvedColor,
          width: dim,
          height: dim,
          ...style,
        }}
      >
        {letter}
      </span>
    );
  }

  return (
    <DynamicIconLazy
      name={resolvedIconName as IconName}
      className={cn("shrink-0", className)}
      style={{
        color: resolvedColor,
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        ...style,
      }}
      fallback={(): ReactElement | null => (
        <DynamicIconLazy
          name={normalizeIconName(defaultIcon) as IconName}
          className={cn("shrink-0", className)}
          style={{
            color: resolvedColor,
            width: typeof size === "number" ? `${size}px` : size,
            height: typeof size === "number" ? `${size}px` : size,
            ...style,
          }}
        />
      )}
    />
  );
}

/** Preset configurations for common use cases. */
export const DynamicColorIconPresets = {
  /** Tag group icon preset */
  tagGroup: {
    defaultIcon: "tag",
    defaultColor: "#94a3b8",
    size: 16,
  },
  /** Category icon preset */
  category: {
    defaultIcon: "folder",
    defaultColor: "#94a3b8",
    size: 16,
  },
  /** Navigation menu icon preset */
  menu: {
    defaultIcon: "circle",
    defaultColor: "#6b7280",
    size: 20,
  },
} as const;

export type DynamicColorIconPreset = keyof typeof DynamicColorIconPresets;
