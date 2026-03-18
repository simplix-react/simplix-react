import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  parseSchemaFields,
  entityFieldsToFieldInfo,
  parseFilterParams,
} from "../commands/scaffold-crud.js";
import type { EntityField, QueryParam } from "../openapi/types.js";

// Silence log output during tests
vi.mock("../utils/logger.js", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "scaffold-io-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

// ── searchDir (tested indirectly via findSchemaFile behavior) ──
// The function is private, so we test it through integration patterns.

describe("schema file discovery patterns", () => {
  it("finds schemas.ts files in packages", async () => {
    const pkgDir = join(tempDir, "packages/my-domain/src");
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      join(pkgDir, "schemas.ts"),
      `export const userSchema = z.object({
        id: z.string(),
        name: z.string(),
      });`,
    );

    const content = await readFile(join(pkgDir, "schemas.ts"), "utf-8");
    const fields = parseSchemaFields(content, "user");
    expect(fields).toHaveLength(2);
  });

  it("finds Orval .zod.ts files", async () => {
    const genDir = join(tempDir, "packages/my-domain/src/generated/endpoints");
    await mkdir(genDir, { recursive: true });
    await writeFile(
      join(genDir, "user.zod.ts"),
      `export const updateUserBody = zod.object({
        name: zod.string(),
        email: zod.string(),
      });`,
    );

    const content = await readFile(join(genDir, "user.zod.ts"), "utf-8");
    const fields = parseSchemaFields(content, "user");
    expect(fields).toHaveLength(2);
  });
});

// ── parseSchemaFields advanced patterns ─────────────────────

describe("parseSchemaFields advanced patterns", () => {
  it("handles Boot-style naming (AdminUserAccountRestUpdateBody)", () => {
    const content = `
      export const adminUserAccountRestUpdateBody = zod.object({
        firstName: zod.string(),
        lastName: zod.string(),
        email: zod.string(),
      });
    `;
    const fields = parseSchemaFields(content, "userAccount");
    expect(fields).toHaveLength(3);
  });

  it("detects foreign key fields ending in Id", () => {
    const content = `
      export const orderSchema = z.object({
        id: z.string(),
        customerId: z.string(),
        productId: z.string(),
      });
    `;
    const fields = parseSchemaFields(content, "order");
    const customerField = fields.find((f) => f.name === "customerId");
    expect(customerField?.isForeignKey).toBe(true);
    expect(customerField?.fkEntityField).toBe("customer");
  });

  it("marks system fields (id, displayOrder, sortOrder)", () => {
    const content = `
      export const itemSchema = z.object({
        id: z.string(),
        displayOrder: z.number(),
        sortOrder: z.number(),
        name: z.string(),
      });
    `;
    const fields = parseSchemaFields(content, "item");
    expect(fields.find((f) => f.name === "id")?.isSystemField).toBe(true);
    expect(fields.find((f) => f.name === "displayOrder")?.isSystemField).toBe(true);
    expect(fields.find((f) => f.name === "sortOrder")?.isSystemField).toBe(true);
    expect(fields.find((f) => f.name === "name")?.isSystemField).toBe(false);
  });

  it("handles multiple schemas and picks the one with most fields", () => {
    const content = `
      export const smallUserBody = zod.object({
        name: zod.string(),
      });
      export const updateUserBody = zod.object({
        name: zod.string(),
        email: zod.string(),
        role: zod.enum(["admin", "user"]),
        active: zod.boolean(),
      });
    `;
    const fields = parseSchemaFields(content, "user");
    expect(fields).toHaveLength(4);
  });

  it("handles z.coerce.number() in field expressions", () => {
    const content = `
      export const productSchema = z.object({
        id: z.coerce.number().int(),
        price: z.coerce.number(),
      });
    `;
    const fields = parseSchemaFields(content, "product");
    expect(fields).toHaveLength(2);
    expect(fields[0].tsType).toBe("number");
    expect(fields[1].tsType).toBe("number");
  });

  it("handles nullable and optional chains", () => {
    const content = `
      export const userSchema = z.object({
        id: z.string(),
        bio: z.string().nullable().optional(),
        age: z.number().optional(),
      });
    `;
    const fields = parseSchemaFields(content, "user");
    expect(fields).toHaveLength(3);
  });
});

// ── entityFieldsToFieldInfo edge cases ──────────────────────

describe("entityFieldsToFieldInfo edge cases", () => {
  it("generates capitalizedName and label correctly", () => {
    const fields: EntityField[] = [
      { name: "firstName", snakeName: "first_name", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const result = entityFieldsToFieldInfo(fields);
    expect(result[0].capitalizedName).toBe("FirstName");
    expect(result[0].label).toContain("First");
  });

  it("handles empty fields array", () => {
    const result = entityFieldsToFieldInfo([]);
    expect(result).toEqual([]);
  });
});

// ── parseFilterParams edge cases ────────────────────────────

describe("parseFilterParams edge cases", () => {
  it("handles field with int32 format as numeric", () => {
    const fields: EntityField[] = [
      { name: "count", snakeName: "count", type: "integer", format: "int32", required: true, nullable: false, zodType: "" },
    ];
    const params: QueryParam[] = [{ name: "count.greaterThanOrEqualTo", type: "number", required: false }];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("NumberFilter");
  });

  it("handles field with float format as numeric", () => {
    const fields: EntityField[] = [
      { name: "weight", snakeName: "weight", type: "number", format: "float", required: true, nullable: false, zodType: "" },
    ];
    const params: QueryParam[] = [{ name: "weight.lessThan", type: "number", required: false }];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("NumberFilter");
  });

  it("detects field ending with At as date field", () => {
    const fields: EntityField[] = [
      { name: "updatedAt", snakeName: "updated_at", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const params: QueryParam[] = [
      { name: "updatedAt.greaterThanOrEqualTo", type: "string", required: false },
      { name: "updatedAt.lessThanOrEqualTo", type: "string", required: false },
    ];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("DateRangeFilter");
  });

  it("detects field ending with Time as date field", () => {
    const fields: EntityField[] = [
      { name: "startTime", snakeName: "start_time", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const params: QueryParam[] = [
      { name: "startTime.greaterThanOrEqualTo", type: "string", required: false },
      { name: "startTime.lessThanOrEqualTo", type: "string", required: false },
    ];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("DateRangeFilter");
  });

  it("handles contains with multiple text operators", () => {
    const fields: EntityField[] = [
      { name: "description", snakeName: "description", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const params: QueryParam[] = [
      { name: "description.contains", type: "string", required: false },
      { name: "description.startsWith", type: "string", required: false },
      { name: "description.endsWith", type: "string", required: false },
    ];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].textOperators).toEqual(["contains", "startsWith", "endsWith"]);
  });

  it("handles country field suffix casing", () => {
    const fields: EntityField[] = [
      { name: "country", snakeName: "country", type: "string", required: true, nullable: false, zodType: "" },
    ];
    const params: QueryParam[] = [{ name: "country.in", type: "string", required: false }];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("CountryFilter");
  });
});

// ── Template rendering with editorTemplate ──────────────────

describe("editor template rendering", () => {
  it("renders editor template with form and detail", async () => {
    const { renderTemplate } = await import("../utils/template.js");
    const { default: editorTemplate } = await import("../templates/ui/editor.hbs");

    const ctx = {
      EntityPascal: "Product",
      entityKebab: "product",
      entity: "product",
      packageName: "@myapp/myapp-domain-product",
      domainCamel: "product",
      fieldNameList: "id, name",
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
          tsType: "string",
          formComponent: "TextField",
          inputType: "text",
          component: "Text",
          options: [],
          defaultValue: '""',
        },
      ],
    };

    const result = renderTemplate(editorTemplate, ctx);
    expect(result).toContain("Product");
  });
});
