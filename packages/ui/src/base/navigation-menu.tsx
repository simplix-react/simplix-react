import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../utils/cn";

// Root (composite — renders Root + conditional Viewport)
export type NavigationMenuProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.Root
> & {
  viewport?: boolean;
};

export function NavigationMenu({
  className,
  children,
  viewport = true,
  ...rest
}: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...rest}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

// List
export type NavigationMenuListProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.List
>;

export const NavigationMenuList = forwardRef<
  HTMLUListElement,
  NavigationMenuListProps
>(({ className, ...rest }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    data-slot="navigation-menu-list"
    className={cn(
      "group flex flex-1 list-none items-center justify-center gap-1",
      className,
    )}
    {...rest}
  />
));

NavigationMenuList.displayName = "NavigationMenuList";

// Item
export type NavigationMenuItemProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.Item
>;

export const NavigationMenuItem = forwardRef<
  HTMLLIElement,
  NavigationMenuItemProps
>(({ className, ...rest }, ref) => (
  <NavigationMenuPrimitive.Item
    ref={ref}
    data-slot="navigation-menu-item"
    className={cn("relative", className)}
    {...rest}
  />
));

NavigationMenuItem.displayName = "NavigationMenuItem";

// Trigger style (exported for reuse)
export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

// Trigger
export type NavigationMenuTriggerProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.Trigger
>;

export const NavigationMenuTrigger = forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(({ className, children, ...rest }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    data-slot="navigation-menu-trigger"
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...rest}
  >
    {children}{" "}
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    >
      <path
        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  </NavigationMenuPrimitive.Trigger>
));

NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

// Content
export type NavigationMenuContentProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.Content
>;

export const NavigationMenuContent = forwardRef<
  HTMLDivElement,
  NavigationMenuContentProps
>(({ className, ...rest }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    data-slot="navigation-menu-content"
    className={cn(
      "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
      "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
      className,
    )}
    {...rest}
  />
));

NavigationMenuContent.displayName = "NavigationMenuContent";

// Viewport
export type NavigationMenuViewportProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.Viewport
>;

export const NavigationMenuViewport = forwardRef<
  HTMLDivElement,
  NavigationMenuViewportProps
>(({ className, ...rest }, ref) => (
  <div className="absolute top-full left-0 isolate z-50 flex justify-center">
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      data-slot="navigation-menu-viewport"
      className={cn(
        "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      {...rest}
    />
  </div>
));

NavigationMenuViewport.displayName = "NavigationMenuViewport";

// Link
export type NavigationMenuLinkProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.Link
>;

export const NavigationMenuLink = forwardRef<
  HTMLAnchorElement,
  NavigationMenuLinkProps
>(({ className, ...rest }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    data-slot="navigation-menu-link"
    className={cn(
      "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
      className,
    )}
    {...rest}
  />
));

NavigationMenuLink.displayName = "NavigationMenuLink";

// Indicator
export type NavigationMenuIndicatorProps = ComponentPropsWithRef<
  typeof NavigationMenuPrimitive.Indicator
>;

export const NavigationMenuIndicator = forwardRef<
  HTMLDivElement,
  NavigationMenuIndicatorProps
>(({ className, ...rest }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    data-slot="navigation-menu-indicator"
    className={cn(
      "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
      className,
    )}
    {...rest}
  >
    <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));

NavigationMenuIndicator.displayName = "NavigationMenuIndicator";
