import { type ComponentPropsWithRef, forwardRef } from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "../../utils/cn";
import { slotAttributes } from "../../design/slot-style";
import {
  commandEmptyStyle,
  commandGroupStyle,
  commandInputIconStyle,
  commandInputStyle,
  commandInputWrapperStyle,
  commandItemStyle,
  commandSeparatorStyle,
  commandStyle,
} from "./command.style";
import { MagnifyingGlassIcon } from "../../crud/shared/icons";

const Command = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn("flex h-full w-full flex-col overflow-hidden", className)}
      {...props}
      {...slotAttributes(commandStyle, {})}
    />
  ),
);
Command.displayName = "Command";

const CommandInput = forwardRef<HTMLInputElement, ComponentPropsWithRef<typeof CommandPrimitive.Input>>(
  ({ className, ...props }, ref) => (
    <div
      className="flex items-center"
      cmdk-input-wrapper=""
      {...slotAttributes(commandInputWrapperStyle, {})}
    >
      <MagnifyingGlassIcon
        className="h-4 w-4 shrink-0"
        {...slotAttributes(commandInputIconStyle, {})}
      />
      <CommandPrimitive.Input
        ref={ref}
        className={cn("flex w-full disabled:cursor-not-allowed", className)}
        {...props}
        {...slotAttributes(commandInputStyle, {})}
      />
    </div>
  ),
);
CommandInput.displayName = "CommandInput";

const CommandList = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-75 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  ),
);
CommandList.displayName = "CommandList";

const CommandEmpty = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Empty>>(
  (props, ref) => (
    <CommandPrimitive.Empty
      ref={ref}
      {...props}
      {...slotAttributes(commandEmptyStyle, {})}
    />
  ),
);
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn("overflow-hidden", className)}
      {...props}
      {...slotAttributes(commandGroupStyle, {})}
    />
  ),
);
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Separator>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("h-px", className)}
      {...props}
      {...slotAttributes(commandSeparatorStyle, {})}
    />
  ),
);
CommandSeparator.displayName = "CommandSeparator";

const CommandItem = forwardRef<HTMLDivElement, ComponentPropsWithRef<typeof CommandPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center data-[disabled=true]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
      {...slotAttributes(commandItemStyle, {})}
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
