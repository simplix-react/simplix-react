import type {
  AccessAdapter,
  AccessPersistConfig,
  AccessPolicy,
  AccessUser,
  DefaultActions,
} from "@simplix-react/access";
import { createAccessPolicy } from "@simplix-react/access";
import type { OrvalMutator } from "@simplix-react/api";
import { createSpringAccessAdapter } from "./adapter.js";
import type { SpringAccessAdapterOptions } from "./types.js";

export interface BootAccessPolicyOptions {
  fetchFn: OrvalMutator;
  adapterOptions?: Omit<SpringAccessAdapterOptions, "fetchFn">;
  isSuperAdmin?: (user: AccessUser) => boolean;
  persist?: AccessPersistConfig;
  enablePublicAccess?: boolean;
}

export function createBootAccessPolicy<
  TActions extends string = DefaultActions,
>(options: BootAccessPolicyOptions): AccessPolicy<TActions> {
  const {
    fetchFn,
    adapterOptions,
    isSuperAdmin = (user) => user.isSuperAdmin === true,
    persist,
    enablePublicAccess = true,
  } = options;

  // Unwrap Boot envelope ({ type, body }) if present.
  // This allows callers to pass auth.fetchFn directly without
  // pre-unwrapping via bootMutator.
  const unwrappedFetchFn = (async (url: string, opts?: RequestInit) => {
    const raw = await fetchFn(url, opts);
    if (raw && typeof raw === "object" && "type" in raw && "body" in raw) {
      return (raw as { body: unknown }).body;
    }
    return raw;
  }) as OrvalMutator;

  const adapter = createSpringAccessAdapter({
    ...adapterOptions,
    fetchFn: unwrappedFetchFn,
  }) as AccessAdapter<TActions, string>;

  return createAccessPolicy<TActions>({
    adapter,
    isSuperAdmin,
    persist,
    ...(enablePublicAccess ? { publicAccess: adapter } : {}),
  });
}
