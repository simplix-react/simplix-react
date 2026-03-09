import { describe, it, expect } from "vitest";
import { renderTemplate, loadTemplate } from "../utils/template.js";

describe("renderTemplate", () => {
  it("renders simple variables", () => {
    const result = renderTemplate("Hello {{name}}", { name: "World" });
    expect(result).toBe("Hello World");
  });

  it("renders with noEscape (HTML is not escaped)", () => {
    const result = renderTemplate("{{html}}", { html: "<div>test</div>" });
    expect(result).toBe("<div>test</div>");
  });
});

describe("Handlebars helpers", () => {
  describe("pascalCase", () => {
    it("converts to PascalCase in template", () => {
      const result = renderTemplate("{{pascalCase name}}", { name: "my-component" });
      expect(result).toBe("MyComponent");
    });
  });

  describe("camelCase", () => {
    it("converts to camelCase in template", () => {
      const result = renderTemplate("{{camelCase name}}", { name: "my-component" });
      expect(result).toBe("myComponent");
    });
  });

  describe("kebabCase", () => {
    it("converts to kebab-case in template", () => {
      const result = renderTemplate("{{kebabCase name}}", { name: "MyComponent" });
      expect(result).toBe("my-component");
    });
  });

  describe("json", () => {
    it("serializes object to JSON", () => {
      const result = renderTemplate("{{json data}}", { data: { a: 1, b: "two" } });
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({ a: 1, b: "two" });
    });
  });

  describe("eq", () => {
    it("returns true for equal values", () => {
      const result = renderTemplate(
        "{{#if (eq status 'active')}}yes{{else}}no{{/if}}",
        { status: "active" },
      );
      expect(result).toBe("yes");
    });

    it("returns false for different values", () => {
      const result = renderTemplate(
        "{{#if (eq status 'active')}}yes{{else}}no{{/if}}",
        { status: "inactive" },
      );
      expect(result).toBe("no");
    });
  });

  describe("neq", () => {
    it("returns true for different values", () => {
      const result = renderTemplate(
        "{{#if (neq a b)}}different{{else}}same{{/if}}",
        { a: "x", b: "y" },
      );
      expect(result).toBe("different");
    });

    it("returns false for equal values", () => {
      const result = renderTemplate(
        "{{#if (neq a b)}}different{{else}}same{{/if}}",
        { a: "x", b: "x" },
      );
      expect(result).toBe("same");
    });
  });

  describe("or", () => {
    it("returns true if any arg is truthy", () => {
      const result = renderTemplate(
        "{{#if (or a b)}}yes{{else}}no{{/if}}",
        { a: false, b: true },
      );
      expect(result).toBe("yes");
    });

    it("returns false if all args are falsy", () => {
      const result = renderTemplate(
        "{{#if (or a b)}}yes{{else}}no{{/if}}",
        { a: false, b: false },
      );
      expect(result).toBe("no");
    });
  });

  describe("and", () => {
    it("returns true if all args are truthy", () => {
      const result = renderTemplate(
        "{{#if (and a b)}}yes{{else}}no{{/if}}",
        { a: true, b: true },
      );
      expect(result).toBe("yes");
    });

    it("returns false if any arg is falsy", () => {
      const result = renderTemplate(
        "{{#if (and a b)}}yes{{else}}no{{/if}}",
        { a: true, b: false },
      );
      expect(result).toBe("no");
    });
  });

  describe("not", () => {
    it("negates truthy value", () => {
      const result = renderTemplate(
        "{{#if (not flag)}}hidden{{else}}visible{{/if}}",
        { flag: true },
      );
      expect(result).toBe("visible");
    });

    it("negates falsy value", () => {
      const result = renderTemplate(
        "{{#if (not flag)}}hidden{{else}}visible{{/if}}",
        { flag: false },
      );
      expect(result).toBe("hidden");
    });
  });

  describe("ldb / rdb", () => {
    it("renders literal double braces", () => {
      const result = renderTemplate("{{ldb}} value {{rdb}}", {});
      expect(result).toBe("{{ value }}");
    });
  });

  describe("ifIncludes", () => {
    it("renders block when array includes value", () => {
      const result = renderTemplate(
        "{{#ifIncludes roles 'admin'}}admin{{else}}none{{/ifIncludes}}",
        { roles: ["admin", "user"] },
      );
      expect(result).toBe("admin");
    });

    it("renders inverse when array does not include value", () => {
      const result = renderTemplate(
        "{{#ifIncludes roles 'admin'}}admin{{else}}none{{/ifIncludes}}",
        { roles: ["user", "guest"] },
      );
      expect(result).toBe("none");
    });

    it("renders inverse when value is not an array", () => {
      const result = renderTemplate(
        "{{#ifIncludes roles 'admin'}}admin{{else}}none{{/ifIncludes}}",
        { roles: null },
      );
      expect(result).toBe("none");
    });
  });
});

describe("loadTemplate", () => {
  it("is an alias for renderTemplate", () => {
    const result = loadTemplate("{{name}}", { name: "test" });
    expect(result).toBe("test");
  });
});
