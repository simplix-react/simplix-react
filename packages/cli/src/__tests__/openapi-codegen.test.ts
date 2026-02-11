import { describe, it, expect } from "vitest";
import { resolveRefs } from "../openapi/schema-resolver.js";
import { extractEntities } from "../openapi/entity-extractor.js";
import { toZodType, toSqlType, generateZodSchemas } from "../openapi/zod-codegen.js";
import { generateHttpFile, generateHttpEnvJson } from "../openapi/http-file-gen.js";
import { computeDiff, formatDiff } from "../openapi/diff-engine.js";
import { createTagMatcher, entityMatchesDomain, groupEntitiesByDomain } from "../openapi/domain-splitter.js";
import type { OpenAPISpec, ExtractedEntity, OpenAPISnapshot } from "../openapi/types.js";

// --- Test fixtures ---

const minimalSpec: OpenAPISpec = {
  openapi: "3.0.3",
  info: { title: "Test API", version: "1.0.0" },
  paths: {
    "/users": {
      get: {
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      email: { type: "string", format: "email" },
                      name: { type: "string", minLength: 1 },
                      role: { type: "string", enum: ["admin", "user", "guest"] },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                    required: ["id", "email", "name", "createdAt", "updatedAt"],
                  },
                },
              },
            },
          },
        },
      },
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string", minLength: 1 },
                  role: { type: "string", enum: ["admin", "user", "guest"] },
                },
                required: ["email", "name"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
        },
      },
    },
    "/users/{id}": {
      get: {
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    email: { type: "string", format: "email" },
                    name: { type: "string", minLength: 1 },
                    role: { type: "string", enum: ["admin", "user", "guest"] },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                  required: ["id", "email", "name", "createdAt", "updatedAt"],
                },
              },
            },
          },
        },
      },
      patch: {
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  role: { type: "string", enum: ["admin", "user", "guest"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { "204": { description: "No Content" } },
      },
    },
  },
};

const specWithRefs: OpenAPISpec = {
  openapi: "3.0.3",
  info: { title: "Ref API", version: "1.0.0" },
  paths: {
    "/products": {
      get: {
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
      },
    },
    "/products/{id}": {
      get: {
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          price: { type: "number" },
        },
        required: ["id", "name", "price"],
      },
    },
  },
};

// --- Tests ---

describe("schema-resolver", () => {
  it("resolves $ref references", () => {
    const resolved = resolveRefs(specWithRefs);
    const getResponse =
      resolved.paths["/products/{id}"]?.get?.responses?.["200"];
    const schema = getResponse?.content?.["application/json"]?.schema;

    expect(schema).toBeDefined();
    expect(schema?.properties?.id?.type).toBe("string");
    expect(schema?.properties?.name?.type).toBe("string");
    expect(schema?.properties?.price?.type).toBe("number");
  });

  it("resolves $ref in array items", () => {
    const resolved = resolveRefs(specWithRefs);
    const listResponse =
      resolved.paths["/products"]?.get?.responses?.["200"];
    const schema = listResponse?.content?.["application/json"]?.schema;

    expect(schema?.type).toBe("array");
    expect(schema?.items?.properties?.id?.type).toBe("string");
  });
});

describe("entity-extractor", () => {
  it("extracts entities with CRUD operations", () => {
    const entities = extractEntities(minimalSpec);

    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("user");
    expect(entities[0].pascalName).toBe("User");
    expect(entities[0].pluralName).toBe("users");
    expect(entities[0].path).toBe("/users");
  });

  it("detects all CRUD operations", () => {
    const entities = extractEntities(minimalSpec);
    const ops = entities[0].operations;

    expect(ops.list).toBe(true);
    expect(ops.get).toBe(true);
    expect(ops.create).toBe(true);
    expect(ops.update).toBe(true);
    expect(ops.delete).toBe(true);
  });

  it("extracts fields from response schema", () => {
    const entities = extractEntities(minimalSpec);
    const fields = entities[0].fields;

    expect(fields.length).toBeGreaterThan(0);
    const idField = fields.find((f) => f.name === "id");
    expect(idField?.type).toBe("string");
    expect(idField?.format).toBe("uuid");
    expect(idField?.required).toBe(true);
  });

  it("separates createFields (excludes id/timestamps)", () => {
    const entities = extractEntities(minimalSpec);
    const createFields = entities[0].createFields;

    const fieldNames = createFields.map((f) => f.name);
    expect(fieldNames).not.toContain("id");
    expect(fieldNames).not.toContain("createdAt");
    expect(fieldNames).not.toContain("updatedAt");
  });

  it("extracts entities with resolved $refs", () => {
    const resolved = resolveRefs(specWithRefs);
    const entities = extractEntities(resolved);

    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("product");
    expect(entities[0].fields.length).toBeGreaterThan(0);
  });

  it("detects nested parent-child relationships", () => {
    const nestedSpec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Nested", version: "1.0.0" },
      paths: {
        "/topologies/{topologyId}/controllers": {
          get: {
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                        },
                        required: ["id", "name"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities = extractEntities(nestedSpec);
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("controller");
    expect(entities[0].parent).toEqual({
      param: "topologyId",
      path: "/topologies",
    });
  });
});

describe("zod-codegen", () => {
  it("converts string to z.string()", () => {
    expect(toZodType({ type: "string" })).toBe("z.string()");
  });

  it("converts string+uuid to z.string().uuid()", () => {
    expect(toZodType({ type: "string", format: "uuid" })).toBe(
      "z.string().uuid()",
    );
  });

  it("converts string+email to z.string().email()", () => {
    expect(toZodType({ type: "string", format: "email" })).toBe(
      "z.string().email()",
    );
  });

  it("converts string+datetime to z.string().datetime()", () => {
    expect(toZodType({ type: "string", format: "date-time" })).toBe(
      "z.string().datetime()",
    );
  });

  it("converts integer to z.number().int()", () => {
    expect(toZodType({ type: "integer" })).toBe("z.number().int()");
  });

  it("converts number to z.number()", () => {
    expect(toZodType({ type: "number" })).toBe("z.number()");
  });

  it("converts boolean to z.boolean()", () => {
    expect(toZodType({ type: "boolean" })).toBe("z.boolean()");
  });

  it("converts enum to z.enum([...])", () => {
    expect(toZodType({ type: "string", enum: ["a", "b", "c"] })).toBe(
      'z.enum(["a", "b", "c"])',
    );
  });

  it("handles nullable", () => {
    expect(toZodType({ type: "string", nullable: true })).toBe(
      "z.string().nullable()",
    );
  });

  it("adds minLength/maxLength constraints", () => {
    expect(toZodType({ type: "string", minLength: 1, maxLength: 100 })).toBe(
      "z.string().min(1).max(100)",
    );
  });

  it("adds min/max for numbers", () => {
    expect(toZodType({ type: "integer", minimum: 0, maximum: 150 })).toBe(
      "z.number().int().min(0).max(150)",
    );
  });

  it("adds regex pattern", () => {
    expect(toZodType({ type: "string", pattern: "^[a-z]+$" })).toBe(
      "z.string().regex(/^[a-z]+$/)",
    );
  });

  it("converts array of strings", () => {
    expect(toZodType({ type: "array", items: { type: "string" } })).toBe(
      "z.array(z.string())",
    );
  });

  it("generates complete Zod schema file", () => {
    const entities = extractEntities(minimalSpec);
    const code = generateZodSchemas(entities);

    expect(code).toContain('import { z } from "zod"');
    expect(code).toContain("export const userSchema = z.object({");
    expect(code).toContain("export const createUserSchema");
    expect(code).toContain("export const updateUserSchema");
    expect(code).toContain("export type User =");
    expect(code).toContain("export type CreateUser =");
    expect(code).toContain("export type UpdateUser =");
  });
});

describe("sql-type-mapping", () => {
  it("maps string+uuid to UUID", () => {
    expect(toSqlType({ type: "string", format: "uuid" })).toBe("UUID");
  });

  it("maps string+datetime to TIMESTAMPTZ", () => {
    expect(toSqlType({ type: "string", format: "date-time" })).toBe(
      "TIMESTAMPTZ",
    );
  });

  it("maps string to TEXT", () => {
    expect(toSqlType({ type: "string" })).toBe("TEXT");
  });

  it("maps integer to INTEGER", () => {
    expect(toSqlType({ type: "integer" })).toBe("INTEGER");
  });

  it("maps boolean to BOOLEAN", () => {
    expect(toSqlType({ type: "boolean" })).toBe("BOOLEAN");
  });

  it("maps array to JSONB", () => {
    expect(toSqlType({ type: "array" })).toBe("JSONB");
  });
});

describe("http-file-gen", () => {
  it("generates .http file for entity with full CRUD", () => {
    const entity: ExtractedEntity = {
      name: "user",
      pascalName: "User",
      pluralName: "users",
      path: "/users",
      fields: [],
      createFields: [
        { name: "email", snakeName: "email", type: "string", format: "email", zodType: "z.string().email()", sqlType: "TEXT", required: true, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", sqlType: "TEXT", required: true, nullable: false },
      ],
      updateFields: [
        { name: "email", snakeName: "email", type: "string", format: "email", zodType: "z.string().email()", sqlType: "TEXT", required: false, nullable: false },
        { name: "name", snakeName: "name", type: "string", zodType: "z.string()", sqlType: "TEXT", required: false, nullable: false },
      ],
      queryParams: [],
      operations: { list: true, get: true, create: true, update: true, delete: true },
      tags: [],
    };

    const result = generateHttpFile(entity, "/api/test");

    expect(result).toContain("### List Users");
    expect(result).toContain("GET {{baseUrl}}/api/test/users");
    expect(result).toContain("### Get User by ID");
    expect(result).toContain("### Create User");
    expect(result).toContain("POST {{baseUrl}}/api/test/users");
    expect(result).toContain("### Update User");
    expect(result).toContain("PATCH {{baseUrl}}/api/test/users/{{userId}}");
    expect(result).toContain("### Delete User");
    expect(result).toContain("DELETE {{baseUrl}}/api/test/users/{{userId}}");
  });

  it("generates http-client.env.json from config", () => {
    const result = generateHttpEnvJson({
      http: {
        environments: {
          dev: { baseUrl: "http://localhost:3000" },
          prod: { baseUrl: "https://api.example.com" },
        },
      },
    });

    const parsed = JSON.parse(result);
    expect(parsed.dev.baseUrl).toBe("http://localhost:3000");
    expect(parsed.prod.baseUrl).toBe("https://api.example.com");
  });
});

describe("diff-engine", () => {
  const baseEntity: ExtractedEntity = {
    name: "user",
    pascalName: "User",
    pluralName: "users",
    path: "/users",
    fields: [
      { name: "id", snakeName: "id", type: "string", format: "uuid", zodType: "z.string().uuid()", sqlType: "UUID", required: true, nullable: false },
      { name: "name", snakeName: "name", type: "string", zodType: "z.string()", sqlType: "TEXT", required: true, nullable: false },
    ],
    createFields: [],
    updateFields: [],
    queryParams: [],
    operations: { list: true, get: true, create: true, update: true, delete: true },
    tags: [],
  };

  it("detects no changes when entities are identical", () => {
    const snapshot: OpenAPISnapshot = {
      generatedAt: "",
      specSource: "test",
      entities: [baseEntity],
    };

    const diff = computeDiff(snapshot, [baseEntity]);
    expect(diff.hasChanges).toBe(false);
  });

  it("detects added entities", () => {
    const snapshot: OpenAPISnapshot = {
      generatedAt: "",
      specSource: "test",
      entities: [baseEntity],
    };

    const newEntity = { ...baseEntity, name: "product", pascalName: "Product", pluralName: "products", path: "/products" };
    const diff = computeDiff(snapshot, [baseEntity, newEntity]);

    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].name).toBe("product");
  });

  it("detects removed entities", () => {
    const snapshot: OpenAPISnapshot = {
      generatedAt: "",
      specSource: "test",
      entities: [baseEntity],
    };

    const diff = computeDiff(snapshot, []);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].name).toBe("user");
  });

  it("detects modified fields", () => {
    const snapshot: OpenAPISnapshot = {
      generatedAt: "",
      specSource: "test",
      entities: [baseEntity],
    };

    const modified: ExtractedEntity = {
      ...baseEntity,
      fields: [
        ...baseEntity.fields,
        { name: "email", snakeName: "email", type: "string", format: "email", zodType: "z.string().email()", sqlType: "TEXT", required: true, nullable: false },
      ],
    };

    const diff = computeDiff(snapshot, [modified]);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].addedFields).toHaveLength(1);
    expect(diff.modified[0].addedFields[0].name).toBe("email");
  });

  it("formats diff as colored output", () => {
    const snapshot: OpenAPISnapshot = {
      generatedAt: "",
      specSource: "test",
      entities: [baseEntity],
    };

    const newEntity = { ...baseEntity, name: "product", pascalName: "Product", pluralName: "products", path: "/products" };
    const diff = computeDiff(snapshot, [baseEntity, newEntity]);
    const output = formatDiff(diff);

    expect(output).toContain("1 change(s) detected");
    expect(output).toContain("product");
  });
});

describe("entity-extractor tag collection", () => {
  it("collects tags from tagged operations", () => {
    const taggedSpec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Tagged API", version: "1.0.0" },
      paths: {
        "/users": {
          get: {
            tags: ["IAM", "Users"],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                        },
                        required: ["id", "name"],
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ["IAM"],
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { name: { type: "string" } },
                    required: ["name"],
                  },
                },
              },
            },
            responses: { "201": { description: "Created" } },
          },
        },
        "/users/{id}": {
          get: {
            tags: ["Users"],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                      },
                      required: ["id", "name"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities = extractEntities(taggedSpec);
    expect(entities).toHaveLength(1);
    expect(entities[0].tags).toEqual(expect.arrayContaining(["IAM", "Users"]));
    expect(entities[0].tags).toHaveLength(2);
  });

  it("returns empty tags for untagged operations", () => {
    const entities = extractEntities(minimalSpec);
    expect(entities[0].tags).toEqual([]);
  });
});

describe("domain-splitter", () => {
  const makeEntity = (name: string, tags: string[]): ExtractedEntity => ({
    name,
    pascalName: name.charAt(0).toUpperCase() + name.slice(1),
    pluralName: name + "s",
    path: `/${name}s`,
    fields: [],
    createFields: [],
    updateFields: [],
    queryParams: [],
    operations: { list: true, get: false, create: false, update: false, delete: false },
    tags,
  });

  describe("createTagMatcher", () => {
    it("matches exact strings", () => {
      const matcher = createTagMatcher("IAM");
      expect(matcher("IAM")).toBe(true);
      expect(matcher("iam")).toBe(false);
      expect(matcher("IAM-extra")).toBe(false);
    });

    it("matches regex patterns", () => {
      const matcher = createTagMatcher("/^Auth.*/");
      expect(matcher("Authentication")).toBe(true);
      expect(matcher("Authorization")).toBe(true);
      expect(matcher("NoAuth")).toBe(false);
    });
  });

  describe("entityMatchesDomain", () => {
    it("matches entity with exact tag", () => {
      const entity = makeEntity("user", ["IAM", "Users"]);
      expect(entityMatchesDomain(entity, ["IAM"])).toBe(true);
    });

    it("matches entity with regex pattern", () => {
      const entity = makeEntity("token", ["Authentication"]);
      expect(entityMatchesDomain(entity, ["/^Auth.*/"])).toBe(true);
    });

    it("returns false when no tags match", () => {
      const entity = makeEntity("product", ["Catalog"]);
      expect(entityMatchesDomain(entity, ["IAM", "/^Auth.*/"])).toBe(false);
    });

    it("returns false for untagged entity", () => {
      const entity = makeEntity("config", []);
      expect(entityMatchesDomain(entity, ["IAM"])).toBe(false);
    });
  });

  describe("groupEntitiesByDomain", () => {
    it("groups entities by matching domain", () => {
      const entities = [
        makeEntity("user", ["IAM"]),
        makeEntity("invoice", ["Billing"]),
      ];

      const groups = groupEntitiesByDomain(
        entities,
        { iam: ["IAM"], billing: ["Billing"] },
        "misc",
      );

      expect(groups).toHaveLength(2);
      expect(groups.find((g) => g.domainName === "iam")?.entities).toHaveLength(1);
      expect(groups.find((g) => g.domainName === "billing")?.entities).toHaveLength(1);
    });

    it("uses first-match-wins when entity matches multiple domains", () => {
      const entities = [
        makeEntity("authToken", ["IAM", "Authentication"]),
      ];

      const groups = groupEntitiesByDomain(
        entities,
        {
          iam: ["IAM"],
          auth: ["Authentication"],
        },
        "misc",
      );

      // Should match 'iam' first (config order)
      expect(groups).toHaveLength(1);
      expect(groups[0].domainName).toBe("iam");
      expect(groups[0].entities).toHaveLength(1);
    });

    it("sends unmatched entities to fallback domain", () => {
      const entities = [
        makeEntity("user", ["IAM"]),
        makeEntity("config", []),
        makeEntity("setting", ["Misc"]),
      ];

      const groups = groupEntitiesByDomain(
        entities,
        { iam: ["IAM"] },
        "default",
      );

      expect(groups).toHaveLength(2);
      const fallback = groups.find((g) => g.domainName === "default");
      expect(fallback?.entities).toHaveLength(2);
      expect(fallback?.entities.map((e) => e.name)).toEqual(["config", "setting"]);
    });

    it("handles mixed exact and regex patterns", () => {
      const entities = [
        makeEntity("user", ["IAM"]),
        makeEntity("token", ["AuthService"]),
        makeEntity("payment", ["PaymentGateway"]),
      ];

      const groups = groupEntitiesByDomain(
        entities,
        {
          iam: ["IAM", "/^Auth.*/"],
          billing: ["/^Payment.*/"],
        },
        "fallback",
      );

      const iamGroup = groups.find((g) => g.domainName === "iam");
      const billingGroup = groups.find((g) => g.domainName === "billing");

      expect(iamGroup?.entities.map((e) => e.name)).toEqual(["user", "token"]);
      expect(billingGroup?.entities.map((e) => e.name)).toEqual(["payment"]);
    });

    it("returns all entities in fallback when no config matches", () => {
      const entities = [
        makeEntity("user", ["Users"]),
        makeEntity("product", ["Catalog"]),
      ];

      const groups = groupEntitiesByDomain(
        entities,
        { iam: ["IAM"] },
        "default-api",
      );

      expect(groups).toHaveLength(1);
      expect(groups[0].domainName).toBe("default-api");
      expect(groups[0].entities).toHaveLength(2);
    });

    it("returns empty array when no entities provided", () => {
      const groups = groupEntitiesByDomain([], { iam: ["IAM"] }, "misc");
      expect(groups).toEqual([]);
    });
  });
});
