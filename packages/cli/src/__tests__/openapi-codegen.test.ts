import { describe, it, expect } from "vitest";
import { resolveRefs } from "../openapi/schema-resolver.js";
import { extractEntities } from "../openapi/entity-extractor.js";
import { toZodType, generateZodSchemas } from "../openapi/zod-codegen.js";
import { generateHttpFile, generateHttpEnvJson } from "../openapi/http-file-gen.js";
import { computeDiff, formatDiff } from "../openapi/diff-engine.js";
import { createTagMatcher, entityMatchesDomain, groupEntitiesByDomain } from "../openapi/domain-splitter.js";
import type { OpenAPISpec, ExtractedEntity, OpenAPISnapshot } from "../openapi/types.js";
import type { CrudEndpointPattern } from "../config/types.js";
import type { CrudRole } from "@simplix-react/contract";

const standardCrud: Partial<Record<CrudRole, CrudEndpointPattern>> = {
  create: { method: "POST", path: "/" },
  list: { method: "GET", path: "/" },
  get: { method: "GET", path: "/:id" },
  update: { method: "PATCH", path: "/:id" },
  delete: { method: "DELETE", path: "/:id" },
};

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

  it("detects CRUD operations with config patterns", () => {
    const entities = extractEntities(minimalSpec, standardCrud);
    const ops = entities[0].operations;
    const roles = ops.map((op) => op.role).filter(Boolean);

    expect(roles).toContain("list");
    expect(roles).toContain("get");
    expect(roles).toContain("create");
    expect(roles).toContain("update");
    expect(roles).toContain("delete");
  });

  it("assigns no CRUD roles without config", () => {
    const entities = extractEntities(minimalSpec);
    const ops = entities[0].operations;
    const roles = ops.map((op) => op.role).filter(Boolean);

    expect(roles).toHaveLength(0);
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

  it("stores bodySchema on create operation from POST requestBody", () => {
    const entities = extractEntities(minimalSpec, standardCrud);
    const createOp = entities[0].operations.find((op) => op.role === "create");

    expect(createOp?.bodySchema).toBeDefined();
    expect(createOp?.bodySchema?.properties).toHaveProperty("email");
    expect(createOp?.bodySchema?.properties).toHaveProperty("name");
    expect(createOp?.bodySchema?.properties).toHaveProperty("role");
    expect(createOp?.bodySchema?.required).toEqual(["email", "name"]);
  });

  it("stores bodySchema on update operation from PATCH requestBody", () => {
    const entities = extractEntities(minimalSpec, standardCrud);
    const updateOp = entities[0].operations.find((op) => op.role === "update");

    expect(updateOp?.bodySchema).toBeDefined();
    expect(updateOp?.bodySchema?.properties).toHaveProperty("name");
    expect(updateOp?.bodySchema?.properties).toHaveProperty("role");
    // PATCH body has no required → undefined
    expect(updateOp?.bodySchema?.required).toBeUndefined();
  });

  it("has no create operation bodySchema when no POST exists", () => {
    const noPostSpec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "No POST", version: "1.0.0" },
      paths: {
        "/items": {
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
                          id: { type: "string" },
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
        "/items/{id}": {
          get: {
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
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

    const entities = extractEntities(noPostSpec, standardCrud);
    const createOp = entities[0].operations.find((op) => op.role === "create");
    expect(createOp).toBeUndefined();
  });

  it("extracts entities with resolved $refs", () => {
    const resolved = resolveRefs(specWithRefs);
    const entities = extractEntities(resolved);

    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("product");
    expect(entities[0].fields.length).toBeGreaterThan(0);
  });

  it("does not assign list role when GET collection returns a map (non-array)", () => {
    const mapSpec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Map API", version: "1.0.0" },
      paths: {
        "/store/inventory": {
          get: {
            tags: ["store"],
            operationId: "getInventory",
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: { type: "integer", format: "int32" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const entities = extractEntities(mapSpec);
    expect(entities).toHaveLength(1);
    const ops = entities[0].operations;
    const listOp = ops.find((op) => op.role === "list");
    expect(listOp).toBeUndefined();
    // Should be a custom operation with no CRUD role
    // cleanOperationId("getInventory", "inventory") strips entity name → "get"
    expect(ops).toHaveLength(1);
    expect(ops[0].role).toBeUndefined();
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
    const entities = extractEntities(minimalSpec, standardCrud);
    const code = generateZodSchemas(entities);

    expect(code).toContain('import { z } from "zod"');
    expect(code).toContain("export const userSchema = z.object({");
    expect(code).toContain("export const createUserSchema = z.object({");
    expect(code).toContain("export const updateUserSchema = z.object({");
    expect(code).toContain("export type User =");
    expect(code).toContain("export type CreateUser =");
    expect(code).toContain("export type UpdateUser =");
    // Should NOT contain mechanical derivation patterns
    expect(code).not.toContain(".omit(");
    expect(code).not.toContain(".partial()");
  });

  it("does not generate create/update schemas when no requestBody", () => {
    const noBodySpec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "No Body", version: "1.0.0" },
      paths: {
        "/items": {
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
                          id: { type: "string" },
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

    const entities = extractEntities(noBodySpec);
    const code = generateZodSchemas(entities);

    expect(code).toContain("export const itemSchema = z.object({");
    expect(code).not.toContain("createItemSchema");
    expect(code).not.toContain("updateItemSchema");
    expect(code).not.toContain("CreateItem");
    expect(code).not.toContain("UpdateItem");
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
      queryParams: [],
      operations: [
        { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
        { name: "get", method: "GET", path: "/users/:userId", role: "get", hasInput: false, queryParams: [] },
        {
          name: "create", method: "POST", path: "/users", role: "create", hasInput: true, queryParams: [],
          bodySchema: {
            type: "object",
            properties: { email: { type: "string", format: "email" }, name: { type: "string" } },
            required: ["email", "name"],
          },
        },
        {
          name: "update", method: "PATCH", path: "/users/:userId", role: "update", hasInput: true, queryParams: [],
          bodySchema: {
            type: "object",
            properties: { email: { type: "string", format: "email" }, name: { type: "string" } },
          },
        },
        { name: "delete", method: "DELETE", path: "/users/:userId", role: "delete", hasInput: false, queryParams: [] },
      ],
      tags: [],
    };

    const result = generateHttpFile(entity, "/api/test");

    expect(result).toContain("### List User");
    expect(result).toContain("GET {{baseUrl}}/api/test/users");
    expect(result).toContain("### Get User");
    expect(result).toContain("GET {{baseUrl}}/api/test/users/{{userId}}");
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
      { name: "id", snakeName: "id", type: "string", format: "uuid", zodType: "z.string().uuid()", required: true, nullable: false },
      { name: "name", snakeName: "name", type: "string", zodType: "z.string()", required: true, nullable: false },
    ],
    queryParams: [],
    operations: [
      { name: "list", method: "GET", path: "/users", role: "list", hasInput: false, queryParams: [] },
      { name: "get", method: "GET", path: "/users/:id", role: "get", hasInput: false, queryParams: [] },
      { name: "create", method: "POST", path: "/users", role: "create", hasInput: true, queryParams: [] },
      { name: "update", method: "PATCH", path: "/users/:id", role: "update", hasInput: true, queryParams: [] },
      { name: "delete", method: "DELETE", path: "/users/:id", role: "delete", hasInput: false, queryParams: [] },
    ],
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
        { name: "email", snakeName: "email", type: "string", format: "email", zodType: "z.string().email()", required: true, nullable: false },
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
    queryParams: [],
    operations: [
      { name: "list", method: "GET", path: `/${name}s`, role: "list", hasInput: false, queryParams: [] },
    ],
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

describe("CRUD pattern matching", () => {
  it("matches multiple methods in a single pattern", () => {
    const crud: Partial<Record<CrudRole, CrudEndpointPattern>> = {
      update: { method: ["PUT", "PATCH"], path: "/:id" },
    };
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Multi Method", version: "1.0.0" },
      paths: {
        "/items/{id}": {
          put: {
            requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
            responses: { "200": { description: "OK" } },
          },
          patch: {
            requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };

    const entities = extractEntities(spec, crud);
    expect(entities).toHaveLength(1);
    const roles = entities[0].operations.map((op) => op.role);
    // Both PUT and PATCH should be update
    expect(roles.filter((r) => r === "update")).toHaveLength(2);
  });

  it("matches multiple paths in a single pattern", () => {
    const crud: Partial<Record<CrudRole, CrudEndpointPattern>> = {
      update: { method: ["PUT", "PATCH"], path: ["/", "/:id"] },
    };
    const spec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "Multi Path", version: "1.0.0" },
      paths: {
        "/items": {
          put: {
            requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
            responses: { "200": { description: "OK" } },
          },
        },
        "/items/{id}": {
          patch: {
            requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };

    const entities = extractEntities(spec, crud);
    expect(entities).toHaveLength(1);
    const roles = entities[0].operations.map((op) => op.role);
    expect(roles.filter((r) => r === "update")).toHaveLength(2);
  });

  it("handles entities with no discoverable schema", () => {
    const noSchemaSpec: OpenAPISpec = {
      openapi: "3.0.3",
      info: { title: "No Schema", version: "1.0.0" },
      paths: {
        "/things": {
          post: {
            responses: { "202": { description: "Accepted" } },
          },
        },
      },
    };

    const entities = extractEntities(noSchemaSpec);
    expect(entities).toHaveLength(1);
    expect(entities[0].fields).toHaveLength(0);
    const code = generateZodSchemas(entities);
    expect(code).toContain("thingSchema = z.object({");
  });
});

describe("zod-codegen allOf/oneOf/anyOf", () => {
  it("converts allOf to merged z.object", () => {
    const result = toZodType({
      allOf: [
        { type: "object", properties: { a: { type: "string" } }, required: ["a"] },
        { type: "object", properties: { b: { type: "number" } } },
      ],
    });
    expect(result).toContain("a: z.string()");
    expect(result).toContain("b: z.number()");
  });

  it("converts oneOf to z.union", () => {
    expect(toZodType({
      oneOf: [{ type: "string" }, { type: "number" }],
    })).toBe("z.union([z.string(), z.number()])");
  });

  it("converts anyOf to z.union", () => {
    expect(toZodType({
      anyOf: [{ type: "boolean" }, { type: "integer" }],
    })).toBe("z.union([z.boolean(), z.number().int()])");
  });

  it("converts single-variant oneOf without union", () => {
    expect(toZodType({
      oneOf: [{ type: "string" }],
    })).toBe("z.string()");
  });
});
