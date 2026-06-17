import { forwardRef } from "react";

import { createSelfResolving } from "../provider/self-resolving";
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
export const FlexBase = forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = "row", ...rest }, ref) => (
    <Stack ref={ref} direction={direction} {...rest} />
  ),
);
FlexBase.displayName = "Flex";

export const Flex = createSelfResolving("Flex", FlexBase);
