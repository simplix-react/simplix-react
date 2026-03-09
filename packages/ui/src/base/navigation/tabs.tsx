import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../../utils/cn";

// Root - pass through
export const Tabs = TabsPrimitive.Root;

// ── List ──

export interface TabsListProps
  extends ComponentPropsWithRef<typeof TabsPrimitive.List> {
  /**
   * Visual style variant.
   * - `"default"` — inline, auto-width.
   * - `"full"` — spans full width with top margin; triggers auto-expand to equal widths.
   *
   * @default "default"
   */
  variant?: "default" | "full";
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", ...rest }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        variant === "full"
          ? "mt-3 flex w-full [&>*]:flex-1"
          : "inline-flex",
        className,
      )}
      {...rest}
    />
  ),
);

TabsList.displayName = "TabsList";

// ── Trigger ──

export type TabsTriggerProps = ComponentPropsWithRef<
  typeof TabsPrimitive.Trigger
>;

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...rest }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      {...rest}
    />
  ),
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
