import type { OpenAPISpecConfig } from "../../config/types.js";
import type { OpenApiNamingStrategy } from "../naming/naming-strategy.js";
import type { ResponseAdapterConfig } from "../adaptation/response-adapter.js";
import type { SpecProfile, I18nDownloader } from "./spec-profile.js";
import { getSpecProfile } from "../plugin-registry.js";

/** Resolved config after applying profile defaults + config overrides */
export interface ResolvedSpecConfig {
  naming?: OpenApiNamingStrategy;
  responseAdapter: ResponseAdapterConfig;
  mutatorHint?: SpecProfile["mutatorHint"];
  mutatorStrategy?: string;
  i18nEndpoint?: string;
  i18nDownloader?: I18nDownloader;
}

/**
 * Resolves an OpenAPISpecConfig into naming/responseAdapter by:
 * 1. config override (highest priority)
 * 2. profile preset
 * 3. defaults ("raw")
 */
export function resolveSpecConfig(config: OpenAPISpecConfig): ResolvedSpecConfig {
  const profile = config.profile ? getSpecProfile(config.profile) : undefined;
  return {
    naming: config.naming ?? profile?.naming,
    responseAdapter: config.responseAdapter ?? profile?.responseAdapter ?? "raw",
    mutatorHint: profile?.mutatorHint,
    mutatorStrategy: profile?.mutatorStrategy,
    i18nEndpoint: profile?.i18nEndpoint,
    i18nDownloader: profile?.i18nDownloader,
  };
}
