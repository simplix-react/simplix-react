import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../utils/cn";

// Root - pass through
export const Tabs = TabsPrimitive.Root;

// List
export type TabsListProps = ComponentPropsWithRef<typeof TabsPrimitive.List>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...rest }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...rest}
    />
  ),
);

TabsList.displayName = "TabsList";

// Trigger
export type TabsTriggerProps = ComponentPropsWithRef<
  typeof TabsPrimitive.Trigger
>;

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...rest }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      {...rest}
    />
  ),
);

TabsTrigger.displayName = "TabsTrigger";

// Content
export type TabsContentProps = ComponentPropsWithRef<
  typeof TabsPrimitive.Content
>;

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...rest }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("flex-1 outline-none", className)}
      {...rest}
    />
  ),
);

TabsContent.displayName = "TabsContent";
