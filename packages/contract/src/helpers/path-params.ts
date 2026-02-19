/**
 * Extracts `:paramName` placeholders from a URL path template.
 *
 * @param path - URL path template with `:paramName` placeholders.
 * @returns Array of parameter names found in the path.
 *
 * @example
 * ```ts
 * extractPathParams("/products/:id");
 * // ["id"]
 *
 * extractPathParams("/tenants/:tenantId/products/:productId");
 * // ["tenantId", "productId"]
 * ```
 */
export function extractPathParams(path: string): string[] {
  const matches = path.match(/:(\w+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

/**
 * Substitutes `:paramName` placeholders in a URL path with actual values.
 *
 * @param path - URL path template with `:paramName` placeholders.
 * @param params - Map of parameter names to their string values.
 * @returns The resolved URL path with all placeholders replaced.
 * @throws Error if a required path parameter is missing.
 *
 * @example
 * ```ts
 * interpolatePath("/products/:id", { id: "abc" });
 * // "/products/abc"
 * ```
 */
export function interpolatePath(
  path: string,
  params: Record<string, string>,
): string {
  return path.replace(/:(\w+)/g, (_, key: string) => {
    const value = params[key];
    if (!value) throw new Error(`Missing path param: ${key}`);
    return encodeURIComponent(value);
  });
}