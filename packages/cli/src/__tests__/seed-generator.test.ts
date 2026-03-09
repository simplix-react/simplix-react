import { describe, it, expect } from "vitest";
import { generateOrvalSeedFile } from "../openapi/generation/seed-generator.js";
import type { ExtractedEntity } from "../openapi/types.js";

function makeEntity(overrides: Partial<ExtractedEntity> = {}): ExtractedEntity {
  return {
    name: "product",
    pascalName: "Product",
    pluralName: "products",
    path: "/products",
    fields: [
      { name: "id", snakeName: "id", type: "string", format: "uuid", zodType: "z.string().uuid()", required: true, nullable: false },
      { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
      { name: "price", snakeName: "price", type: "number", zodType: "z.number()", required: true, nullable: false },
      { name: "active", snakeName: "active", type: "boolean", zodType: "z.boolean()", required: true, nullable: false },
    ],
    queryParams: [],
    operations: [],
    tags: [],
    ...overrides,
  };
}

describe("generateOrvalSeedFile", () => {
  it("generates seed file with type import and typed arrays", () => {
    const entities = [makeEntity()];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain('import type { Product } from "../generated/model"');
    expect(result).toContain("export const productSeeds: Product[] = [");
  });

  it("generates 20 seed entries per entity", () => {
    const entities = [makeEntity()];
    const result = generateOrvalSeedFile(entities);

    // Count opening braces for seed objects
    const matches = result.match(/\{\n/g);
    // 20 seed objects per entity
    expect(matches?.length).toBe(20);
  });

  it("generates UUID values for uuid format fields", () => {
    const entities = [makeEntity()];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain("00000000-0000-0000-0000-000000000001");
  });

  it("generates name-based string values", () => {
    const entities = [makeEntity()];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain('"Product 1"');
    expect(result).toContain('"Product 2"');
  });

  it("generates boolean values alternating true/false", () => {
    const entities = [makeEntity()];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain("active: false");
    expect(result).toContain("active: true");
  });

  it("skips entities with no fields", () => {
    const entities = [
      makeEntity({ name: "empty", pascalName: "Empty", fields: [] }),
    ];
    const result = generateOrvalSeedFile(entities);

    expect(result).toBe("");
  });

  it("uses modelType for import and type annotation when set", () => {
    const entities = [makeEntity({ modelType: "ProductDTO" })];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain('import type { ProductDTO } from "../generated/model"');
    expect(result).toContain("export const productSeeds: ProductDTO[] = [");
  });

  it("generates email values for email format", () => {
    const entities = [makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "email", snakeName: "email", type: "string", format: "email", zodType: "z.string().email()", required: true, nullable: false },
      ],
    })];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain("user1@example.com");
  });

  it("generates date values for date-time format", () => {
    const entities = [makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "createdAt", snakeName: "created_at", type: "string", format: "date-time", zodType: "z.string().datetime()", required: true, nullable: false },
      ],
    })];
    const result = generateOrvalSeedFile(entities);

    // Should contain an ISO date string
    expect(result).toMatch(/"\d{4}-\d{2}-\d{2}T/);
  });

  it("generates enum values cycling through options", () => {
    const entities = [makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "status", snakeName: "status", type: "string", zodType: 'z.enum(["active", "inactive"])', required: true, nullable: false, enum: ["active", "inactive"] },
      ],
    })];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain('"active"');
    expect(result).toContain('"inactive"');
  });

  it("generates integer id values as numbers", () => {
    const entities = [makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "integer", zodType: "z.number().int()", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
      ],
    })];
    const result = generateOrvalSeedFile(entities);

    // Integer id should be raw number, not quoted
    expect(result).toMatch(/id: 1[,\n]/);
  });

  it("generates multiple entity seed files", () => {
    const entities = [
      makeEntity(),
      makeEntity({ name: "category", pascalName: "Category", pluralName: "categories", path: "/categories" }),
    ];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain("export const productSeeds: Product[]");
    expect(result).toContain("export const categorySeeds: Category[]");
    expect(result).toContain('import type { Product, Category } from "../generated/model"');
  });

  it("generates array field values", () => {
    const entities = [makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "photoUrls", snakeName: "photo_urls", type: "array", zodType: "z.array(z.string())", required: true, nullable: false },
      ],
    })];
    const result = generateOrvalSeedFile(entities);

    expect(result).toContain("photoUrls:");
  });

  it("skips object-type fields", () => {
    const entities = [makeEntity({
      fields: [
        { name: "id", snakeName: "id", type: "string", zodType: "z.string()", required: true, nullable: false },
        { name: "metadata", snakeName: "metadata", type: "object", zodType: "z.object({})", required: false, nullable: false },
      ],
    })];
    const result = generateOrvalSeedFile(entities);

    // Object fields are skipped
    expect(result).not.toContain("metadata:");
  });
});
