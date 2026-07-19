import * as TabsPrimitive from "@rn-primitives/tabs";

import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Tab entry for {@link Tabs}. */
export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  /** Muted count rendered inside the trigger. */
  count?: number;
  disabled?: boolean;
}

/** Props for the {@link Tabs} component. */
export interface TabsProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  items: Array<TabItem<T>>;
  /** `"full"` stretches triggers to equal widths (category selectors). */
  variant?: "default" | "full";
  className?: string;
}

/**
 * Tab bar for switching list categories or screen segments. Content is
 * rendered by the consumer based on `value` — the mobile grammar keeps tab
 * bodies as sibling screens rather than nested panels.
 */
export function Tabs<T extends string = string>({
  value,
  onValueChange,
  items,
  variant = "default",
  className,
}: TabsProps<T>) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={className}
    >
      <TabsPrimitive.List
        className={cn("flex-row border-b border-border", variant === "full" && "w-full")}
      >
        {items.map((item) => {
          const selected = value === item.value;
          return (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn(
                "h-12 flex-row items-center justify-center gap-1.5 border-b-2 px-4",
                variant === "full" && "flex-1",
                selected ? "border-primary" : "border-transparent",
                item.disabled && "opacity-50",
              )}
            >
              <Text
                size="sm"
                className={cn(
                  selected ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Text>
              {item.count !== undefined ? (
                <Text size="caption" tone="muted">
                  {item.count}
                </Text>
              ) : null}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
