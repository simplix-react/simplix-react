import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge NativeWind class names with Tailwind-aware conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Convert a human label to a kebab-case testID segment. */
export function toTestId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
