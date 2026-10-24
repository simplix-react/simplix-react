import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  type ComponentPropsWithRef,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { arrowStep, overflowEdges, type OverflowEdges } from "./tab-overflow";
import { tabsContentStyle, tabsInkStyle, tabsListStyle, tabsScrollArrowStyle, tabsScrollerStyle, tabsTriggerStyle } from "./tabs.style";

// Root - pass through
export const Tabs = TabsPrimitive.Root;

/** Visual style variants shared by {@link TabsList} and {@link TabsTrigger}. */
export type TabsVariant = "default" | "full" | "bookmark" | "underline";

/**
 * Propagates the list variant down to each {@link TabsTrigger} so triggers
 * adapt their styling automatically — callers only set `variant` on the list.
 */
const TabsVariantContext = createContext<TabsVariant>("default");

// ── List ──

/** Layout classes of the list per variant: flow, alignment and sizing. */
const listLayout: Record<TabsVariant, string> = {
  default: "h-9 items-center justify-center inline-flex",
  full: "items-center flex w-full",
  bookmark: "flex items-end",
  underline: "flex w-full items-end",
};

export interface TabsListProps
  extends ComponentPropsWithRef<typeof TabsPrimitive.List> {
  /**
   * Visual style variant. Triggers adapt automatically via context.
   * - `"default"` — inline segmented control, auto-width.
   * - `"full"` — spans full width with top margin; triggers auto-expand to equal widths.
   * - `"bookmark"` — folder-style tabs sitting on a bottom line. The line is an
   *   inset shadow (not a border) so the active tab's `bg-card` covers it without
   *   relying on overflow — the cutout survives `overflow-x-auto` horizontal scroll.
   * - `"underline"` — a quiet second level: no track, no fill, the chosen tab marked
   *   by a rule under its own label. For tabs nested inside a surface that already
   *   carries tabs — a detail panel or a form under a page's own strip — where a
   *   second segmented control at the same weight leaves the reader unable to tell
   *   which of the two they are inside.
   *
   * @default "default"
   */
  variant?: TabsVariant;
  /**
   * Keeps the strip on one line when its tabs are wider than it: the strip scrolls sideways, an
   * arrow appears at each end that hides tabs and moves the strip most of a view per press, and
   * the chosen tab is scrolled into sight. Without it, a strip too wide for its box is clipped,
   * and a reader cannot tell that tabs past the edge exist.
   *
   * @default false
   */
  scrollArrows?: boolean;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", scrollArrows = false, children, ...rest }, ref) => {
    const list = useRef<HTMLDivElement | null>(null);
    const ink = useRef<HTMLSpanElement | null>(null);
    const setList = useCallback(
      (node: HTMLDivElement | null) => {
        list.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    useTabInk(list, ink);
    const edges = useOverflowEdges(list, scrollArrows);
    const { t } = useTranslation("simplix/ui");
    const strip = (
        <TabsPrimitive.List
          ref={setList}
          className={cn(
            "relative",
            listLayout[variant],
            // Scrolled by the arrows and by touch; the scrollbar itself is hidden because the arrows say there is more.
            scrollArrows && "min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            className,
          )}
          {...rest}
          {...slotAttributes(tabsListStyle, { variant })}
        >
          {children}
          {/* The rule under the chosen tab, moved to it rather than redrawn on it, so a change of tab
              is seen as the rule sliding across. Whether it is drawn at all is the design's. */}
          <span
            ref={ink}
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0"
            {...slotAttributes(tabsInkStyle, { variant })}
          />
        </TabsPrimitive.List>
    );
    if (!scrollArrows) return <TabsVariantContext.Provider value={variant}>{strip}</TabsVariantContext.Provider>;
    const move = (direction: -1 | 1) => {
      const node = list.current;
      if (node) node.scrollBy({ left: direction * arrowStep(node.clientWidth), behavior: "smooth" });
    };
    return (
      <TabsVariantContext.Provider value={variant}>
        <div className="relative flex min-w-0 items-end" {...slotAttributes(tabsScrollerStyle, {})}>
          {edges.start ? (
            <button type="button" aria-label={t("tabs.scrollPrevious")} onClick={() => move(-1)} {...slotAttributes(tabsScrollArrowStyle, { side: "start" })}>
              <ChevronIcon direction="left" />
            </button>
          ) : null}
          {strip}
          {edges.end ? (
            <button type="button" aria-label={t("tabs.scrollNext")} onClick={() => move(1)} {...slotAttributes(tabsScrollArrowStyle, { side: "end" })}>
              <ChevronIcon direction="right" />
            </button>
          ) : null}
        </div>
      </TabsVariantContext.Provider>
    );
  },
);

/**
 * Which ends of the strip hide tabs, kept current as the strip scrolls or changes size, and the
 * chosen tab brought into sight whenever it changes.
 */
function useOverflowEdges(list: { readonly current: HTMLDivElement | null }, enabled: boolean): OverflowEdges {
  const [edges, setEdges] = useState<OverflowEdges>({ start: false, end: false });
  useEffect(() => {
    const strip = list.current;
    if (!enabled || !strip) return;
    const read = () => setEdges(overflowEdges(strip.scrollLeft, strip.clientWidth, strip.scrollWidth));
    const reveal = () => {
      const chosen = strip.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      chosen?.scrollIntoView({ block: "nearest", inline: "nearest" });
      read();
    };
    reveal();
    strip.addEventListener("scroll", read, { passive: true });
    const sizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    sizes?.observe(strip);
    const states = new MutationObserver(reveal);
    states.observe(strip, { attributes: true, subtree: true, attributeFilter: ["data-state"] });
    return () => {
      strip.removeEventListener("scroll", read);
      sizes?.disconnect();
      states.disconnect();
    };
  }, [list, enabled]);
  return edges;
}

function ChevronIcon({ direction }: { readonly direction: "left" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M8.84 3.14a.5.5 0 0 1 .02.7L5.44 7.5l3.42 3.66a.5.5 0 1 1-.73.68l-3.75-4a.5.5 0 0 1 0-.68l3.75-4a.5.5 0 0 1 .71-.02Z" : "M6.16 3.14a.5.5 0 0 1 .7.02l3.75 4a.5.5 0 0 1 0 .68l-3.75 4a.5.5 0 1 1-.73-.68L9.56 7.5 6.14 3.84a.5.5 0 0 1 .02-.7Z"}
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Keeps the ink under the chosen trigger: its offset and width are written as `--x` and `--w` on
 * the ink whenever the chosen tab changes, or the strip or any tab changes size.
 *
 * <p>Read from the DOM because the list does not know the value; Radix marks the chosen trigger
 * with `data-state="active"`, and a mutation observer on that attribute is what follows it.
 */
function useTabInk(
  list: { readonly current: HTMLDivElement | null },
  ink: { readonly current: HTMLSpanElement | null },
) {
  useLayoutEffect(() => {
    const strip = list.current;
    const mark = ink.current;
    if (!strip || !mark) return;
    const place = () => {
      const chosen = strip.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      mark.style.setProperty("--x", `${chosen ? chosen.offsetLeft : 0}px`);
      mark.style.setProperty("--w", `${chosen ? chosen.offsetWidth : 0}px`);
    };
    // A tab changes width without the strip changing (the design's stylesheet arriving, a font, a
    // count), so each trigger is watched as well as the strip.
    const sizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    const watch = () => {
      sizes?.disconnect();
      sizes?.observe(strip);
      strip.querySelectorAll<HTMLElement>('[role="tab"]').forEach((tab) => sizes?.observe(tab));
    };
    place();
    watch();
    const states = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) watch();
      place();
    });
    states.observe(strip, { attributes: true, attributeFilter: ["data-state"], subtree: true, childList: true });
    return () => {
      states.disconnect();
      sizes?.disconnect();
    };
  }, [list, ink]);
}

TabsList.displayName = "TabsList";

// ── Trigger ──

export type TabsTriggerProps = ComponentPropsWithRef<
  typeof TabsPrimitive.Trigger
>;

const triggerBase =
  "inline-flex items-center justify-center whitespace-nowrap disabled:pointer-events-none";

/** Layout classes of the trigger per variant. */
const triggerByVariant: Record<TabsVariant, string> = {
  default: "",
  full: "",
  bookmark: "[&_svg]:size-4",
  underline: "relative [&_svg]:size-4",
};

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...rest }, ref) => {
    const variant = useContext(TabsVariantContext);
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(triggerBase, triggerByVariant[variant], className)}
        {...rest}
        {...slotAttributes(tabsTriggerStyle, { variant })}
      />
    );
  },
);

TabsTrigger.displayName = "TabsTrigger";

// ── Content ──

export interface TabsContentProps
  extends ComponentPropsWithRef<typeof TabsPrimitive.Content> {
  /**
   * Insets the panel from the strip above it and from whatever follows.
   *
   * <p><b>The same step top and bottom.</b> It was `pt-4 pb-8`, and the extra step at the bottom
   * is the floor a list-detail page grows when its detail opens: the list column carries no
   * padding of its own, so while the list runs past the panel the bottom step is never seen, and
   * the moment the panel clips everything to one box it appears as a margin that belongs to
   * nothing. A reader resizing the window watches it change, because the leftover height changes
   * and the step does not.
   *
   * @default false
   */
  padded?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, padded = false, ...rest }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      // The panel a tab brings up rises into place as it fades in, so the switch reads as the
      // content changing rather than the page blinking.
      className={cn(
        "flex-1 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
        className,
      )}
      {...rest}
      {...slotAttributes(tabsContentStyle, { padded })}
    />
  ),
);

TabsContent.displayName = "TabsContent";
