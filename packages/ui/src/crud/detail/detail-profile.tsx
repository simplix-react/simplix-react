import type { ReactNode } from "react";

import { useFlatUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";

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
        "grid shrink-0 grid-cols-[56px_minmax(0,1fr)_minmax(0,auto)] grid-rows-[auto_auto] items-start gap-x-4 gap-y-1 border-b border-border bg-surface-2 px-6 py-4 [container-type:inline-size]",
        "max-[720px]:grid-cols-[56px_minmax(0,1fr)] max-[720px]:grid-rows-[auto_auto_auto]",
        className,
      )}
    >
      <div
        className="col-start-1 grid size-14 place-items-center self-center rounded-[12px] bg-primary text-primary-foreground [grid-row:1/span_2] [&>svg]:size-7 max-[720px]:[grid-row:1/span_3]"
        aria-hidden="true"
      >
        {mark}
      </div>
      <Heading level={5} className="col-start-2 m-0 min-w-0 [grid-row:1]">
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
    <div className="col-start-3 flex min-w-0 flex-nowrap items-center justify-end gap-1 justify-self-end self-center [grid-row:1] max-[720px]:col-start-2 max-[720px]:justify-start max-[720px]:justify-self-start max-[720px]:[grid-row:3]">
      {items.length === 0 && (
        <Text size="caption" tone="muted" className="italic">
          {emptyLabel}
        </Text>
      )}
      {visible.map((f) => (
        <Badge key={f} variant="outline" className="shrink-0 border-primary/20 bg-primary/10 text-primary">
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
            <TooltipContent className="z-[100] flex flex-col gap-1">
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
    <div className="col-start-2 flex flex-wrap items-center gap-2.5 [grid-row:2]">
      {code != null && (
        <code className="rounded-[3px] bg-surface-3 px-1.5 py-px font-mono text-xs text-fg-soft">{code}</code>
      )}
      {items.map((it, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className="contents">
          {(code != null || i > 0) && (
            <span className="inline-block size-[3px] shrink-0 rounded-full bg-muted-2" />
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
