import type { OpenAPISpec, SchemaObject } from "./types.js";

/**
 * Resolve all $ref references and merge allOf/oneOf/anyOf in the spec.
 * Returns a new spec with all references inlined.
 */
export function resolveRefs(spec: OpenAPISpec): OpenAPISpec {
  const resolver = new SchemaResolver(spec);
  return resolver.resolve();
}

class SchemaResolver {
  private schemas: Record<string, SchemaObject>;

  constructor(private spec: OpenAPISpec) {
    this.schemas = spec.components?.schemas ?? {};
  }

  resolve(): OpenAPISpec {
    const resolved: OpenAPISpec = JSON.parse(JSON.stringify(this.spec));

    // Resolve all schemas in components
    if (resolved.components?.schemas) {
      for (const [name, schema] of Object.entries(
        resolved.components.schemas,
      )) {
        resolved.components.schemas[name] = this.resolveSchema(schema);
      }
    }

    // Resolve schemas in paths
    for (const pathItem of Object.values(resolved.paths)) {
      for (const method of [
        "get",
        "post",
        "put",
        "patch",
        "delete",
      ] as const) {
        const op = pathItem[method];
        if (!op) continue;

        // Resolve request body schemas
        if (op.requestBody?.content) {
          for (const mediaType of Object.values(op.requestBody.content)) {
            if (mediaType.schema) {
              mediaType.schema = this.resolveSchema(mediaType.schema);
            }
          }
        }

        // Resolve response schemas
        if (op.responses) {
          for (const response of Object.values(op.responses)) {
            if (response.content) {
              for (const mediaType of Object.values(response.content)) {
                if (mediaType.schema) {
                  mediaType.schema = this.resolveSchema(mediaType.schema);
                }
              }
            }
          }
        }

        // Resolve parameter schemas
        if (op.parameters) {
          for (const param of op.parameters) {
            if (param.schema) {
              param.schema = this.resolveSchema(param.schema);
            }
          }
        }
      }

      // Resolve path-level parameters
      if (pathItem.parameters) {
        for (const param of pathItem.parameters) {
          if (param.schema) {
            param.schema = this.resolveSchema(param.schema);
          }
        }
      }
    }

    return resolved;
  }

  private resolveSchema(schema: SchemaObject): SchemaObject {
    // Handle $ref
    if (schema.$ref) {
      const resolved = this.resolveRef(schema.$ref);
      return this.resolveSchema(resolved);
    }

    // Handle allOf — merge all schemas
    if (schema.allOf) {
      return this.mergeAllOf(schema.allOf);
    }

    // Handle oneOf/anyOf — use the first schema as representative
    if (schema.oneOf?.length) {
      return this.resolveSchema(schema.oneOf[0]);
    }
    if (schema.anyOf?.length) {
      return this.resolveSchema(schema.anyOf[0]);
    }

    // Resolve nested properties
    if (schema.properties) {
      const resolved: Record<string, SchemaObject> = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        resolved[key] = this.resolveSchema(prop);
      }
      schema.properties = resolved;
    }

    // Resolve array items
    if (schema.items) {
      schema.items = this.resolveSchema(schema.items);
    }

    return schema;
  }

  private resolveRef(ref: string): SchemaObject {
    // Handle #/components/schemas/Name
    const match = ref.match(/^#\/components\/schemas\/(.+)$/);
    if (!match) {
      throw new Error(`Unsupported $ref format: ${ref}`);
    }

    const schemaName = match[1];
    const schema = this.schemas[schemaName];
    if (!schema) {
      throw new Error(`Schema not found: ${schemaName} (referenced by ${ref})`);
    }

    return JSON.parse(JSON.stringify(schema));
  }

  private mergeAllOf(schemas: SchemaObject[]): SchemaObject {
    const merged: SchemaObject = {
      type: "object",
      properties: {},
      required: [],
    };

    for (const schema of schemas) {
      const resolved = this.resolveSchema(schema);
      if (resolved.properties) {
        merged.properties = { ...merged.properties, ...resolved.properties };
      }
      if (resolved.required) {
        merged.required = [
          ...new Set([...(merged.required ?? []), ...resolved.required]),
        ];
      }
    }

    if (merged.required?.length === 0) {
      delete merged.required;
    }

    return merged;
  }
}
