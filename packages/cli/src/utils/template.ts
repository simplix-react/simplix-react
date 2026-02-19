import Handlebars from "handlebars";

import { toCamelCase, toPascalCase } from "./case.js";

// Register helpers
Handlebars.registerHelper("pascalCase", (str: string) => toPascalCase(str));

Handlebars.registerHelper("camelCase", (str: string) => toCamelCase(str));

Handlebars.registerHelper("kebabCase", (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
});

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
