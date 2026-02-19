import type { MongoAbility, RawRuleOf } from "@casl/ability";

// ── Actions & Subjects ──

/**
 * Default action verbs for access control.
 *
 * @remarks
 * Covers common CRUD and workflow operations.
 * Provide custom action types via the `TActions` generic parameter
 * on {@link AccessPolicy} or {@link createAccessPolicy}.
 *
 * @example
 * ```ts
 * // Use defaults
 * const policy = createAccessPolicy({ adapter });
 * policy.can("view", "Pet");
 *
 * // Narrow to custom actions
 * type MyActions = "read" | "write" | "admin";
 * const policy = createAccessPolicy<MyActions, string>({ adapter });
 * ```
 */
export type DefaultActions =
  | "list"
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "export"
  | "import"
  | "approve"
  | "manage";

/** Default subject type — any string identifier for a resource. */
export type DefaultSubjects = string;

// ── CASL Type Wrappers ──

/**
 * A CASL {@link MongoAbility} parameterized with action and subject types.
 *
 * @remarks
 * The subject union always includes `"all"` to support wildcard rules
 * such as `{ action: "manage", subject: "all" }` for super-admin bypass.
 *
 * @typeParam TActions - Action verb union (defaults to {@link DefaultActions}).
 * @typeParam TSubjects - Subject name union (defaults to any `string`).
 */
export type AccessAbility<
  TActions extends string = DefaultActions,
  TSubjects extends string = DefaultSubjects,
> = MongoAbility<[TActions, TSubjects | "all"]>;

/**
 * A single CASL rule derived from {@link AccessAbility}.
 *
 * @remarks
 * This is the raw rule format accepted by `createMongoAbility`.
 * At minimum, each rule contains `action` and `subject` fields.
 *
 * @typeParam TActions - Action verb union (defaults to {@link DefaultActions}).
 * @typeParam TSubjects - Subject name union (defaults to any `string`).
 *
 * @example
 * ```ts
 * const rule: AccessRule = { action: "view", subject: "Pet" };
 * const wildcard: AccessRule = { action: "manage", subject: "all" };
 * ```
 */
export type AccessRule<
  TActions extends string = DefaultActions,
  TSubjects extends string = DefaultSubjects,
> = RawRuleOf<AccessAbility<TActions, TSubjects>>;

// ── Data Structures ──

/**
 * A map of resource names to their allowed actions.
 *
 * @example
 * ```ts
 * const permissions: PermissionMap = {
 *   Pet: ["list", "view", "create"],
 *   Order: ["list", "view"],
 * };
 * ```
 */
export interface PermissionMap {
  [resource: string]: string[];
}

/**
 * Represents an authenticated user for access control purposes.
 *
 * @typeParam TMeta - Shape of the optional {@link AccessUser.metadata | metadata} field.
 *
 * @example
 * ```ts
 * const user: AccessUser = {
 *   userId: "user-1",
 *   username: "john",
 *   roles: ["ROLE_ADMIN"],
 *   isSuperAdmin: false,
 * };
 * ```
 */
export interface AccessUser<TMeta = Record<string, unknown>> {
  /** Unique user identifier (e.g., from JWT `sub` claim). */
  userId: string;
  /** Login username. */
  username: string;
  /** Human-readable display name. */
  displayName?: string;
  /** Assigned roles. */
  roles: string[];
  /** Whether this user bypasses all access checks. */
  isSuperAdmin?: boolean;
  /** Arbitrary user metadata. */
  metadata?: TMeta;
}

// ── Adapter ──

/**
 * The result of extracting access information from an auth source.
 *
 * @remarks
 * Defaults to `string` generics because adapters parse arbitrary
 * runtime data. Consumers narrow the types at the policy level.
 *
 * @typeParam TActions - Action verb union.
 * @typeParam TSubjects - Subject name union.
 *
 * @example
 * ```ts
 * const result: AccessExtractResult = {
 *   rules: [{ action: "view", subject: "Pet" }],
 *   user: { userId: "1", username: "john", roles: ["ROLE_USER"] },
 *   roles: ["ROLE_USER"],
 * };
 * ```
 */
export interface AccessExtractResult<
  TActions extends string = string,
  TSubjects extends string = string,
> {
  /** CASL rules derived from the auth source. */
  rules: AccessRule<TActions, TSubjects>[];
  /** User information, if available. */
  user?: AccessUser;
  /** Role names extracted from the auth source. */
  roles?: string[];
}

/**
 * Defines how to extract access rules from an authentication data source.
 *
 * @remarks
 * Adapters bridge the gap between auth providers (JWT, API, static config)
 * and the CASL-based access policy. Implement this interface to support
 * custom auth sources.
 *
 * @typeParam TActions - Action verb union.
 * @typeParam TSubjects - Subject name union.
 *
 * @example
 * ```ts
 * const adapter: AccessAdapter = {
 *   async extract(authData) {
 *     const token = authData as string;
 *     const claims = decodeJwt(token);
 *     return { rules: claims.permissions, user: claims.user, roles: claims.roles };
 *   },
 * };
 * ```
 *
 * @see {@link createJwtAdapter} for JWT-based extraction.
 * @see {@link createApiAdapter} for API endpoint-based extraction.
 * @see {@link createStaticAdapter} for hardcoded rules.
 */
export interface AccessAdapter<
  TActions extends string = string,
  TSubjects extends string = string,
> {
  /**
   * Extracts access rules, user info, and roles from the given auth data.
   *
   * @param authData - Raw auth data (e.g., JWT string, API response).
   */
  extract(
    authData: unknown,
  ): Promise<AccessExtractResult<TActions, TSubjects>>;
}

// ── Persistence ──

/**
 * Configuration for persisting access state to storage.
 *
 * @example
 * ```ts
 * const persist: AccessPersistConfig = {
 *   storage: localStorage,
 *   key: "my-app-access",
 * };
 * ```
 */
export interface AccessPersistConfig {
  /** Storage backend. Defaults to `localStorage`. */
  storage?: Storage;
  /** Storage key. Defaults to `"simplix-access"`. */
  key?: string;
  /** Whether to revalidate persisted state on mount. */
  revalidateOnMount?: boolean;
}

// ── Policy Config ──

/**
 * Configuration for creating an {@link AccessPolicy}.
 *
 * @typeParam TActions - Action verb union (defaults to {@link DefaultActions}).
 * @typeParam TSubjects - Subject name union (defaults to any `string`).
 *
 * @example
 * ```ts
 * import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
 *
 * const config: AccessPolicyConfig = {
 *   adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
 *   isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
 *   persist: { storage: localStorage },
 * };
 * const policy = createAccessPolicy(config);
 * ```
 *
 * @see {@link createAccessPolicy}
 */
export interface AccessPolicyConfig<
  TActions extends string = DefaultActions,
  TSubjects extends string = DefaultSubjects,
> {
  /** Adapter that extracts rules from auth data. */
  adapter: AccessAdapter<TActions, TSubjects>;
  /**
   * Rules or adapter for unauthenticated (public) access.
   * If an array, used as static rules. If an adapter, called with `null`.
   */
  publicAccess?:
    | AccessRule<TActions, TSubjects>[]
    | AccessAdapter<TActions, TSubjects>;
  /** Custom super-admin check. Defaults to checking `user.isSuperAdmin`. */
  isSuperAdmin?: (user: AccessUser) => boolean;
  /** Callback invoked when an access check fails. */
  onAccessDenied?: (action: string, subject: string) => void;
  /** Persistence configuration. */
  persist?: AccessPersistConfig;
}

// ── Snapshot ──

/**
 * A serializable snapshot of the current access state.
 *
 * @remarks
 * Returned by {@link AccessPolicy.getSnapshot}. Used internally by
 * `useSyncExternalStore` for reference-stable reactive updates.
 *
 * @typeParam TActions - Action verb union (defaults to {@link DefaultActions}).
 * @typeParam TSubjects - Subject name union (defaults to any `string`).
 */
export interface AccessSnapshot<
  TActions extends string = DefaultActions,
  TSubjects extends string = DefaultSubjects,
> {
  /** Current user, or `null` if unauthenticated. */
  user: AccessUser | null;
  /** Current role names. */
  roles: string[];
  /** Current CASL rules. */
  rules: AccessRule<TActions, TSubjects>[];
}

// ── Policy Instance ──

/**
 * The main access policy interface.
 *
 * @remarks
 * Wraps a CASL ability instance with user/role management,
 * persistence, and a subscription model for React integration.
 * Created via {@link createAccessPolicy}.
 *
 * @typeParam TActions - Action verb union (defaults to {@link DefaultActions}).
 * @typeParam TSubjects - Subject name union (defaults to any `string`).
 *
 * @example
 * ```ts
 * import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
 *
 * const policy = createAccessPolicy({
 *   adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
 * });
 *
 * await policy.update(null);
 * policy.can("view", "Pet");    // true
 * policy.hasRole("ADMIN");      // true
 * ```
 *
 * @see {@link createAccessPolicy} to create an instance.
 */
export interface AccessPolicy<
  TActions extends string = DefaultActions,
  TSubjects extends string = DefaultSubjects,
> {
  /** The underlying CASL ability instance. */
  readonly ability: AccessAbility<TActions, TSubjects>;
  /** The current authenticated user, or `null`. */
  readonly user: AccessUser | null;
  /** The current role names. */
  readonly roles: string[];

  /**
   * Returns `true` if the given action is allowed on the subject.
   *
   * @param action - The action to check (e.g., `"view"`, `"edit"`).
   * @param subject - The subject to check against (e.g., `"Pet"`, `"all"`).
   * @returns `true` if allowed.
   */
  can(action: TActions, subject: TSubjects | "all"): boolean;

  /**
   * Returns `true` if the given action is NOT allowed on the subject.
   *
   * @param action - The action to check.
   * @param subject - The subject to check against.
   * @returns `true` if denied.
   */
  cannot(action: TActions, subject: TSubjects | "all"): boolean;

  /**
   * Checks if the current user has the given role.
   *
   * @remarks
   * Role matching is prefix-insensitive: `"ADMIN"` matches `"ROLE_ADMIN"`.
   *
   * @param role - The role to check (with or without `ROLE_` prefix).
   * @returns `true` if the user has the role.
   */
  hasRole(role: string): boolean;

  /**
   * Checks if the current user has any of the given roles.
   *
   * @param roles - Role names to check (with or without `ROLE_` prefix).
   * @returns `true` if the user has at least one of the roles.
   */
  hasAnyRole(roles: string[]): boolean;

  /**
   * Updates access state by extracting rules from the given auth data.
   *
   * @param authData - Raw auth data passed to the adapter (e.g., JWT string).
   */
  update(authData: unknown): Promise<void>;

  /**
   * Directly sets rules, user, and roles without going through the adapter.
   *
   * @remarks
   * Omitted `user` and `roles` parameters preserve their current values.
   *
   * @param rules - CASL rules to apply.
   * @param user - User info to set (keeps current if omitted).
   * @param roles - Role names to set (keeps current if omitted).
   */
  setRules(
    rules: AccessRule<TActions, TSubjects>[],
    user?: AccessUser,
    roles?: string[],
  ): void;

  /** Clears all access state and persisted data. */
  clear(): void;

  /**
   * Loads public (unauthenticated) access rules from the config.
   *
   * @remarks
   * Uses the `publicAccess` value from {@link AccessPolicyConfig}.
   * Does nothing if `publicAccess` is not configured.
   */
  loadPublicAccess(): Promise<void>;

  /**
   * Attempts to rehydrate access state from persisted storage.
   *
   * @returns `true` if state was successfully restored, `false` otherwise.
   */
  rehydrate(): boolean;

  /**
   * Subscribes to access state changes.
   *
   * @param listener - Callback invoked when rules, user, or roles change.
   * @returns An unsubscribe function.
   */
  subscribe(listener: () => void): () => void;

  /**
   * Returns a serializable snapshot of the current state.
   *
   * @remarks
   * The snapshot reference is stable between state changes, making it
   * safe for use with `useSyncExternalStore`.
   *
   * @returns The current {@link AccessSnapshot}.
   */
  getSnapshot(): AccessSnapshot<TActions, TSubjects>;
}
