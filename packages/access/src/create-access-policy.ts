import { createMongoAbility } from "@casl/ability";
import type { AnyAbility } from "@casl/ability";
import type {
  AccessAbility,
  AccessPolicy,
  AccessPolicyConfig,
  AccessRule,
  AccessSnapshot,
  AccessUser,
} from "./types.js";
import {
  hasAnyRole as checkAnyRole,
  hasRole as checkRole,
} from "./helpers/role-utils.js";
import {
  checkSuperAdmin,
  createSuperAdminRules,
} from "./helpers/super-admin.js";

const DEFAULT_PERSIST_KEY = "simplix-access";

/**
 * Creates an {@link AccessPolicy} instance backed by CASL.
 *
 * @remarks
 * The policy manages a CASL ability, user info, and roles.
 * It supports adapter-based rule extraction, persistence,
 * super-admin bypass, and a subscription model for React integration.
 *
 * The returned policy exposes a stable `getSnapshot()` reference
 * for use with `useSyncExternalStore`, preventing infinite re-render loops.
 *
 * @typeParam TActions - Action verb union (defaults to {@link DefaultActions}).
 * @typeParam TSubjects - Subject name union (defaults to any `string`).
 *
 * @param config - Policy configuration including adapter, persistence, and super-admin settings.
 * @returns A fully initialized {@link AccessPolicy} with empty state.
 *
 * @example
 * ```ts
 * import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
 *
 * const policy = createAccessPolicy({
 *   adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
 *   isSuperAdmin: (user) => user.roles.includes("ROLE_SYSTEM_ADMIN"),
 *   persist: { storage: localStorage },
 * });
 *
 * await policy.update(jwtToken);
 * policy.can("view", "Pet"); // true or false
 * ```
 *
 * @see {@link AccessPolicyConfig} for configuration options.
 * @see {@link AccessPolicy} for the returned interface.
 */
export function createAccessPolicy<
  TActions extends string = string,
  TSubjects extends string = string,
>(
  config: AccessPolicyConfig<TActions, TSubjects>,
): AccessPolicy<TActions, TSubjects> {
  let ability: AccessAbility<TActions, TSubjects> = createMongoAbility<
    [TActions, TSubjects | "all"]
  >([]);
  let currentUser: AccessUser | null = null;
  let currentRoles: string[] = [];
  let currentRules: AccessRule<TActions, TSubjects>[] = [];
  const listeners = new Set<() => void>();

  // Cached snapshot for useSyncExternalStore reference stability.
  // Only updated when state changes to avoid infinite re-render loops.
  let cachedSnapshot: AccessSnapshot<TActions, TSubjects> = {
    user: null,
    roles: [],
    rules: [],
  };

  function updateSnapshot(): void {
    cachedSnapshot = {
      user: currentUser,
      roles: currentRoles,
      rules: currentRules,
    };
  }

  function notify(): void {
    updateSnapshot();
    for (const listener of listeners) listener();
  }

  function applyRules(
    rules: AccessRule<TActions, TSubjects>[],
    user: AccessUser | null,
    roles: string[],
  ): void {
    if (user && checkSuperAdmin(user, config.isSuperAdmin)) {
      currentRules = createSuperAdminRules() as AccessRule<
        TActions,
        TSubjects
      >[];
    } else {
      currentRules = rules;
    }
    currentUser = user;
    currentRoles = roles;
    ability = createMongoAbility<[TActions, TSubjects | "all"]>(currentRules);
    persistState();
    notify();
  }

  function persistState(): void {
    if (!config.persist) return;
    const storage = config.persist.storage ?? globalThis.localStorage;
    const key = config.persist.key ?? DEFAULT_PERSIST_KEY;
    if (!storage) return;
    try {
      storage.setItem(
        key,
        JSON.stringify({
          rules: currentRules,
          user: currentUser,
          roles: currentRoles,
        }),
      );
    } catch {
      /* storage full or unavailable */
    }
  }

  function clearPersist(): void {
    if (!config.persist) return;
    const storage = config.persist.storage ?? globalThis.localStorage;
    const key = config.persist.key ?? DEFAULT_PERSIST_KEY;
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  const policy: AccessPolicy<TActions, TSubjects> = {
    get ability() {
      return ability;
    },
    get user() {
      return currentUser;
    },
    get roles() {
      return currentRoles;
    },

    can(action: TActions, subject: TSubjects | "all"): boolean {
      // Cast to AnyAbility to bypass CASL's conditional type inference
      // that doesn't resolve with open generic parameters.
      return (ability as AnyAbility).can(action, subject);
    },

    cannot(action: TActions, subject: TSubjects | "all"): boolean {
      return (ability as AnyAbility).cannot(action, subject);
    },

    hasRole(role: string): boolean {
      return checkRole(currentRoles, role);
    },

    hasAnyRole(roles: string[]): boolean {
      return checkAnyRole(currentRoles, roles);
    },

    async update(authData: unknown): Promise<void> {
      const result = await config.adapter.extract(authData);
      applyRules(
        result.rules,
        result.user ?? currentUser,
        result.roles ?? [],
      );
    },

    setRules(
      rules: AccessRule<TActions, TSubjects>[],
      user?: AccessUser,
      roles?: string[],
    ): void {
      applyRules(rules, user ?? currentUser, roles ?? currentRoles);
    },

    clear(): void {
      currentUser = null;
      currentRoles = [];
      currentRules = [];
      ability = createMongoAbility<[TActions, TSubjects | "all"]>([]);
      clearPersist();
      notify();
    },

    async loadPublicAccess(): Promise<void> {
      if (!config.publicAccess) return;
      if (Array.isArray(config.publicAccess)) {
        applyRules(config.publicAccess, null, []);
      } else {
        const result = await config.publicAccess.extract(null);
        applyRules(result.rules, result.user ?? null, result.roles ?? []);
      }
    },

    rehydrate(): boolean {
      if (!config.persist) return false;
      const storage = config.persist.storage ?? globalThis.localStorage;
      const key = config.persist.key ?? DEFAULT_PERSIST_KEY;
      if (!storage) return false;
      try {
        const raw = storage.getItem(key);
        if (!raw) return false;
        const { rules, user, roles } = JSON.parse(raw) as {
          rules: unknown;
          user: unknown;
          roles: unknown;
        };
        if (Array.isArray(rules)) {
          currentRules = rules as AccessRule<TActions, TSubjects>[];
          currentUser = (user as AccessUser) ?? null;
          currentRoles = Array.isArray(roles) ? (roles as string[]) : [];
          ability = createMongoAbility<[TActions, TSubjects | "all"]>(
            currentRules,
          );
          updateSnapshot();
          notify();
          return true;
        }
      } catch {
        /* corrupt data */
      }
      return false;
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getSnapshot(): AccessSnapshot<TActions, TSubjects> {
      return cachedSnapshot;
    },
  };

  return policy;
}
