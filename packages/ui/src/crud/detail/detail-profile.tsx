import type { ReactNode } from "react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { slotAttributes, partAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  detailProfileCodeStyle,
  detailProfileDotStyle,
  detailProfileFeatStyle,
  detailProfileFeatsStyle,
  detailProfileMarkStyle,
  detailProfileMetaStyle,
  detailProfileOverflowStyle,
  detailProfileStyle,
  detailProfileTitleStyle,
} from "./detail-profile.style";

// ── DetailProfile ──
//
// Detail/form modal "profile strip": a left mark tile + entity title, a
// right-aligned row of feature badges, and a meta row (code · type · status).
//
// Presentational only — the library owns layout / a11y, the caller owns every
// visible string (already localized). No strings enter the `simplix/ui` locale
// namespace. Compose with `<DetailProfile.Feats>` / `<DetailProfile.Meta>`.
//
// ┌──────────────────────────────────────────────────────────────┐
// │ ┌────┐  Title                                  [feat] [feat]  │
// │ │mark│  CODE · type · status                                  │
// │ └────┘                                                        │
// └──────────────────────────────────────────────────────────────┘

/** Props for the {@link DetailProfile} root. */
export interface DetailProfileProps {
  /** Left mark-tile content (icon / monogram). Decorative — rendered `aria-hidden`. */
  mark: ReactNode;
  /** Already-localized entity title (channel name, etc.). */
  title: ReactNode;
  /** Feature badges, right-aligned. Use `<DetailProfile.Feats>`. */
  feats?: ReactNode;
  /** Meta row under the title. Use `<DetailProfile.Meta>`. */
  meta?: ReactNode;
  /** Extra classes on the root `<section>`. */
  className?: string;
}

function DetailProfileRoot({ mark, title, feats, meta, className }: DetailProfileProps) {
  const { Heading } = useFlatUIComponents();
  return (
    <section
      className={cn(
        "grid shrink-0 grid-cols-[56px_minmax(0,1fr)_minmax(0,auto)] grid-rows-[auto_auto] items-start [container-type:inline-size]",
        "max-[720px]:grid-cols-[56px_minmax(0,1fr)] max-[720px]:grid-rows-[auto_auto_auto]",
        className,
      )}
      {...slotAttributes(detailProfileStyle, {})}
    >
      <div
        className="col-start-1 grid size-14 place-items-center self-center [grid-row:1/span_2] [&>svg]:size-7 max-[720px]:[grid-row:1/span_3]"
        {...slotAttributes(detailProfileMarkStyle, {})}
        aria-hidden="true"
      >
        {mark}
      </div>
      <Heading level={5} className="col-start-2 min-w-0 [grid-row:1]" {...partAttributes(detailProfileTitleStyle, {})}>
        {title}
      </Heading>
      {feats}
      {meta}
    </section>
  );
}

DetailProfileRoot.displayName = "DetailProfile";

/** Props for the {@link DetailProfile.Feats} sub-component. */
export interface DetailProfileFeatsProps {
  /** Already-localized badge labels. Empty array → `emptyLabel` is shown instead. */
  items: ReadonlyArray<string>;
  /** Max badges before collapsing the remainder into a "+N" badge. Default `5`. */
  max?: number;
  /**
   * Already-localized "no active features" text. Required — the library ships no
   * default string (visible strings are caller-owned).
   */
  emptyLabel: string;
  /**
   * Already-localized accessible label for the "+N" overflow badge, e.g.
   * `(n) => t("detail.moreFeatures", { count: n })`. Falls back to the visible "+N".
   */
  overflowLabel?: (hiddenCount: number) => string;
}

function DetailProfileFeats({ items, max = 5, emptyLabel, overflowLabel }: DetailProfileFeatsProps) {
  const { Badge, Text, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } = useFlatUIComponents();
  const visible = items.slice(0, max);
  const hidden = items.slice(max);
  return (
    <div {...slotAttributes(detailProfileFeatsStyle, {})} className="col-start-3 flex min-w-0 flex-nowrap items-center justify-end justify-self-end self-center [grid-row:1] max-[720px]:col-start-2 max-[720px]:justify-start max-[720px]:justify-self-start max-[720px]:[grid-row:3]">
      {items.length === 0 && (
        <Text size="caption" tone="muted" className="italic">
          {emptyLabel}
        </Text>
      )}
      {visible.map((f) => (
        <Badge key={f} variant="outline" className="shrink-0" {...partAttributes(detailProfileFeatStyle, {})}>
          {f}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <TooltipProvider delayDuration={120}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                tabIndex={0}
                aria-label={overflowLabel?.(hidden.length)}
                className="shrink-0 cursor-default"
              >
                +{hidden.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="z-[100] flex flex-col" {...partAttributes(detailProfileOverflowStyle, {})}>
              {hidden.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

DetailProfileFeats.displayName = "DetailProfile.Feats";

/** Props for the {@link DetailProfile.Meta} sub-component. */
export interface DetailProfileMetaProps {
  /**
   * Code chip content. The library supplies no empty placeholder — the caller
   * passes the raw code or an already-localized placeholder.
   */
  code?: ReactNode;
  /** Already-localized meta items (type / status labels, parent name, …). */
  items?: ReadonlyArray<ReactNode>;
}

function DetailProfileMeta({ code, items = [] }: DetailProfileMetaProps) {
  const { Text } = useFlatUIComponents();
  return (
    <div className="col-start-2 flex flex-wrap items-center [grid-row:2]" {...slotAttributes(detailProfileMetaStyle, {})}>
      {code != null && (
        <code {...slotAttributes(detailProfileCodeStyle, {})}>{code}</code>
      )}
      {items.map((it, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className="contents">
          {(code != null || i > 0) && (
            <span className="inline-block size-[3px] shrink-0" {...slotAttributes(detailProfileDotStyle, {})} />
          )}
          <Text size="caption" tone="muted" as="span">
            {it}
          </Text>
        </span>
      ))}
    </div>
  );
}

DetailProfileMeta.displayName = "DetailProfile.Meta";

/**
 * Detail/form modal profile strip. Compound: `DetailProfile` +
 * {@link DetailProfile.Feats} + {@link DetailProfile.Meta}.
 */
export const DetailProfile = Object.assign(DetailProfileRoot, {
  Feats: DetailProfileFeats,
  Meta: DetailProfileMeta,
});
