import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  type ComponentPropsWithRef,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { tabsContentStyle, tabsInkStyle, tabsListStyle, tabsTriggerStyle } from "./tabs.style";

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
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", children, ...rest }, ref) => {
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
    return (
      <TabsVariantContext.Provider value={variant}>
        <TabsPrimitive.List
          ref={setList}
          className={cn("relative", listLayout[variant], className)}
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
      </TabsVariantContext.Provider>
    );
  },
);

/**
 * Keeps the ink under the chosen trigger: its offset and width are written as `--x` and `--w` on
 * the ink whenever the chosen tab changes or the strip changes size.
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
    place();
    const states = new MutationObserver(place);
    states.observe(strip, { attributes: true, attributeFilter: ["data-state"], subtree: true, childList: true });
    const sizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    sizes?.observe(strip);
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
      className={cn("flex-1", className)}
      {...rest}
      {...slotAttributes(tabsContentStyle, { padded })}
    />
  ),
);

TabsContent.displayName = "TabsContent";
