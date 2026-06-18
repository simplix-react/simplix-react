import * as SelectPrimitive from "@radix-ui/react-select";
import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../../utils/cn";
import { FieldChevron } from "./field-chevron";

// Root - pass through
export const Select = SelectPrimitive.Root;

// Value - pass through
export const SelectValue = SelectPrimitive.Value;

// Group - pass through
export const SelectGroup = SelectPrimitive.Group;

// Trigger
export const selectTriggerVariants = cva(
  "flex w-full items-center justify-between rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      size: {
        default: "h-8 px-3 py-1.5 text-sm",
        sm: "h-7 px-2 py-1 text-xs",
        xs: "h-6 px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>;

export interface SelectTriggerProps
  extends ComponentPropsWithRef<typeof SelectPrimitive.Trigger>,
    SelectTriggerVariants {}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, size, children, ...rest }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(selectTriggerVariants({ size }), className)}
      {...rest}
    >
      {children}
      <FieldChevron className="-mr-1.5" />
    </SelectPrimitive.Trigger>
  ),
);

SelectTrigger.displayName = "SelectTrigger";

// Content
export type SelectContentProps = ComponentPropsWithRef<
  typeof SelectPrimitive.Content
>;

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = "popper", ...rest }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...rest}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);

SelectContent.displayName = "SelectContent";

// Item
// TODO: SelectItem tag right-alignment — Radix ItemText renders as inline span,
// preventing flex-based right-alignment of tag content inside children.
// Options: (1) Add `trailing` prop to SelectItem rendered outside ItemText,
// (2) Use Radix's SelectItemText portal behavior to separate trigger vs dropdown rendering.
export type SelectItemProps = ComponentPropsWithRef<
  typeof SelectPrimitive.Item
>;

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...rest }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...rest}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
          >
            <path
              d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
);

SelectItem.displayName = "SelectItem";

// Label
export type SelectLabelProps = ComponentPropsWithRef<
  typeof SelectPrimitive.Label
>;

export const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...rest }, ref) => (
    <SelectPrimitive.Label
      ref={ref}
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...rest}
    />
  ),
);

SelectLabel.displayName = "SelectLabel";

// Separator
export type SelectSeparatorProps = ComponentPropsWithRef<
  typeof SelectPrimitive.Separator
>;

export const SelectSeparator = forwardRef<
  HTMLDivElement,
  SelectSeparatorProps
>(({ className, ...rest }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...rest}
  />
));

SelectSeparator.displayName = "SelectSeparator";
