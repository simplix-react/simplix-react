import type { OpenAPISpecConfig } from "../config/types.js";
import type { OpenApiNamingStrategy } from "./naming-strategy.js";
import type { ResponseAdapterConfig } from "./response-adapter.js";
import type { SpecProfile } from "./spec-profile.js";
import { SPEC_PROFILES } from "./presets/spec-profiles.js";

/** Resolved config after applying profile defaults + config overrides */
export interface ResolvedSpecConfig {
  naming?: OpenApiNamingStrategy;
  responseAdapter: ResponseAdapterConfig;
  mutatorHint?: SpecProfile["mutatorHint"];
  mutatorStrategy?: string;
  i18nEndpoint?: string;
}

/**
 * Resolves an OpenAPISpecConfig into naming/responseAdapter by:
 * 1. config override (highest priority)
 * 2. profile preset
 * 3. defaults ("raw")
 */
export function resolveSpecConfig(config: OpenAPISpecConfig): ResolvedSpecConfig {
  const profile = config.profile ? SPEC_PROFILES[config.profile] : undefined;
  return {
    naming: config.naming ?? profile?.naming,
    responseAdapter: config.responseAdapter ?? profile?.responseAdapter ?? "raw",
    mutatorHint: profile?.mutatorHint,
    mutatorStrategy: profile?.mutatorStrategy,
    i18nEndpoint: profile?.i18nEndpoint,
  };
}
