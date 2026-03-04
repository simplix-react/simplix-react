import type { SpecProfile } from "../spec-profile.js";
import { simplixBootNaming } from "./simplix-boot-naming.js";

/**
 * Spec Profile registry.
 * Profiles bundle a NamingStrategy + ResponseAdapter + mutatorHint
 * and are referenced by name in simplix.config.ts via `profile: "simplix-boot"`.
 */
export const SPEC_PROFILES: Record<string, SpecProfile> = {
  "simplix-boot": {
    naming: simplixBootNaming,
    responseAdapter: "boot",
    mutatorHint: {
      errorAdapterImport:
        'import { bootResponseAdapter } from "@simplix-react-ext/simplix-boot-auth"',
      errorAdapterExpression: "{ toError: bootResponseAdapter.toError }",
    },
    mutatorStrategy: "boot",
    dependencies: {
      "@simplix-react-ext/simplix-boot-auth": "workspace:*",
    },
    i18nEndpoint: "/api/v1/dev/i18n/messages",
  },
};
