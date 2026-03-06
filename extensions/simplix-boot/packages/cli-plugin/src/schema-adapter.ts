import type { SchemaAdapter } from "@simplix-react/cli";

const BOOT_ENVELOPE_PREFIX = "SimpliXApiResponse";

/**
 * Schema adapter for boot-style API envelopes.
 *
 * Boot envelopes have top-level: type, message, body, timestamp, errorCode, errorDetail.
 * The `body` sub-schema contains the actual entity fields.
 */
export const bootSchemaAdapter: SchemaAdapter = {
  id: "boot",

  canUnwrap(schema: Record<string, unknown>): boolean {
    const properties = schema["properties"] as Record<string, Record<string, unknown>> | undefined;
    if (!properties) return false;
    const { body, type, message } = properties;
    return (
      type?.["type"] === "string" &&
      message?.["type"] === "string" &&
      body?.["type"] === "object" &&
      !!body["properties"] &&
      Object.keys(body["properties"] as object).length > 0
    );
  },

  unwrap(schema: Record<string, unknown>): Record<string, unknown> {
    const properties = schema["properties"] as Record<string, Record<string, unknown>>;
    return properties["body"];
  },

  stripPrefix(typeName: string): string {
    if (typeName.startsWith(BOOT_ENVELOPE_PREFIX)) {
      return typeName.slice(BOOT_ENVELOPE_PREFIX.length);
    }
    return typeName;
  },
};
