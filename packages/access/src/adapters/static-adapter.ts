import type {
  AccessAdapter,
  AccessExtractResult,
  AccessRule,
  AccessUser,
} from "../types.js";

/**
 * Creates an adapter that always returns the same static rules.
 *
 * @remarks
 * Useful for testing, development, or defining public access rules
 * via the `publicAccess` option in {@link AccessPolicyConfig}.
 *
 * @param rules - Fixed CASL rules to return on every `extract` call.
 * @param user - Optional user info to include in the result.
 * @returns An {@link AccessAdapter} that always returns the given rules.
 *
 * @example
 * ```ts
 * import { createStaticAdapter } from "@simplix-react/access";
 *
 * const adapter = createStaticAdapter(
 *   [{ action: "view", subject: "Pet" }],
 *   { userId: "anon", username: "anonymous", roles: [] },
 * );
 * ```
 */
export function createStaticAdapter(
  rules: AccessRule[],
  user?: AccessUser,
): AccessAdapter {
  return {
    async extract(_authData: unknown): Promise<AccessExtractResult> {
      return { rules, user, roles: user?.roles ?? [] };
    },
  };
}
