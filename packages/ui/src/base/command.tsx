import { type ComponentPropsWithRef, forwardRef } from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "../utils/cn";
import { MagnifyingGlassIcon } from "../crud/shared/icons";

const Command = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  ),
);
Command.displayName = "Command";

const CommandInput = forwardRef<HTMLInputElement, ComponentPropsWithRef<typeof CommandPrimitive.Input>>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
CommandInput.displayName = "CommandInput";

const CommandList = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  ),
);
CommandList.displayName = "CommandList";

const CommandEmpty = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Empty>>(
  (props, ref) => (
    <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
  ),
);
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Separator>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
  ),
);
CommandSeparator.displayName = "CommandSeparator";

const CommandItem = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  ),
);
CommandItem.displayName = "CommandItem";

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
};
