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
export function Flex({ direction = "row", ...rest }: FlexProps) {
  return <Stack direction={direction} {...rest} />;
}
