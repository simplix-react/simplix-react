import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef, type ReactNode, useContext } from "react";

import { UIComponentContext } from "../provider/ui-component-context";
import { cn } from "../utils/cn";

/** CVA variants for the Container component max-width configuration. */
const containerVariants = cva("mx-auto w-full px-4", {
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

/** Variant props extracted from {@link containerVariants}. */
export type ContainerVariants = VariantProps<typeof containerVariants>;

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
const ContainerBase = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ size }), className)}
      {...rest}
    >
      {children}
    </div>
  ),
);
ContainerBase.displayName = "Container";

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Container) {
      return <ctx.Container {...props} />;
    }
    return <ContainerBase ref={ref} {...props} />;
  },
);
Container.displayName = "Container";

export { containerVariants };
