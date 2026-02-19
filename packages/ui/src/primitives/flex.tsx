import { forwardRef, useContext } from "react";

import { UIComponentContext } from "../provider/ui-component-context";
import { Stack, type StackProps } from "./stack";

/** Props for the {@link Flex} component (alias for {@link StackProps}). */
export type FlexProps = StackProps;

/**
 * Horizontal flex layout primitive. Shorthand for `<Stack direction="row">`.
 *
 * @example
 * ```tsx
 * <Flex gap="sm" align="center">
 *   <Button>Save</Button>
 *   <Button>Cancel</Button>
 * </Flex>
 * ```
 */
const FlexBase = forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = "row", ...rest }, ref) => (
    <Stack ref={ref} direction={direction} {...rest} />
  ),
);
FlexBase.displayName = "Flex";

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    const ctx = useContext(UIComponentContext);
    if (ctx.Flex) {
      return <ctx.Flex {...props} />;
    }
    return <FlexBase ref={ref} {...props} />;
  },
);
Flex.displayName = "Flex";
