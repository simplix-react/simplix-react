import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef, type ReactNode } from "react";

import { slotAttributes, slotClassNames } from "../design/slot-style";
import { cn } from "../utils/cn";
import { containerStyle } from "./container.style";

/** CVA variants for the Container component max-width configuration. */
const containerLayout = cva("w-full", {
  variants: {
    size: {
      "2xl": "max-w-2xl",
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      full: "max-w-full",
    },
  },
  defaultVariants: { size: "lg" },
});

/** The container's drawn look (centring, gutter) as a class-string function. */
const containerLook = slotClassNames(containerStyle);

/** Class string for a container of the given size: its layout classes plus its drawn look. */
const containerVariants = (props?: ContainerVariants): string =>
  cn(containerLayout(props), containerLook(props));

/** Variant props extracted from {@link containerVariants}. */
export type ContainerVariants = VariantProps<typeof containerLayout>;

/** Props for the {@link Container} layout component. */
export interface ContainerProps
  extends ComponentPropsWithRef<"div">,
    ContainerVariants {
  children?: ReactNode;
}

/**
 * Centered, max-width container with horizontal padding.
 *
 * @example
 * ```tsx
 * <Container size="lg">
 *   <h1>Page Content</h1>
 * </Container>
 * ```
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(containerLayout({ size }), className)}
      {...rest}
      {...slotAttributes(containerStyle, {})}
    >
      {children}
    </div>
  ),
);
Container.displayName = "Container";

export { containerVariants };
