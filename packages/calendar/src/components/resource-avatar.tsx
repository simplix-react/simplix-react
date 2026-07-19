import { useState } from "react";

import { cn } from "../lib/cn";
import { getInitials } from "../helpers";

interface ResourceAvatarProps {
  name: string;
  /** Avatar image URL; when absent an initials circle is rendered instead. */
  src?: string;
  /** Image shown when `src` fails to load; when it also fails, initials render. */
  fallbackSrc?: string;
  className?: string;
}

/**
 * Avatar circle for a resource: the image when its URL loads, then the
 * fallback image, then an initials circle. Load failures are expected — avatar
 * endpoints commonly 404 for resources without an uploaded picture.
 */
export function ResourceAvatar({ name, src, fallbackSrc, className }: ResourceAvatarProps) {
  const [failed, setFailed] = useState<"none" | "src" | "fallback">("none");

  const effectiveSrc =
    failed === "none" ? src : failed === "src" && fallbackSrc !== src ? fallbackSrc : undefined;

  if (effectiveSrc) {
    return (
      <img
        src={effectiveSrc}
        alt=""
        aria-hidden
        onError={() => setFailed(failed === "none" ? "src" : "fallback")}
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
