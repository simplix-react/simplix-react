import Handlebars from "handlebars";

// Register helpers
Handlebars.registerHelper("pascalCase", (str: string) => {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
});

Handlebars.registerHelper("camelCase", (str: string) => {
  const pascal = str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
});

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
