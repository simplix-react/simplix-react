import { useContext, useSyncExternalStore } from "react";
import { AccessContext } from "./access-provider.js";

/**
 * Returns whether the given action is allowed on the subject.
 *
 * Uses `useSyncExternalStore` for reactive updates when the policy changes.
 *
 * When used outside an {@link AccessProvider}, always returns `true`
 * to support opt-in access control.
 *
 * @param action - The action to check (e.g., "view", "edit").
 * @param subject - The subject to check against (e.g., "Pet", "Order").
 * @returns `true` if the action is allowed, or if no AccessProvider is present.
 *
 * @example
 * ```tsx
 * import { useCan } from "@simplix-react/access/react";
 *
 * function EditButton() {
 *   const canEdit = useCan("edit", "Pet");
 *   if (!canEdit) return null;
 *   return <button>Edit</button>;
 * }
 * ```
 */
export function useCan(action: string, subject: string): boolean {
  const policy = useContext(AccessContext);

  return useSyncExternalStore(
    policy ? policy.subscribe : emptySubscribe,
    () => (policy ? policy.can(action, subject) : true),
    () => (policy ? policy.can(action, subject) : true),
  );
}

function emptySubscribe(_listener: () => void): () => void {
  return () => {};
}
