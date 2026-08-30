import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  type ComponentPropsWithRef,
  createContext,
  forwardRef,
  useContext,
} from "react";

import { cn } from "../../utils/cn";

// Root - pass through
export const Tabs = TabsPrimitive.Root;

/** Visual style variants shared by {@link TabsList} and {@link TabsTrigger}. */
export type TabsVariant = "default" | "full" | "bookmark" | "underline";

/**
 * Propagates the list variant down to each {@link TabsTrigger} so triggers
 * adapt their styling automatically — callers only set `variant` on the list.
 */
const TabsVariantContext = createContext<TabsVariant>("default");

/**
 * Bottom-baseline track for the `bookmark` list variant. The line is an inset
 * shadow (not a border) so the active tab's `bg-card` covers it without relying
 * on overflow — the cutout survives `overflow-x-auto` horizontal scroll.
 */
const lineListBase = "flex items-end px-2 shadow-[inset_0_-2px_0_0_var(--border)]";

/**
 * Bottom baseline for the `underline` list variant.
 *
 * <p>A hairline rather than the 2px `bookmark` sits on: these tabs are a second level inside a
 * surface that already has tabs above it, and the thing that has to read as quieter is the line
 * as much as the triggers. Full width so the baseline runs the width of the panel and the tabs
 * sit on it from the start, which is where a reader looks for a second level.
 */
const underlineListBase =
  "mt-2 flex w-full items-end gap-1 shadow-[inset_0_-1px_0_0_var(--border)]";

// ── List ──

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
        className={cn(
          variant === "bookmark"
            ? cn(lineListBase, "gap-0")
            : variant === "underline"
            ? underlineListBase
            : cn(
                // Vertical padding is half the horizontal one so the 28px trigger fits inside the
                // 34px content box of an h-9 bordered track. With `p-1` the trigger overflows the
                // box by 2px — invisible on its own, but a list wrapped in `overflow-x-auto` has
                // its overflow-y computed to `auto` as well, and that 1px of bottom overflow paints
                // a scrollbar. `items-center` keeps the trigger exactly where `p-1` rendered it.
                "h-9 items-center justify-center rounded-lg border border-input bg-card px-1 py-0.5 text-muted-foreground",
                variant === "full"
                  ? "mt-3 flex w-full [&>*]:flex-1"
                  : "inline-flex",
              ),
          className,
        )}
        {...rest}
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
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

const triggerByVariant: Record<TabsVariant, string> = {
  default:
    "rounded-md px-3 py-1 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:hover:text-primary-foreground",
  full: "rounded-md px-3 py-1 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:hover:text-primary-foreground",
  bookmark:
    "gap-2 rounded-t-lg border border-transparent border-b-0 px-4 py-2.5 font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:-mb-px data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold data-[state=active]:text-foreground [&_svg]:size-4",
  // The rule is drawn as a border on the trigger itself and it is transparent when the tab is not
  // chosen, so the label never moves as the choice changes — a rule added on the active state
  // alone shifts every label up by its own width the moment it appears.
  underline:
    "relative -mb-px gap-2 rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground [&_svg]:size-4",
};

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...rest }, ref) => {
    const variant = useContext(TabsVariantContext);
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(triggerBase, triggerByVariant[variant], className)}
        {...rest}
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
      className={cn(
        // `outline-none` on the panel, and only on the panel. Radix moves focus here when a tab is
        // chosen so the next Tab lands inside; it is a region rather than a control, and the first
        // control in it rings normally.
        "flex-1 outline-none",
        padded && "py-4",
        className,
      )}
      {...rest}
    />
  ),
);

TabsContent.displayName = "TabsContent";
