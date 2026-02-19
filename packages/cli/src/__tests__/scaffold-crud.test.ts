import { describe, it, expect } from "vitest";
import { renderTemplate } from "../utils/template.js";
import {
  parseZodType,
  getDefaultValue,
  parseSchemaFields,
} from "../commands/scaffold-crud.js";
import {
  listTemplate,
  formTemplate,
  detailTemplate,
  featureIndexTemplate,
} from "../templates/ui/index.js";

// ── parseZodType ──

describe("parseZodType", () => {
  it("parses z.string()", () => {
    const result = parseZodType("z.string()");
    expect(result.tsType).toBe("string");
    expect(result.formComponent).toBe("TextField");
    expect(result.component).toBe("Text");
  });

  it("parses z.string().email()", () => {
    const result = parseZodType("z.string().email()");
    expect(result.tsType).toBe("string");
    expect(result.inputType).toBe("email");
  });

  it("parses z.string().url()", () => {
    const result = parseZodType("z.string().url()");
    expect(result.inputType).toBe("url");
  });

  it("parses z.string().min(100) as TextareaField", () => {
    const result = parseZodType("z.string().min(100)");
    expect(result.formComponent).toBe("TextareaField");
  });

  it("parses z.string().min(10) as TextField", () => {
    const result = parseZodType("z.string().min(10)");
    expect(result.formComponent).toBe("TextField");
  });

  it("parses z.number()", () => {
    const result = parseZodType("z.number()");
    expect(result.tsType).toBe("number");
    expect(result.formComponent).toBe("NumberField");
    expect(result.component).toBe("Number");
  });

  it("parses z.coerce.number()", () => {
    const result = parseZodType("z.coerce.number()");
    expect(result.tsType).toBe("number");
  });

  it("parses z.boolean()", () => {
    const result = parseZodType("z.boolean()");
    expect(result.tsType).toBe("boolean");
    expect(result.formComponent).toBe("SwitchField");
    expect(result.component).toBe("Boolean");
  });

  it("parses z.date()", () => {
    const result = parseZodType("z.date()");
    expect(result.tsType).toBe("Date");
    expect(result.formComponent).toBe("DateField");
  });

  it("parses z.coerce.date()", () => {
    const result = parseZodType("z.coerce.date()");
    expect(result.tsType).toBe("Date");
  });

  it("parses z.enum([...]) with options", () => {
    const result = parseZodType('z.enum(["active", "inactive", "pending"])');
    expect(result.tsType).toBe('"active" | "inactive" | "pending"');
    expect(result.formComponent).toBe("SelectField");
    expect(result.component).toBe("Select");
    expect(result.options).toEqual(["active", "inactive", "pending"]);
  });

  it("falls back to string for unknown types", () => {
    const result = parseZodType("z.any()");
    expect(result.tsType).toBe("string");
    expect(result.formComponent).toBe("TextField");
  });

  it("handles optional chaining", () => {
    const result = parseZodType("z.number().optional()");
    expect(result.tsType).toBe("number");
  });
});

// ── getDefaultValue ──

describe("getDefaultValue", () => {
  it('returns 0 for number', () => {
    expect(getDefaultValue("number")).toBe("0");
  });

  it('returns false for boolean', () => {
    expect(getDefaultValue("boolean")).toBe("false");
  });

  it('returns new Date() for Date', () => {
    expect(getDefaultValue("Date")).toBe("new Date()");
  });

  it('returns empty string for string', () => {
    expect(getDefaultValue("string")).toBe('""');
  });

  it('returns empty string for unknown types', () => {
    expect(getDefaultValue("unknown")).toBe('""');
  });
});

// ── parseSchemaFields ──

describe("parseSchemaFields", () => {
  it("extracts fields from a simple schema", () => {
    const content = `
      export const productSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        price: z.number().min(0),
        active: z.boolean(),
      });
    `;
    const fields = parseSchemaFields(content, "product");
    expect(fields).toHaveLength(4);
    expect(fields.map((f) => f.name)).toEqual(["id", "name", "price", "active"]);
    expect(fields[0].tsType).toBe("string");
    expect(fields[2].tsType).toBe("number");
    expect(fields[3].tsType).toBe("boolean");
  });

  it("skips nested z.object() fields", () => {
    const content = `
      export const petSchema = z.object({
        id: z.coerce.number().int(),
        name: z.string(),
        category: z.object({
          id: z.coerce.number().int(),
          name: z.string(),
        }).optional(),
        tags: z.array(z.object({
          id: z.coerce.number().int(),
          name: z.string(),
        })).optional(),
        status: z.enum(["available", "pending", "sold"]),
      });
    `;
    const fields = parseSchemaFields(content, "pet");
    const names = fields.map((f) => f.name);
    expect(names).toContain("id");
    expect(names).toContain("name");
    expect(names).toContain("status");
    expect(names).not.toContain("category");
    expect(names).not.toContain("tags");
  });

  it("deduplicates fields", () => {
    const content = `
      const petSchema = z.object({
        id: z.string(),
        name: z.string(),
      });
    `;
    const fields = parseSchemaFields(content, "pet");
    const idFields = fields.filter((f) => f.name === "id");
    expect(idFields).toHaveLength(1);
  });

  it("sets enum default to first option", () => {
    const content = `
      const orderSchema = z.object({
        status: z.enum(["placed", "approved", "delivered"]),
      });
    `;
    const fields = parseSchemaFields(content, "order");
    expect(fields[0].defaultValue).toBe('"placed"');
  });

  it("returns empty array if schema not found", () => {
    const content = `export const unrelated = 42;`;
    const fields = parseSchemaFields(content, "product");
    expect(fields).toEqual([]);
  });

  it("handles case-insensitive schema name matching", () => {
    const content = `
      export const UserSchema = z.object({
        id: z.string(),
        email: z.string().email(),
      });
    `;
    const fields = parseSchemaFields(content, "user");
    expect(fields).toHaveLength(2);
    expect(fields[1].inputType).toBe("email");
  });

  it("generates correct capitalizedName and label", () => {
    const content = `
      const itemSchema = z.object({
        firstName: z.string(),
        last_name: z.string(),
      });
    `;
    const fields = parseSchemaFields(content, "item");
    expect(fields[0].capitalizedName).toBe("FirstName");
    expect(fields[0].label).toBe("FirstName");
    expect(fields[1].capitalizedName).toBe("Last_name");
    expect(fields[1].label).toBe("Last name");
  });
});

// ── Template rendering ──

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
    {
      name: "price",
      capitalizedName: "Price",
      label: "Price",
      tsType: "number",
      formComponent: "NumberField",
      inputType: "number",
      component: "Number",
      options: [],
      defaultValue: "0",
    },
  ],
};

describe("listTemplate", () => {
  it("renders with correct imports", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain('import { Button, CrudList, Flex, Stack, Text, useCrudList } from "@simplix-react/ui"');
    expect(result).toContain('import { useEntityTranslation } from "@simplix-react/i18n/react"');
    expect(result).toContain('import { productHooks } from "@myapp/myapp-domain-product"');
  });

  it("renders interface fields", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain("id: number;");
    expect(result).toContain("name: string;");
  });

  it("uses useCrudList with domain hooks and type assertion", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain("useCrudList<Product>(productHooks.product.useList as any)");
  });

  it("renders List compound components", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain("list.filters.search");
    expect(result).toContain("list.filters.setSearch");
    expect(result).toContain("list.sort.field");
    expect(result).toContain("list.selection.selected");
    expect(result).toContain("list.pagination.page");
    expect(result).toContain("list.pagination.totalPages");
    expect(result).toContain("list.emptyReason &&");
  });

  it("uses useEntityTranslation for field labels", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain('useEntityTranslation("product")');
    expect(result).toContain('header={fieldLabel("id")}');
    expect(result).toContain('header={fieldLabel("name")}');
    expect(result).toContain('{fieldLabel("name")}: {row.name');
  });

  it("renders List.Column for each field", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain('field="id"');
    expect(result).toContain('field="name"');
    expect(result).toContain('field="price"');
  });

  it("includes create button when hasCreate", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain("<Button onClick={onCreate}>New Product</Button>");
  });

  it("omits create button when hasCreate is false", () => {
    const result = renderTemplate(listTemplate, { ...baseCtx, hasCreate: false });
    expect(result).not.toContain("New Product");
  });

  it("renders mock fallback when no packageName", () => {
    const result = renderTemplate(listTemplate, { ...baseCtx, packageName: null });
    expect(result).toContain("useMockList");
    expect(result).not.toContain("productHooks");
  });

  it("renders navigation callback props", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain("onView?: (row: Product) => void;");
    expect(result).toContain("onCreate?: () => void;");
    expect(result).toContain("onEdit?: (row: Product) => void;");
    expect(result).toContain("onDelete?: (row: Product) => void;");
  });

  it("renders onRowClick with onView", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain("onRowClick={(row) => onView?.(row)}");
  });

  it("renders row actions column with edit and delete buttons", () => {
    const result = renderTemplate(listTemplate, baseCtx);
    expect(result).toContain("e.stopPropagation()");
    expect(result).toContain("onEdit?.(row)");
    expect(result).toContain("onDelete?.(row)");
  });

  it("omits row actions column when neither hasUpdate nor hasDelete", () => {
    const result = renderTemplate(listTemplate, { ...baseCtx, hasUpdate: false, hasDelete: false });
    expect(result).not.toContain("e.stopPropagation()");
  });
});

describe("formTemplate", () => {
  it("renders with correct imports", () => {
    const result = renderTemplate(formTemplate, baseCtx);
    expect(result).toContain('import type { ReactNode } from "react"');
    expect(result).toContain('import { QueryFallback, Button, CrudForm, FormFields, useCrudFormSubmit } from "@simplix-react/ui"');
    expect(result).toContain('import { useEntityTranslation } from "@simplix-react/i18n/react"');
  });

  it("renders FormValues interface", () => {
    const result = renderTemplate(formTemplate, baseCtx);
    expect(result).toContain("export interface ProductFormValues");
    expect(result).toContain("id: number;");
  });

  it("renders useState for each field", () => {
    const result = renderTemplate(formTemplate, baseCtx);
    expect(result).toContain("const [id, setId] = useState<number>");
    expect(result).toContain("const [name, setName] = useState<string>");
  });

  it("uses useEntityTranslation for field labels", () => {
    const result = renderTemplate(formTemplate, baseCtx);
    expect(result).toContain('useEntityTranslation("product")');
    expect(result).toContain('label={fieldLabel("id")}');
    expect(result).toContain('label={fieldLabel("name")}');
  });

  it("renders NumberField with null-safe onChange", () => {
    const result = renderTemplate(formTemplate, baseCtx);
    expect(result).toContain("(v) => setId(v ?? 0)");
    expect(result).toContain("(v) => setPrice(v ?? 0)");
  });

  it("renders Button components instead of inline buttons", () => {
    const result = renderTemplate(formTemplate, baseCtx);
    expect(result).toContain('<Button type="button" variant="outline" onClick={onCancel}>');
    expect(result).toContain("<Button type=\"submit\" variant=\"primary\">Save Product</Button>");
    expect(result).not.toContain("className=\"inline-flex");
  });

  it("renders enumLabel for SelectField options", () => {
    const ctxWithEnum = {
      ...baseCtx,
      fields: [
        {
          name: "status",
          capitalizedName: "Status",
          label: "Status",
          tsType: '"active" | "inactive"',
          formComponent: "SelectField",
          inputType: "text",
          component: "Select",
          options: ["active", "inactive"],
          defaultValue: '"active"',
        },
      ],
      fieldNameList: "status",
    };
    const result = renderTemplate(formTemplate, ctxWithEnum);
    expect(result).toContain('enumLabel("productStatus", "active")');
    expect(result).toContain('enumLabel("productStatus", "inactive")');
  });

  it("renders CrudForm.Actions with children", () => {
    const result = renderTemplate(formTemplate, baseCtx);
    expect(result).toContain('<CrudForm.Actions className={onCancel ? "justify-between" : "justify-end"}>');

    expect(result).toContain("</CrudForm.Actions>");
  });
});

describe("detailTemplate", () => {
  it("renders with correct imports", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain('import { QueryFallback, CrudDelete, useCrudDeleteDetail, CrudDetail, DetailFields, usePreviousData } from "@simplix-react/ui"');
    expect(result).toContain('import { useEntityTranslation } from "@simplix-react/i18n/react"');
    expect(result).toContain('import type { ReactNode } from "react"');
    expect(result).not.toContain('import { useRef');
    expect(result).not.toContain('useState } from "react"');
  });

  it("uses useEntityTranslation for field labels", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain('useEntityTranslation("product")');
    expect(result).toContain('label={fieldLabel("id")}');
    expect(result).toContain('label={fieldLabel("name")}');
  });

  it("renders DetailFields with Detail prefix", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain("DetailFields.DetailNumberField");
    expect(result).toContain("DetailFields.DetailTextField");
  });

  it("renders DefaultActions with edit and delete", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain("CrudDetail.DefaultActions");
    expect(result).toContain("onEdit={onEdit}");
    expect(result).toContain("del.requestDelete");
  });

  it("renders CrudDelete confirmation dialog", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain("CrudDelete");
    expect(result).toContain("del.open");
    expect(result).toContain("del.onOpenChange");
    expect(result).toContain("deleteProduct.mutate");
  });

  it("includes onEdit when hasUpdate", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain("onEdit?: () => void;");
    expect(result).toContain("onEdit={onEdit}");
  });

  it("includes onDeleted when hasDelete", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain("onDeleted?: () => void;");
    expect(result).toContain("onSuccess: onDeleted");
  });

  it("includes header and onClose props", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain("header?: ReactNode;");
    expect(result).toContain("onClose?: () => void;");
  });

  it("omits onEdit when hasUpdate is false", () => {
    const result = renderTemplate(detailTemplate, { ...baseCtx, hasUpdate: false });
    expect(result).not.toContain("onEdit");
  });

  it("renders empty Actions when both hasUpdate and hasDelete are false", () => {
    const result = renderTemplate(detailTemplate, {
      ...baseCtx,
      hasUpdate: false,
      hasDelete: false,
    });
    expect(result).toContain("CrudDetail.DefaultActions");
    expect(result).not.toContain("onEdit");
    expect(result).not.toContain("onDeleted");
  });

  it("uses usePreviousData pattern and passes props to CrudDetail", () => {
    const result = renderTemplate(detailTemplate, baseCtx);
    expect(result).toContain("usePreviousData");
    expect(result).toContain("displayData");
    expect(result).toContain("isLoading={isLoading}");
    expect(result).toContain("header={header}");
    expect(result).toContain("onClose={onClose}");
  });

  it("renders BadgeField with variants and displayValue for enum fields", () => {
    const ctxWithEnum = {
      ...baseCtx,
      fields: [
        {
          name: "status",
          capitalizedName: "Status",
          label: "Status",
          tsType: '"active" | "inactive"',
          formComponent: "SelectField",
          inputType: "text",
          component: "Select",
          options: ["active", "inactive"],
          defaultValue: '"active"',
        },
      ],
    };
    const result = renderTemplate(detailTemplate, ctxWithEnum);
    expect(result).toContain("DetailFields.DetailBadgeField");
    expect(result).toContain('"active": "default"');
    expect(result).toContain('"inactive": "default"');
    expect(result).toContain('displayValue={enumLabel("productStatus", displayData.status)}');
  });
});

describe("featureIndexTemplate", () => {
  it("exports all components when all operations exist", () => {
    const result = renderTemplate(featureIndexTemplate, baseCtx);
    expect(result).toContain("ProductList");
    expect(result).toContain("ProductForm");
    expect(result).toContain("ProductFormValues");
    expect(result).toContain("ProductDetail");
  });

  it("omits list export when hasList is false", () => {
    const result = renderTemplate(featureIndexTemplate, { ...baseCtx, hasList: false });
    expect(result).not.toContain("ProductList");
    expect(result).toContain("ProductForm");
  });

  it("omits form export when hasForm is false", () => {
    const result = renderTemplate(featureIndexTemplate, { ...baseCtx, hasForm: false });
    expect(result).not.toContain("ProductForm");
    expect(result).toContain("ProductList");
  });

  it("omits detail export when hasDetail is false", () => {
    const result = renderTemplate(featureIndexTemplate, { ...baseCtx, hasDetail: false });
    expect(result).not.toContain("ProductDetail");
    expect(result).toContain("ProductList");
  });

  it("renders minimal index when all operations are false", () => {
    const result = renderTemplate(featureIndexTemplate, {
      ...baseCtx,
      hasList: false,
      hasForm: false,
      hasDetail: false,
    });
    expect(result).not.toContain("ProductList");
    expect(result).not.toContain("ProductForm");
    expect(result).not.toContain("ProductDetail");
  });
});


