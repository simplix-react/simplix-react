import { createSelfResolving } from "../../provider/self-resolving";
import { slotAttributes } from "../../design/slot-style";
import { skeletonStyle } from "./skeleton.style";

/** Props for the {@link Skeleton} component. */
export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function SkeletonBase({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={className}
      {...props}
      {...slotAttributes(skeletonStyle, {})}
    />
  );
}

export const Skeleton = createSelfResolving("Skeleton", SkeletonBase);
