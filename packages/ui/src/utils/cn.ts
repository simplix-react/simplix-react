import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution.
 *
 * @remarks
 * Combines `clsx` for conditional classes with `tailwind-merge`
 * for deduplicating and resolving Tailwind utility conflicts.
 *
 * @param inputs - Class values (strings, arrays, objects, or falsy values).
 * @returns Merged class name string.
 *
 * @example
 * ```ts
 * cn("px-2 py-1", isActive && "bg-primary", className);
 * // → "px-2 py-1 bg-primary ..."
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a label string to a kebab-case `data-testid` value.
 *
 * @param label - Human-readable label (e.g. `"First Name"`).
 * @returns Kebab-case test ID (e.g. `"first-name"`).
 *
 * @example
 * ```ts
 * toTestId("First Name"); // "first-name"
 * toTestId("email");      // "email"
 * ```
 */
export function toTestId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
