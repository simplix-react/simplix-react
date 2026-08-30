import { type ComponentPropsWithRef, forwardRef, type ReactNode } from "react";
import {
  CircleCheckIcon,
  ClockIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { cn } from "../../utils/cn";
import { Flex } from "../../primitives";
import { type IconComponent, type StatusTone } from "../status-tone";
import { useStatusTones } from "../status-tone-context";

/**
 * Tone vocabulary for {@link AlertBanner}. Reuses the shared {@link StatusTone}
 * scale; the canonical banner tones are danger/warning/info/success/neutral, but
 * every {@link StatusTone} member is accepted.
 */
export type AlertTone = StatusTone;

/**
 * Visual density of {@link AlertBanner}.
 *
 * - `default` — comfortable padding, `size-5` icon.
 * - `sm` — tighter padding, `size-4` icon.
 *
 * <p>Both carry the same type scale: a `text-sm font-medium` title over a `text-xs` muted
 * subtitle. The density decides the room, never the size of the words.
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

// One type scale across `default` and `sm`, which differ in the room they take and not in what a
// title is. Given its own scale, `default` read 14/600 over a 14px body while every `sm` banner —
// and every notice card, which is one — read 14/500 over 12px muted: the same box at two sizes
// depending on which file drew it, and a product split 79 to 77 between them. `hint` keeps its
// smaller title; it is the one density that means "smaller", rather than "roomier".
const DENSITY_TOKENS: Record<AlertDensity, DensityToken> = {
  default: {
    container: "px-4 py-3",
    icon: "size-5",
    title: "text-sm font-medium",
    subtitle: "text-xs text-muted-foreground",
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
 * The glyph a tone is drawn with when the caller names none.
 *
 * <p><b>Icon and colour together, never one alone.</b> Colour on its own does not reach a reader
 * who cannot separate two tints, and an icon on its own does not reach one scanning the page
 * without reading it. A tone that says something is wrong therefore has to say it twice, and
 * leaving that to every call site meant it was said once at most of them: `icon` was a free slot,
 * so a banner tinted red and carrying no shape was the shape the type allowed.
 *
 * <p><b>So the tone decides the glyph and `icon` overrides it</b>, which is the direction that
 * needs no caller to remember. A caller with a subject glyph — a key on a certificate banner, a
 * plug on a gateway banner — still passes one and gets it.
 *
 * <p><b>`neutral` is the one tone with no entry, and that is the escape.</b> Its surface is the
 * muted ground rather than a tint, so there is no colour standing alone for a shape to accompany;
 * a banner that genuinely wants no glyph is a banner that wants no tint either, and says so by
 * being neutral. That escape is a value in the source rather than a flag a caller can add to buy
 * silence — turning the glyph off means changing what colour the banner is, which changes the
 * screen.
 *
 * <p><b>A consumer keeping its own kind→style table has to stay agreed with this one.</b> A
 * product that draws the same four states in a card of its own and in a banner, and picks the
 * glyph in its own table, has two tables answering one question: the day they disagree, the same
 * warning is a triangle in the card and a circle in the banner, and nothing fails. Whichever table
 * a consumer keeps, it maps its kinds onto these glyphs rather than choosing again.
 */
const TONE_GLYPH: Readonly<Partial<Record<StatusTone, IconComponent>>> = {
  // One triangle for both, and deliberately: the split a reader needs at a glance is
  // "something is wrong" against "this is an explanation", which is carried by the shape.
  // Red against amber separates the two inside that pair.
  danger: TriangleAlertIcon,
  warning: TriangleAlertIcon,
  success: CircleCheckIcon,
  info: InfoIcon,
  pending: ClockIcon,
  processing: LoaderCircleIcon,
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
  /**
   * Icon component rendered in the leading slot. Defaults to the glyph the tone carries — see
   * {@link TONE_GLYPH}, which is where a tinted banner gets its shape without any caller
   * remembering to. Pass one only to say something the tone does not: the subject of the banner
   * rather than its severity.
   */
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
 * shared UI. Renders a rounded, tone-tinted surface with a leading icon, a
 * title/subtitle pair (or free-form `children`), and a trailing slot.
 *
 * All display strings arrive pre-translated as props; the component never calls
 * `t()`. Color is driven entirely by {@link STATUS_TONES}, so every surface and
 * icon class already carries its `dark:` variant.
 *
 * <p><b>The glyph comes from the tone.</b> A banner names its tone and gets the shape that goes
 * with it ({@link TONE_GLYPH}); `icon` is for the caller who wants the subject drawn instead of
 * the severity, and `neutral` is the tone that carries no glyph because it carries no tint.
 *
 * @example
 * ```tsx
 * // The triangle comes from the tone; nothing here has to remember it.
 * <AlertBanner
 *   tone="danger"
 *   title="Connection lost"
 *   subtitle="Reconnecting to the device gateway…"
 *   trailing={<Badge variant="destructive">Offline</Badge>}
 * />
 *
 * // A subject glyph, where the severity is not the thing worth drawing.
 * <AlertBanner tone="info" icon={KeyRoundIcon} title="Signing key rotates on 1 March" />
 * ```
 */
export const AlertBanner = forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    {
      tone = "info",
      icon,
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
    const toneToken = useStatusTones()[tone];
    const densityToken = DENSITY_TOKENS[density];

    // The shape that goes with the tint. A caller's own icon wins, because it says the subject
    // rather than the severity; with none, the tone supplies its own so a coloured banner is
    // never colour alone.
    const Icon = icon ?? TONE_GLYPH[tone];

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
          {/* A row rather than a box. The slot is documented for a badge and is handed two
              buttons as often — a fragment of siblings in a bare `div` sits flush, so the
              controls read as one wide control with a line down the middle. The gap belongs
              here rather than in each caller's own wrapper: a slot that needs a wrapper to
              look right is a slot that will be wrong wherever somebody forgets one. */}
          {trailing != null ? (
            <Flex align="center" gap="sm" wrap className="shrink-0">
              {trailing}
            </Flex>
          ) : null}
        </Flex>
      </div>
    );
  },
);

AlertBanner.displayName = "AlertBanner";
