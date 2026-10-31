import Handlebars from "handlebars";

import { toCamelCase, toPascalCase, toKebabCase } from "./case.js";

// Register helpers
Handlebars.registerHelper("pascalCase", (str: string) => toPascalCase(str));

Handlebars.registerHelper("camelCase", (str: string) => toCamelCase(str));

Handlebars.registerHelper("kebabCase", (str: string) => toKebabCase(str));

Handlebars.registerHelper("json", (obj: unknown) => {
  return JSON.stringify(obj, null, 2);
});

Handlebars.registerHelper("eq", (a: unknown, b: unknown) => {
  return a === b;
});

Handlebars.registerHelper("or", (...args: unknown[]) => {
  // Last arg is the Handlebars options object
  const values = args.slice(0, -1);
  return values.some(Boolean);
});

// Literal double-brace helpers for JSX object expressions in templates
Handlebars.registerHelper("ldb", () => "{{");
Handlebars.registerHelper("rdb", () => "}}");

Handlebars.registerHelper("and", (...args: unknown[]) => {
  const values = args.slice(0, -1);
  return values.every(Boolean);
});

Handlebars.registerHelper("not", (value: unknown) => {
  return !value;
});

Handlebars.registerHelper("neq", (a: unknown, b: unknown) => {
  return a !== b;
});

Handlebars.registerHelper("ifIncludes", function (
  this: unknown,
  arr: string[],
  value: string,
  options: Handlebars.HelperOptions,
) {
  if (Array.isArray(arr) && arr.includes(value)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

/**
 * The expression naming a record held in `target` by `fields`, in order: one field reads as a
 * string, several are joined by a space with the empty parts left out.
 */
Handlebars.registerHelper("recordName", (target: string, fields: unknown) => {
  const names = Array.isArray(fields) ? fields.filter((one): one is string => typeof one === "string") : [];
  if (names.length <= 1) return `String(${target}.${names[0] ?? "id"} ?? "")`;
  return `[${names.map((name) => `${target}.${name}`).join(", ")}].filter((part) => part != null && part !== "").map(String).join(" ")`;
});

export function renderTemplate(
  template: string,
  data: Record<string, unknown>,
): string {
  const compiled = Handlebars.compile(template, { noEscape: true });
  return compiled(data);
}

/**
 * Load and render a Handlebars template with the given data.
 * Templates are imported as strings (inlined at build time via tsup loader).
 */
export function loadTemplate(
  template: string,
  data: Record<string, unknown>,
): string {
  return renderTemplate(template, data);
}
