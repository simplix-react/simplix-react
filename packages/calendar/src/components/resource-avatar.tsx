import { cn } from "../lib/cn";
import { getInitials } from "../helpers";

interface ResourceAvatarProps {
  name: string;
  /** Avatar image URL; when absent an initials circle is rendered instead. */
  src?: string;
  className?: string;
}

/** Avatar circle for a resource: an image when a URL is given, initials otherwise. */
export function ResourceAvatar({ name, src, className }: ResourceAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn("size-6 shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-semibold text-muted-foreground",
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}
