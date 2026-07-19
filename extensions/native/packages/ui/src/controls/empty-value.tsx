import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** Props for the {@link EmptyValue} component. */
export interface EmptyValueProps {
  className?: string;
}

/** Placeholder for absent values — renders a muted em dash. */
export function EmptyValue({ className }: EmptyValueProps) {
  return (
    <Text size="sm" tone="muted" className={cn(className)}>
      —
    </Text>
  );
}
