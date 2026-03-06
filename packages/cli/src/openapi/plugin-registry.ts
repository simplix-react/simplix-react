import type { SpecProfile } from "./orchestration/spec-profile.js";
import type { ResponseAdapterPreset } from "./adaptation/response-adapter.js";

/**
 * Defines a CLI plugin that bundles spec profiles and response adapter presets.
 *
 * Plugins are registered via {@link registerPlugin} to make their presets
 * available throughout the CLI pipeline.
 *
 * @example
 * ```ts
 * import { registerPlugin, type CliPlugin } from "@simplix-react/cli";
 *
 * const myPlugin: CliPlugin = {
 *   id: "my-backend",
 *   specs: { "my-backend": mySpecProfile },
 *   responseAdapters: { "my-backend": myAdapterPreset },
 * };
 * registerPlugin(myPlugin);
 * ```
 */
export interface CliPlugin {
  /** Unique identifier for this plugin. */
  id: string;
  /** Named spec profiles to register (key = profile name). */
  specs?: Record<string, SpecProfile>;
  /** Named response adapter presets to register (key = preset name). */
  responseAdapters?: Record<string, ResponseAdapterPreset>;
}

/**
 * Adapter for unwrapping vendor-specific schema wrappers during code generation.
 *
 * Schema adapters are evaluated in registration order. The first adapter whose
 * `canUnwrap` returns `true` is used to unwrap the schema.
 *
 * @example
 * ```ts
 * import { registerSchemaAdapter, type SchemaAdapter } from "@simplix-react/cli";
 *
 * const adapter: SchemaAdapter = {
 *   id: "my-wrapper",
 *   canUnwrap: (schema) => !!schema["x-my-wrapper"],
 *   unwrap: (schema) => schema["x-my-wrapper"] as Record<string, unknown>,
 * };
 * registerSchemaAdapter(adapter);
 * ```
 */
export interface SchemaAdapter {
  /** Unique identifier for this adapter. */
  id: string;
  /** Returns `true` if this adapter can unwrap the given schema object. */
  canUnwrap(schema: Record<string, unknown>): boolean;
  /** Extracts the inner schema from a vendor wrapper. */
  unwrap(schema: Record<string, unknown>): Record<string, unknown>;
  /** Optionally strips a vendor prefix from a generated type name. */
  stripPrefix?(typeName: string): string;
}

const specProfiles = new Map<string, SpecProfile>();
const responseAdapterPresets = new Map<string, ResponseAdapterPreset>();
const schemaAdapters: SchemaAdapter[] = [];

/**
 * Registers a named spec profile into the global registry.
 *
 * Spec profiles bundle a naming strategy and response adapter config
 * for a specific backend convention (e.g., Spring Boot, NestJS).
 *
 * @param name - The profile name referenced in `simplix.config.ts`
 * @param profile - The spec profile definition
 *
 * @example
 * ```ts
 * import { registerSpecProfile } from "@simplix-react/cli";
 *
 * registerSpecProfile("spring-boot", {
 *   naming: springBootNamingStrategy,
 *   responseAdapter: "boot",
 * });
 * ```
 */
export function registerSpecProfile(name: string, profile: SpecProfile): void {
  specProfiles.set(name, profile);
}

/**
 * Registers a named response adapter preset into the global registry.
 *
 * Response adapter presets control how generated hooks unwrap API responses.
 *
 * @param name - The preset name referenced in response adapter configs
 * @param preset - The response adapter preset definition
 *
 * @example
 * ```ts
 * import { registerResponseAdapterPreset } from "@simplix-react/cli";
 *
 * registerResponseAdapterPreset("my-api", {
 *   unwrapExpression: "data?.result",
 *   mockResponseWrapper: "wrapMyApiResponse",
 * });
 * ```
 */
export function registerResponseAdapterPreset(
  name: string,
  preset: ResponseAdapterPreset,
): void {
  responseAdapterPresets.set(name, preset);
}

/**
 * Registers a schema adapter for unwrapping vendor-specific schema wrappers.
 *
 * Adapters are evaluated in registration order during code generation.
 *
 * @param adapter - The schema adapter to register
 *
 * @example
 * ```ts
 * import { registerSchemaAdapter } from "@simplix-react/cli";
 *
 * registerSchemaAdapter({
 *   id: "hateoas",
 *   canUnwrap: (s) => !!s._embedded,
 *   unwrap: (s) => s._embedded as Record<string, unknown>,
 * });
 * ```
 */
export function registerSchemaAdapter(adapter: SchemaAdapter): void {
  schemaAdapters.push(adapter);
}

/**
 * Looks up a spec profile by name.
 *
 * @param name - The profile name to look up
 * @returns The matching {@link SpecProfile}, or `undefined` if not registered
 *
 * @example
 * ```ts
 * import { getSpecProfile } from "@simplix-react/cli";
 *
 * const profile = getSpecProfile("simplix-boot");
 * if (profile) {
 *   console.log(profile.naming);
 * }
 * ```
 */
export function getSpecProfile(name: string): SpecProfile | undefined {
  return specProfiles.get(name);
}

/**
 * Looks up a response adapter preset by name.
 *
 * @param name - The preset name to look up
 * @returns The matching {@link ResponseAdapterPreset}, or `undefined` if not registered
 *
 * @example
 * ```ts
 * import { getResponseAdapterPreset } from "@simplix-react/cli";
 *
 * const preset = getResponseAdapterPreset("boot");
 * if (preset) {
 *   console.log(preset.unwrapExpression);
 * }
 * ```
 */
export function getResponseAdapterPreset(
  name: string,
): ResponseAdapterPreset | undefined {
  return responseAdapterPresets.get(name);
}

/**
 * Returns all registered schema adapters in registration order.
 *
 * @returns A readonly array of {@link SchemaAdapter} instances
 */
export function getSchemaAdapters(): readonly SchemaAdapter[] {
  return schemaAdapters;
}

/**
 * Registers all spec profiles and response adapter presets bundled in a plugin.
 *
 * This is a convenience function that calls {@link registerSpecProfile} and
 * {@link registerResponseAdapterPreset} for each entry in the plugin.
 *
 * @param plugin - The CLI plugin to register
 *
 * @example
 * ```ts
 * import { registerPlugin } from "@simplix-react/cli";
 *
 * registerPlugin({
 *   id: "my-backend",
 *   specs: { "my-backend": mySpecProfile },
 *   responseAdapters: { "my-backend": myAdapterPreset },
 * });
 * ```
 */
export function registerPlugin(plugin: CliPlugin): void {
  if (plugin.specs) {
    for (const [name, profile] of Object.entries(plugin.specs)) {
      registerSpecProfile(name, profile);
    }
  }
  if (plugin.responseAdapters) {
    for (const [name, preset] of Object.entries(plugin.responseAdapters)) {
      registerResponseAdapterPreset(name, preset);
    }
  }
}
