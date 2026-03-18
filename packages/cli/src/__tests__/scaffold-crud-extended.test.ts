import { describe, it, expect } from "vitest";
import {
  parseZodType,
  getDefaultValue,
  entityFieldsToFieldInfo,
  parseSchemaFields,
} from "../commands/scaffold-crud.js";
import { renderTemplate } from "../utils/template.js";
import {
  crudPageTemplate,
  hubPageTemplate,
  treeTemplate,
  treeCrudPageTemplate,
  pageIndexTemplate,
} from "../templates/ui/index.js";
import type { EntityField } from "../openapi/types.js";

// ── entityFieldsToFieldInfo ─────────────────────────────────

describe("entityFieldsToFieldInfo", () => {
  it("converts string fields", () => {
    const fields: EntityField[] = [
      { name: "email", snakeName: "email", type: "string", format: "email", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result).toHaveLength(1);
    expect(result[0].tsType).toBe("string");
    expect(result[0].formComponent).toBe("TextField");
    expect(result[0].component).toBe("Text");
  });

  it("converts number fields", () => {
    const fields: EntityField[] = [
      { name: "age", snakeName: "age", type: "number", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].tsType).toBe("number");
    expect(result[0].formComponent).toBe("NumberField");
    expect(result[0].component).toBe("Number");
  });

  it("converts integer fields", () => {
    const fields: EntityField[] = [
      { name: "count", snakeName: "count", type: "integer", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].tsType).toBe("number");
  });

  it("converts boolean fields", () => {
    const fields: EntityField[] = [
      { name: "active", snakeName: "active", type: "boolean", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].tsType).toBe("boolean");
    expect(result[0].formComponent).toBe("SwitchField");
    expect(result[0].component).toBe("Boolean");
  });

  it("converts date-time fields", () => {
    const fields: EntityField[] = [
      { name: "createdAt", snakeName: "created_at", type: "string", format: "date-time", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].formComponent).toBe("DateField");
    expect(result[0].inputType).toBe("date");
    expect(result[0].component).toBe("Date");
  });

  it("converts date fields", () => {
    const fields: EntityField[] = [
      { name: "birthDate", snakeName: "birth_date", type: "string", format: "date", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].formComponent).toBe("DateField");
  });

  it("converts enum fields", () => {
    const fields: EntityField[] = [
      { name: "status", snakeName: "status", type: "string", enum: ["active", "inactive"], required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].formComponent).toBe("SelectField");
    expect(result[0].inputType).toBe("select");
    expect(result[0].component).toBe("Select");
    expect(result[0].options).toEqual(["active", "inactive"]);
  });

  it("skips object and array type fields", () => {
    const fields: EntityField[] = [
      { name: "id", snakeName: "id", type: "string", required: true, nullable: false, zodType: "" },
      { name: "tags", snakeName: "tags", type: "array", required: false, nullable: false, zodType: "" },
      { name: "metadata", snakeName: "metadata", type: "object", required: false, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("id");
  });

  it("detects foreign key fields", () => {
    const fields: EntityField[] = [
      { name: "categoryId", snakeName: "category_id", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].isForeignKey).toBe(true);
    expect(result[0].fkEntityField).toBe("category");
  });

  it("does not flag id as foreign key", () => {
    const fields: EntityField[] = [
      { name: "id", snakeName: "id", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].isForeignKey).toBe(false);
    expect(result[0].fkEntityField).toBeNull();
  });

  it("marks system fields", () => {
    const fields: EntityField[] = [
      { name: "id", snakeName: "id", type: "string", required: true, nullable: false, zodType: "" },
      { name: "displayOrder", snakeName: "display_order", type: "integer", required: false, nullable: false, zodType: "" },
      { name: "sortOrder", snakeName: "sort_order", type: "integer", required: false, nullable: false, zodType: "" },
      { name: "name", snakeName: "name", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result.find((f) => f.name === "id")?.isSystemField).toBe(true);
    expect(result.find((f) => f.name === "displayOrder")?.isSystemField).toBe(true);
    expect(result.find((f) => f.name === "sortOrder")?.isSystemField).toBe(true);
    expect(result.find((f) => f.name === "name")?.isSystemField).toBe(false);
  });

  it("generates correct default values", () => {
    const fields: EntityField[] = [
      { name: "count", snakeName: "count", type: "number", required: true, nullable: false, zodType: "" },
      { name: "active", snakeName: "active", type: "boolean", required: true, nullable: false, zodType: "" },
      { name: "name", snakeName: "name", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].defaultValue).toBe("0");
    expect(result[1].defaultValue).toBe("false");
    expect(result[2].defaultValue).toBe('""');
  });
});

// ── parseZodType additional cases ───────────────────────────

describe("parseZodType extended", () => {
  it("handles zod.string() prefix", () => {
    const result = parseZodType("zod.string()");
    expect(result.tsType).toBe("string");
  });

  it("handles zod.boolean() prefix", () => {
    const result = parseZodType("zod.boolean()");
    expect(result.tsType).toBe("boolean");
  });

  it("handles zod.number() prefix", () => {
    const result = parseZodType("zod.number()");
    expect(result.tsType).toBe("number");
  });

  it("handles zod.enum([...]) prefix", () => {
    const result = parseZodType('zod.enum(["a", "b"])');
    expect(result.formComponent).toBe("SelectField");
    expect(result.options).toEqual(["a", "b"]);
  });

  it("handles z.array(z.string())", () => {
    const result = parseZodType("z.array(z.string())");
    expect(result.tsType).toBe("string");
    expect(result.formComponent).toBe("TextField");
  });

  it("handles z.coerce.date()", () => {
    const result = parseZodType("z.coerce.date()");
    expect(result.tsType).toBe("Date");
  });

  it("handles zod.iso.datetime()", () => {
    const result = parseZodType("zod.iso.datetime({})");
    expect(result.tsType).toBe("Date");
  });
});

// ── parseSchemaFields Orval-style ───────────────────────────

describe("parseSchemaFields Orval style", () => {
  it("matches Orval Body schema (UpdatePetBody)", () => {
    const content = `
      export const updatePetBody = zod.object({
        name: zod.string(),
        status: zod.enum(["available", "pending", "sold"]),
      });
    `;
    const fields = parseSchemaFields(content, "pet");
    expect(fields.map((f) => f.name)).toEqual(["name", "status"]);
  });

  it("picks the schema with the most fields", () => {
    const content = `
      export const changePetPasswordBody = zod.object({
        oldPassword: zod.string(),
        newPassword: zod.string(),
      });

      export const updatePetBody = zod.object({
        name: zod.string(),
        status: zod.enum(["available", "pending", "sold"]),
        weight: zod.number(),
      });
    `;
    const fields = parseSchemaFields(content, "pet");
    expect(fields).toHaveLength(3);
    expect(fields.map((f) => f.name)).toEqual(["name", "status", "weight"]);
  });

  it("skips search body patterns", () => {
    const content = `
      export const petSearchBody = zod.object({
        conditions: zod.string(),
        page: zod.number(),
        size: zod.number(),
      });

      export const updatePetBody = zod.object({
        name: zod.string(),
      });
    `;
    const fields = parseSchemaFields(content, "pet");
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe("name");
  });

  it("handles describe() with unbalanced parens in string", () => {
    const content = `
      export const userSchema = z.object({
        name: z.string().describe('User name (required)'),
        age: z.number(),
      });
    `;
    const fields = parseSchemaFields(content, "user");
    expect(fields).toHaveLength(2);
    expect(fields[0].name).toBe("name");
    expect(fields[1].name).toBe("age");
  });
});

// ── getDefaultValue ─────────────────────────────────────────

describe("getDefaultValue extended", () => {
  it("returns empty string for enum-like types", () => {
    expect(getDefaultValue('"active" | "inactive"')).toBe('""');
  });
});

// ── Template rendering extended ─────────────────────────────

const baseCtx = {
  EntityPascal: "Product",
  entityKebab: "product",
  entity: "product",
  packageName: "@myapp/myapp-domain-product",
  domainCamel: "product",
  fieldNameList: "id, name, price",
  hasList: true,
  hasForm: true,
  hasDetail: true,
  hasCreate: true,
  hasUpdate: true,
  hasDelete: true,
  hasTree: false,
  fields: [
    {
      name: "id",
      capitalizedName: "Id",
      label: "Id",
      tsType: "number",
      formComponent: "NumberField",
      inputType: "number",
      component: "Number",
      options: [],
      defaultValue: "0",
    },
    {
      name: "name",
      capitalizedName: "Name",
      label: "Name",
      tsType: "string",
      formComponent: "TextField",
      inputType: "text",
      component: "Text",
      options: [],
      defaultValue: '""',
    },
  ],
};

describe("crudPageTemplate", () => {
  it("renders CRUD page with list and detail", () => {
    const result = renderTemplate(crudPageTemplate, baseCtx);
    expect(result).toContain("ProductCrudPage");
    expect(result).toContain("ProductList");
    expect(result).toContain("ProductDetail");
  });

  it("includes form components when hasCreate or hasUpdate", () => {
    const result = renderTemplate(crudPageTemplate, baseCtx);
    expect(result).toContain("ProductForm");
  });
});

describe("hubPageTemplate", () => {
  it("renders hub page for creation-only entities", () => {
    const result = renderTemplate(hubPageTemplate, {
      ...baseCtx,
      hasList: false,
      hasTree: false,
      hasCreate: true,
    });
    expect(result).toContain("ProductListPage");
  });
});

describe("pageIndexTemplate", () => {
  it("renders page index with CrudPage export when hasListDetail", () => {
    const result = renderTemplate(pageIndexTemplate, { ...baseCtx, hasListDetail: true });
    expect(result).toContain("ProductCrudPage");
  });

  it("renders empty when no flags set", () => {
    const result = renderTemplate(pageIndexTemplate, {
      ...baseCtx,
      hasList: false,
      hasCreate: false,
      hasListDetail: false,
    });
    expect(result.trim()).toBe("");
  });
});

describe("treeCrudPageTemplate", () => {
  it("renders tree CRUD page", () => {
    const ctx = { ...baseCtx, hasTree: true };
    const result = renderTemplate(treeCrudPageTemplate, ctx);
    expect(result).toContain("ProductCrudPage");
    expect(result).toContain("ProductTree");
  });
});

describe("treeTemplate", () => {
  it("renders tree component", () => {
    const result = renderTemplate(treeTemplate, baseCtx);
    expect(result).toContain("ProductTree");
    expect(result).toContain("useProductTree");
    expect(result).toContain("CrudTree");
  });
});
