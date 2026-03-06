import DOMPurify from "dompurify";

/**
 * Sanitize an HTML string by stripping dangerous tags and attributes.
 *
 * @remarks
 * Uses DOMPurify under the hood. Suitable for cleaning user-generated
 * HTML content before rendering.
 *
 * @param dirty - Untrusted HTML string.
 * @returns Sanitized HTML string with dangerous elements removed.
 *
 * @example
 * ```ts
 * const safe = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
 * // → '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}
