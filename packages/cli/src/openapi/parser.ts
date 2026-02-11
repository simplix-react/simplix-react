import { readFile } from "node:fs/promises";
import type { OpenAPISpec } from "./types.js";

/**
 * Load and parse OpenAPI spec from URL or file path.
 * Supports both JSON and YAML formats.
 */
export async function loadOpenAPISpec(source: string): Promise<OpenAPISpec> {
  const raw = await loadRawContent(source);
  const parsed = await parseContent(raw, source);
  validateSpec(parsed);
  return parsed as OpenAPISpec;
}

async function loadRawContent(source: string): Promise<string> {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch OpenAPI spec from ${source}: ${res.status} ${res.statusText}`,
      );
    }
    return res.text();
  }

  return readFile(source, "utf-8");
}

async function parseContent(raw: string, source: string): Promise<unknown> {
  // Try JSON first
  const trimmed = raw.trimStart();
  if (trimmed.startsWith("{")) {
    return JSON.parse(raw);
  }

  // Try YAML
  try {
    const yaml = await import("yaml");
    return yaml.parse(raw);
  } catch {
    throw new Error(
      `Failed to parse OpenAPI spec from ${source}. Ensure it is valid JSON or YAML.`,
    );
  }
}

function validateSpec(parsed: unknown): asserts parsed is OpenAPISpec {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("OpenAPI spec must be a valid object");
  }

  const spec = parsed as Record<string, unknown>;

  if (typeof spec.openapi !== "string") {
    throw new Error(
      'Missing or invalid "openapi" field. Only OpenAPI 3.x is supported.',
    );
  }

  if (!spec.openapi.startsWith("3.")) {
    throw new Error(
      `Unsupported OpenAPI version: ${spec.openapi}. Only 3.x is supported.`,
    );
  }

  if (!spec.info || typeof spec.info !== "object") {
    throw new Error('Missing "info" section in OpenAPI spec.');
  }

  if (!spec.paths || typeof spec.paths !== "object") {
    throw new Error('Missing "paths" section in OpenAPI spec.');
  }
}
