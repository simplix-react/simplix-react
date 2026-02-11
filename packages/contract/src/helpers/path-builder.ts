/**
 * Substitutes `:paramName` placeholders in a URL path template with actual values.
 *
 * Values are URI-encoded to ensure safe inclusion in URLs. Used internally by
 * {@link deriveClient} for building operation URLs, and available as a public
 * utility for custom URL construction.
 *
 * @param template - URL path template with `:paramName` placeholders.
 * @param params - Map of parameter names to their string values.
 * @returns The resolved URL path with all placeholders replaced.
 *
 * @example
 * ```ts
 * import { buildPath } from "@simplix-react/contract";
 *
 * buildPath("/projects/:projectId/tasks", { projectId: "abc" });
 * // "/projects/abc/tasks"
 *
 * buildPath("/tasks/:taskId/assign", { taskId: "task-1" });
 * // "/tasks/task-1/assign"
 * ```
 */
export function buildPath(
  template: string,
  params: Record<string, string> = {},
): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(value));
  }
  return result;
}
