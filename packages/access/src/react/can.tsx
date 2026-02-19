import type { ReactElement, ReactNode } from "react";
import { useCan } from "./use-can.js";

/**
 * Props for the {@link Can} component.
 *
 * @example
 * ```tsx
 * <Can I="edit" a="Pet" fallback={<span>No permission</span>}>
 *   <EditButton />
 * </Can>
 * ```
 */
export interface CanProps {
  /** The action to check (e.g., "view", "edit"). */
  I: string;
  /** The subject to check against (e.g., "Pet", "Order"). */
  a: string;
  /** If `true`, inverts the check (renders when action is NOT allowed). */
  not?: boolean;
  /** Content to render when the check fails. */
  fallback?: ReactNode;
  /** Content to render when the check passes. */
  children: ReactNode;
}

/**
 * Declarative access guard component.
 *
 * @remarks
 * Renders `children` when the user has the specified permission,
 * or `fallback` otherwise. Set `not` to invert the logic.
 * Uses {@link useCan} internally for reactive permission checks.
 *
 * @param props - See {@link CanProps}.
 * @returns The rendered children, fallback, or `null`.
 *
 * @example
 * ```tsx
 * import { Can } from "@simplix-react/access/react";
 *
 * <Can I="edit" a="Pet">
 *   <EditButton />
 * </Can>
 *
 * <Can I="delete" a="Pet" not fallback={<span>Read only</span>}>
 *   <span>Cannot delete</span>
 * </Can>
 * ```
 */
export function Can({
  I: action,
  a: subject,
  not: invert,
  fallback,
  children,
}: CanProps): ReactElement | null {
  const allowed = useCan(action, subject);
  const show = invert ? !allowed : allowed;

  if (show) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
