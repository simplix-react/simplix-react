import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  type ComponentPropsWithRef,
  createContext,
  forwardRef,
  useContext,
} from "react";

import { slotAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import { tabsContentStyle, tabsListStyle, tabsTriggerStyle } from "./tabs.style";

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
  full: "h-9 items-center justify-center flex w-full [&>*]:flex-1",
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
  ({ className, variant = "default", ...rest }, ref) => (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(listLayout[variant], className)}
        {...rest}
        {...slotAttributes(tabsListStyle, { variant })}
      />
    </TabsVariantContext.Provider>
  ),
);

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
