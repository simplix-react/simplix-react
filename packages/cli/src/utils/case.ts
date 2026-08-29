export function toPascalCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * The one spelling of an entity name every lookup is keyed by: a leading lowercase letter.
 *
 * A generated contract, an OpenAPI snapshot and the endpoint generator all name an entity that
 * way, and each of them matches the name by equality or by a case-sensitive pattern. A CLI
 * argument is typed by a person and arrives however the entity reads naturally — `ApiClient`,
 * `apiClient`, `api-client` — so without this every spelling but one silently matched a different
 * subset of the sources, and a run wired the hooks or wrote the pages but never both.
 *
 * A separator is what says the argument is not camelCase already. Without one only the first
 * letter moves, so a name carrying an acronym or a digit — `iso27001Control` — keeps every other
 * letter it was given; routing it through {@link toCamelCase} would lowercase the `C`.
 *
 * @param str the entity as the argument spells it
 * @returns the entity as every lookup spells it
 */
export function toEntityName(str: string): string {
  const camel = /[-_\s]/.test(str) ? toCamelCase(str) : str;
  return camel.charAt(0).toLowerCase() + camel.slice(1);
}
