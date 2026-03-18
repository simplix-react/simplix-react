import { describe, it, expect } from "vitest";
import { generateOrvalSeedFile } from "../openapi/generation/seed-generator.js";
import type { ExtractedEntity } from "../openapi/types.js";

function makeEntity(overrides: Partial<ExtractedEntity> = {}): ExtractedEntity {
  return {
    name: "item",
    pascalName: "Item",
    pluralName: "items",
    path: "/items",
    fields: [],
    queryParams: [],
    operations: [],
    tags: [],
    ...overrides,
  };
}

describe("generateOrvalSeedFile string heuristics", () => {
  it("generates string id (non-uuid) as quoted string", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('id: "1"');
  });

  it("generates url format values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "website", snakeName: "website", type: "string", format: "uri", zodType: "z.string().url()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("https://example.com/item/");
  });

  it("generates uuid format for non-id string fields", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "externalId", snakeName: "external_id", type: "string", format: "uuid", zodType: "z.string().uuid()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("externalId: \"00000000-0000-0000-0000-");
  });

  it("generates password values for password format", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "passwordHash", snakeName: "password_hash", type: "string", format: "password", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("password1");
  });

  it("generates password values for field name containing password", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "password", snakeName: "password", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("password1");
  });

  it("generates foreign key values for fields ending in id", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "categoryId", snakeName: "category_id", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    // FK should be a simple quoted number string
    expect(result).toContain('categoryId: "1"');
  });

  it("generates firstName values from FIRST_NAMES", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "firstName", snakeName: "first_name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('"Alice"');
    expect(result).toContain('"Bob"');
  });

  it("generates lastName values from LAST_NAMES", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "lastName", snakeName: "last_name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('"Smith"');
    expect(result).toContain('"Johnson"');
  });

  it("generates username values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "username", snakeName: "username", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('"user1"');
  });

  it("generates phone values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "phoneNumber", snakeName: "phone_number", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("555-010");
  });

  it("generates address values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "homeAddress", snakeName: "home_address", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("Main Street");
  });

  it("generates description values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "description", snakeName: "description", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("Sample item description 1");
  });

  it("generates image url values for url fields", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "imageUrl", snakeName: "image_url", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("https://example.com/images/item1.jpg");
  });

  it("generates date values for date format (not date-time)", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "birthDate", snakeName: "birth_date", type: "string", format: "date", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    // Date format should be YYYY-MM-DD without time part
    expect(result).toMatch(/birthDate: "\d{4}-\d{2}-\d{2}"/);
    // Should not contain 'T' (no time part)
    const dateMatch = result.match(/birthDate: "([^"]+)"/);
    expect(dateMatch?.[1]).not.toContain("T");
  });

  it("generates fallback string for unrecognized field names", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "customField", snakeName: "custom_field", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('customField: "customfield-1"');
  });

  it("generates title values same as name", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "title", snakeName: "title", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('"Item 1"');
  });
});

describe("generateOrvalSeedFile numeric heuristics", () => {
  it("generates quantity-based values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "quantity", snakeName: "quantity", type: "integer", zodType: "z.number()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("quantity: 2");
  });

  it("generates age-based values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "age", snakeName: "age", type: "integer", zodType: "z.number()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("age: 25");
  });

  it("generates status-based numeric values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "status", snakeName: "status", type: "integer", zodType: "z.number()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("status: ");
  });

  it("generates id-based numeric values for foreign keys", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "siteId", snakeName: "site_id", type: "integer", zodType: "z.number()", required: true, nullable: false },
      ],
    })]);
    // Numeric FK field ending in "id" should get index value
    expect(result).toContain("siteId: 1");
  });

  it("generates cost/amount based values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "totalAmount", snakeName: "total_amount", type: "number", zodType: "z.number()", required: true, nullable: false },
      ],
    })]);
    // Amount fields should generate decimal values
    expect(result).toMatch(/totalAmount: \d+\.\d{2}/);
  });

  it("generates generic numeric value for unknown field names", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "weight", snakeName: "weight", type: "number", zodType: "z.number()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("weight: 10");
  });
});

describe("generateOrvalSeedFile array heuristics", () => {
  it("generates tag array values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "tags", snakeName: "tags", type: "array", zodType: "z.array()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('{ id: 1, name: "tag-1" }');
  });

  it("generates empty array for unknown array fields", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "permissions", snakeName: "permissions", type: "array", zodType: "z.array()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("permissions: []");
  });
});

describe("generateOrvalSeedFile edge cases", () => {
  it("skips optional fields with unknown type", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "extra", snakeName: "extra", type: "unknown" as never, zodType: "", required: false, nullable: false },
      ],
    })]);
    // Optional unknown type field should be skipped
    expect(result).not.toContain("extra:");
  });

  it("generates fallback for required fields with unknown type", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "data", snakeName: "data", type: "any" as never, zodType: "", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('data: "item-data-1"');
  });

  it("generates email by field name when no format", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "userEmail", snakeName: "user_email", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("@example.com");
  });

  it("generates summary values like description", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "summary", snakeName: "summary", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("Sample item");
  });

  it("generates count-based numeric values", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number()", required: true, nullable: false },
        { name: "viewCount", snakeName: "view_count", type: "integer", zodType: "z.number()", required: true, nullable: false },
      ],
    })]);
    // count field should multiply by 2
    expect(result).toContain("viewCount: 2");
  });

  it("generates photo array values as image URLs", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "photoUrls", snakeName: "photo_urls", type: "array", zodType: "z.array(z.string())", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain("https://example.com/images/1.jpg");
  });

  it("generates first_name values (snake_case format)", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "first_name", snakeName: "first_name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('"Alice"');
  });

  it("generates last_name values (snake_case format)", () => {
    const result = generateOrvalSeedFile([makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "last_name", snakeName: "last_name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })]);
    expect(result).toContain('"Smith"');
  });
});
