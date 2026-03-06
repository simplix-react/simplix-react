import type { SpecProfile } from "./orchestration/spec-profile.js";
import type { ResponseAdapterPreset } from "./adaptation/response-adapter.js";

export interface CliPlugin {
  id: string;
  specs?: Record<string, SpecProfile>;
  responseAdapters?: Record<string, ResponseAdapterPreset>;
}

export interface SchemaAdapter {
  id: string;
  canUnwrap(schema: Record<string, unknown>): boolean;
  unwrap(schema: Record<string, unknown>): Record<string, unknown>;
  stripPrefix?(typeName: string): string;
}

const specProfiles = new Map<string, SpecProfile>();
const responseAdapterPresets = new Map<string, ResponseAdapterPreset>();
const schemaAdapters: SchemaAdapter[] = [];

export function registerSpecProfile(name: string, profile: SpecProfile): void {
  specProfiles.set(name, profile);
}

export function registerResponseAdapterPreset(
  name: string,
  preset: ResponseAdapterPreset,
): void {
  responseAdapterPresets.set(name, preset);
}

export function registerSchemaAdapter(adapter: SchemaAdapter): void {
  schemaAdapters.push(adapter);
}

export function getSpecProfile(name: string): SpecProfile | undefined {
  return specProfiles.get(name);
}

export function getResponseAdapterPreset(
  name: string,
): ResponseAdapterPreset | undefined {
  return responseAdapterPresets.get(name);
}

export function getSchemaAdapters(): readonly SchemaAdapter[] {
  return schemaAdapters;
}

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
