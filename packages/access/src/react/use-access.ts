import type { AccessPolicy } from "../types.js";
import { useAccessContext } from "./access-provider.js";

/**
 * Returns the current {@link AccessPolicy} from context.
 *
 * @remarks
 * Unlike {@link useCan}, this hook throws if used outside an {@link AccessProvider},
 * since it implies intentional use of the full policy object (roles, user, etc.).
 *
 * @returns The {@link AccessPolicy} from the nearest {@link AccessProvider}.
 * @throws Error if called outside an {@link AccessProvider}.
 *
 * @example
 * ```tsx
 * import { useAccess } from "@simplix-react/access/react";
 *
 * function UserInfo() {
 *   const access = useAccess();
 *   return <span>{access.user?.displayName}</span>;
 * }
 * ```
 */
export function useAccess(): AccessPolicy<string, string> {
  return useAccessContext();
}
