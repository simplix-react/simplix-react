import { createSelfResolving } from "../../provider/self-resolving";
import { cn } from "../../utils/cn";

/** Props for the {@link Skeleton} component. */
export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function SkeletonBase({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export const Skeleton = createSelfResolving("Skeleton", SkeletonBase);
