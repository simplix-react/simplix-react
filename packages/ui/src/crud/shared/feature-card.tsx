import type { ReactNode } from "react";

import { slotAttributes } from "../../design/slot-style";
import {
  featureCardActionStyle,
  featureCardBodyStyle,
  featureCardHeaderStyle,
  featureCardStyle,
  featureCardTitleStyle,
} from "./feature-card.style";

/* ============================== FeatureCard ============================
 *
 * A bordered section card for detail/form modal bodies: an optional header
 * (leading icon + title + a right-aligned action slot) over a content body.
 * Modal bodies stack these instead of pulling in a tabbed shell — each card is
 * one self-contained section (a feature, a field group, a description block).
 *
 * Presentational only — the library owns layout, the caller owns every visible
 * string (already localized) and any interactive control. The `action` slot is
 * where a feature's on/off `Switch`, a button, or a status badge goes; omit it
 * (and `title`) for a plain, header-less card. No strings enter the
 * `simplix/ui` locale namespace.
 *
 * ┌─ FeatureCard ──────────────────────────────┐
 * │ [icon] Title                    [action]   │  ← header (omitted if both unset)
 * │ ───────────────────────────────────────────│
 * │  children — any content                     │  ← body
 * └─────────────────────────────────────────────┘
 */

/** Props for the {@link FeatureCard}. */
export interface FeatureCardProps {
  /** Already-localized section title. Omit (with `action`) for a header-less card. */
  title?: ReactNode;
  /** Leading icon before the title. Decorative — sized to 16px. */
  icon?: ReactNode;
  /** Right-aligned header slot: a feature toggle `Switch`, button, or badge. */
  action?: ReactNode;
  /** Card body content. */
  children: ReactNode;
  /** Extra classes on the root `<section>`. */
  className?: string;
}

export function FeatureCard({ title, icon, action, children, className }: FeatureCardProps) {
  const hasHeader = title != null || action != null;
  return (
    <section className={className} {...slotAttributes(featureCardStyle, {})}>
      {hasHeader && (
        <header className="flex items-center justify-between" {...slotAttributes(featureCardHeaderStyle, {})}>
          <div className="flex min-w-0 items-center [&>svg]:size-4 [&>svg]:shrink-0" {...slotAttributes(featureCardTitleStyle, {})}>
            {icon}
            {title}
          </div>
          {action != null && <div className="flex shrink-0 items-center" {...slotAttributes(featureCardActionStyle, {})}>{action}</div>}
        </header>
      )}
      <div {...slotAttributes(featureCardBodyStyle, {})}>{children}</div>
    </section>
  );
}
