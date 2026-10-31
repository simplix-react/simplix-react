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

/**
 * Returns what `decide` answers when handed the policy's `can`, re-evaluated whenever the policy
 * changes.
 *
 * For a rule that names several permissions at once - any of them, or all of them - where
 * {@link useCan} would need one call per permission and so a varying number of hooks.
 *
 * When used outside an {@link AccessProvider}, `decide` is handed a `can` that always answers
 * `true`, matching {@link useCan}.
 *
 * @param decide - Combines the answers of `can` into one; must be pure.
 * @returns What `decide` answered against the current policy.
 *
 * @example
 * ```tsx
 * import { useCanWith } from "@simplix-react/access/react";
 *
 * const canReview = useCanWith((can) => can("approve", "Order") || can("edit", "Order"));
 * ```
 */
export function useCanWith(decide: (can: (action: string, subject: string) => boolean) => boolean): boolean {
  const policy = useContext(AccessContext);
  const snapshot = () => decide(policy ? (action, subject) => policy.can(action, subject) : () => true);

  return useSyncExternalStore(policy ? policy.subscribe : emptySubscribe, snapshot, snapshot);
}
