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
export type TabsVariant = "default" | "full" | "bookmark";

/**
 * Propagates the list variant down to each {@link TabsTrigger} so triggers
 * adapt their styling automatically — callers only set `variant` on the list.
 */
const TabsVariantContext = createContext<TabsVariant>("default");

// ── List ──

export interface TabsListProps
  extends ComponentPropsWithRef<typeof TabsPrimitive.List> {
  /**
   * Visual style variant. Triggers adapt automatically via context.
   * - `"default"` — inline segmented control, auto-width.
   * - `"full"` — spans full width with top margin; triggers auto-expand to equal widths.
   * - `"bookmark"` — folder-style tabs sitting on a bottom border line.
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
            ? "flex items-end gap-0 border-b-2 border-border px-2"
            : cn(
                "h-9 items-center justify-center rounded-lg border border-input bg-card p-1 text-muted-foreground",
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
    "gap-2 rounded-t-lg border-2 border-transparent border-b-0 px-4 py-2.5 font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=active]:-mb-0.5 data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:font-bold data-[state=active]:text-foreground [&_svg]:size-4",
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
   * Adds bottom padding for scrollable containers.
   *
   * @default false
   */
  padded?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, padded = false, ...rest }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("flex-1 outline-none", padded && "pt-4 pb-8", className)}
      {...rest}
    />
  ),
);

TabsContent.displayName = "TabsContent";
