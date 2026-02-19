import type { AccessPolicy, AccessRule, AccessUser } from "@simplix-react/access";
import { createAccessPolicy, createStaticAdapter } from "@simplix-react/access";

/**
 * Options for {@link createMockPolicy}.
 */
export interface MockPolicyOptions {
  /** CASL rules to apply. Defaults to `[]`. */
  rules?: AccessRule[];
  /** Test user identity. */
  user?: AccessUser;
  /**
   * When `true` and no `rules` are provided, grants `manage` on `all`.
   *
   * @defaultValue true
   */
  allowAll?: boolean;
}

/**
 * Creates a mock {@link AccessPolicy} for testing purposes.
 *
 * @remarks
 * By default the policy grants full access (`manage` on `all`) so that
 * tests do not need to set up fine-grained permissions unless specifically
 * testing access control logic.
 *
 * @example Default — full access
 * ```ts
 * const policy = createMockPolicy();
 * policy.can("edit", "Pet"); // true
 * ```
 *
 * @example Restricted access
 * ```ts
 * const policy = createMockPolicy({
 *   rules: [{ action: "view", subject: "Pet" }],
 *   allowAll: false,
 * });
 * policy.can("view", "Pet"); // true
 * policy.can("edit", "Pet"); // false
 * ```
 */
export function createMockPolicy(options: MockPolicyOptions = {}): AccessPolicy<string, string> {
  const { rules, user, allowAll = true } = options;

  const effectiveRules: AccessRule[] =
    rules ?? (allowAll ? [{ action: "manage", subject: "all" }] : []);

  const effectiveUser: AccessUser = user ?? {
    userId: "test-user",
    username: "testuser",
    roles: [],
  };

  const policy = createAccessPolicy({
    adapter: createStaticAdapter(effectiveRules, effectiveUser),
  });

  policy.setRules(effectiveRules, effectiveUser, effectiveUser.roles);

  return policy;
}
