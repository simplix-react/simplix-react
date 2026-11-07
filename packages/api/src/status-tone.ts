/**
 * The status tone vocabulary a server contract declares a value's tone in, and the one every
 * status badge, dot and banner of `@simplix-react/ui` draws.
 *
 * It lives here rather than in the UI package because a generated domain package declares the
 * tone of each enum value it carries (`<Enum>Tones`), and a domain package depends on this
 * package and never on the UI. `@simplix-react/ui` re-exports this type under the same name.
 *
 * @example
 * ```ts
 * import type { StatusTone } from "@simplix-react/api";
 *
 * const tone: StatusTone = EmailStatusTones[status] ?? "neutral";
 * ```
 */
export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "pending"
  | "processing";
