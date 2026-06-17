import { type ComponentPropsWithRef, forwardRef, type ReactNode } from "react";

import { cn } from "../../utils/cn";
import { Flex } from "../../primitives";
import { STATUS_TONES, type IconComponent, type StatusTone } from "../status-tone";

/**
 * Tone vocabulary for {@link AlertBanner}. Reuses the shared {@link StatusTone}
 * scale; the canonical banner tones are danger/warning/info/success/neutral, but
 * every {@link StatusTone} member is accepted.
 */
export type AlertTone = StatusTone;

/**
 * Visual density of {@link AlertBanner}.
 *
 * - `default` — comfortable padding, `size-5` icon, `text-sm font-semibold` title.
 * - `sm` — tighter padding, `size-4` icon, `text-sm` body.
 * - `hint` — compact, borderless, `size-3.5` icon, `text-xs` body.
 */
export type AlertDensity = "default" | "sm" | "hint";

/** Per-density class bundle resolved once at render time. */
interface DensityToken {
  /** Outer container padding. */
  container: string;
  /** Caller-supplied icon sizing. */
  icon: string;
  /** Title line typography. */
  title: string;
  /** Subtitle line typography. */
  subtitle: string;
  /** Whether this density forces the borderless surface. */
  borderless: boolean;
}

const DENSITY_TOKENS: Record<AlertDensity, DensityToken> = {
  default: {
    container: "px-4 py-3",
    icon: "size-5",
    title: "text-sm font-semibold",
    subtitle: "text-sm text-muted-foreground",
    borderless: false,
  },
  sm: {
    container: "px-3 py-2",
    icon: "size-4",
    title: "text-sm font-medium",
    subtitle: "text-xs text-muted-foreground",
    borderless: false,
  },
  hint: {
    container: "p-2.5",
    icon: "size-3.5",
    title: "text-xs",
    subtitle: "text-xs text-muted-foreground",
    borderless: true,
  },
};

/**
 * Props for {@link AlertBanner}.
 *
 * Extends the native `div` attributes (so `onClick`, `id`, `data-*`, etc. flow
 * through to the container) except the ones this component owns with richer
 * types: `title` is widened from `string` to `ReactNode`.
 */
export interface AlertBannerProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** Status tone driving the surface tint and icon color. Defaults to `"info"`. */
  tone?: StatusTone;
  /** Caller-supplied icon component rendered in the leading slot. */
  icon?: IconComponent;
  /** Primary line (already translated). Ignored when `children` is provided. */
  title?: ReactNode;
  /** Secondary line (already translated). Ignored when `children` is provided. */
  subtitle?: ReactNode;
  /** Visual density. Defaults to `"default"`. The `"hint"` density implies borderless. */
  density?: AlertDensity;
  /** Render the tinted border. Defaults to `true`; `"hint"` density forces `false`. */
  bordered?: boolean;
  /** Trailing slot rendered at the right edge (e.g. a `Badge`). */
  trailing?: ReactNode;
  /** Free-form body. When present, replaces `title`/`subtitle`. */
  children?: ReactNode;
  /** Extra classes merged onto the outer container. */
  className?: string;
}

/**
 * Tinted status banner — the de-facto canonical alert pattern promoted into the
 * shared UI. Renders a rounded, tone-tinted surface with an optional leading
 * icon, a title/subtitle pair (or free-form `children`), and a trailing slot.
 *
 * All display strings arrive pre-translated as props; the component never calls
 * `t()`. Color is driven entirely by {@link STATUS_TONES}, so every surface and
 * icon class already carries its `dark:` variant.
 *
 * @example
 * ```tsx
 * <AlertBanner
 *   tone="danger"
 *   icon={AlertTriangleIcon}
 *   title="Connection lost"
 *   subtitle="Reconnecting to the device gateway…"
 *   trailing={<Badge variant="destructive">Offline</Badge>}
 * />
 * ```
 */
export const AlertBanner = forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    {
      tone = "info",
      icon: Icon,
      title,
      subtitle,
      density = "default",
      bordered = true,
      trailing,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const toneToken = STATUS_TONES[tone];
    const densityToken = DENSITY_TOKENS[density];

    // "hint" density is intrinsically borderless; otherwise honor `bordered`.
    const showBorder = densityToken.borderless ? false : bordered;

    // Surface token bundles border + background tint; drop the border classes
    // when the banner should read as borderless.
    const surfaceClass = showBorder ? toneToken.surface : "border-transparent bg-transparent";

    // Align the icon to the start so multi-line bodies stay top-aligned, but
    // center single-line content vertically. Free-form children may wrap, so we
    // bias to start whenever a subtitle or children are present.
    const verticalAlign = children != null || subtitle != null ? "start" : "center";

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "rounded-md border",
          densityToken.container,
          surfaceClass,
          className,
        )}
        {...rest}
      >
        <Flex align={verticalAlign} gap="sm">
          {Icon ? (
            <Icon className={cn("shrink-0", densityToken.icon, toneToken.icon)} aria-hidden="true" />
          ) : null}
          <Flex direction="column" gap="none" align="stretch" className="min-w-0 flex-1">
            {children != null ? (
              children
            ) : (
              <>
                {title != null ? (
                  <span className={cn("leading-tight", densityToken.title)}>{title}</span>
                ) : null}
                {subtitle != null ? (
                  <span className={cn("leading-snug", densityToken.subtitle)}>{subtitle}</span>
                ) : null}
              </>
            )}
          </Flex>
          {trailing != null ? <div className="shrink-0">{trailing}</div> : null}
        </Flex>
      </div>
    );
  },
);

AlertBanner.displayName = "AlertBanner";
