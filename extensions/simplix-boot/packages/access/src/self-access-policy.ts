import type { AccessAdapter, AccessPolicy, DefaultActions } from "@simplix-react/access";
import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
import { useSyncExternalStore } from "react";

/** What `GET /user/me/permissions` answers, inside the boot response envelope or bare. */
interface SelfPermissions {
  readonly userId: string;
  readonly username: string;
  readonly displayName?: string;
  readonly isSuperAdmin?: boolean;
  readonly roles?: ReadonlyArray<{ readonly roleCode: string }>;
  readonly permissions?: Record<string, string[]>;
}

/** How the server last refused the self read: its status and the envelope's error code. */
export interface SelfAccessRefusal {
  readonly status: number;
  readonly errorCode?: string;
}

let refusal: SelfAccessRefusal | null = null;
const listeners = new Set<() => void>();

function setRefusal(next: SelfAccessRefusal | null) {
  if (refusal === next || (refusal && next && refusal.status === next.status && refusal.errorCode === next.errorCode)) return;
  refusal = next;
  for (const listener of listeners) listener();
}

function refusalOf(error: unknown): SelfAccessRefusal | null {
  if (typeof error !== "object" || error === null) return null;
  // The error code arrives on the error itself (an envelope-aware fetch), in its structured data,
  // or inside the raw body text a plain fetch keeps.
  const { status, errorCode, data, body } = error as { status?: unknown; errorCode?: unknown; data?: unknown; body?: unknown };
  if (typeof status !== "number") return null;
  let code: unknown = errorCode ?? (data as { errorCode?: unknown } | undefined)?.errorCode;
  if (code === undefined && typeof body === "string") {
    try {
      code = (JSON.parse(body) as { errorCode?: unknown } | null)?.errorCode;
    } catch (unreadable) {
      if (!(unreadable instanceof SyntaxError)) throw unreadable;
    }
  }
  return { status, errorCode: typeof code === "string" ? code : undefined };
}

/** The last refusal of the self read, outside React; {@link useSelfAccessRefusal} subscribes to it. */
export function currentSelfAccessRefusal(): SelfAccessRefusal | null {
  return refusal;
}

/**
 * How the server refused the signed-in user's own read, or null while it answers.
 *
 * @remarks
 * A shell reads this to draw a page of its own for a refusal it can name (an account the server
 * will not let this identity act as) instead of the app behind an error dialog, where every
 * screen's read is refused the same way and nothing on screen says why.
 *
 * @returns The last refusal of the self read, cleared by its next success.
 */
export function useSelfAccessRefusal(): SelfAccessRefusal | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    currentSelfAccessRefusal,
    () => null,
  );
}

/** What one app needs to read its own user's grants. */
export interface SelfAccessConfig {
  /** The self endpoint: who is signed in and what they are granted, in one read. */
  readonly endpoint: string;
  /**
   * The auth stack's own fetch, which carries the bearer token and refreshes it once on a 401.
   *
   * @remarks
   * A bare `fetch` here reads as unauthenticated and answers with an empty grant map, which a
   * screen cannot tell apart from an account that genuinely has nothing. Typed as the adapter's
   * own parameter rather than as `typeof fetch`: the auth stack's fetch takes a path, and the wider
   * built-in signature would refuse it at every call site.
   */
  readonly fetchFn: NonNullable<NonNullable<Parameters<typeof createApiAdapter>[0]>["fetchFn"]>;
}

/**
 * What a screen may show, read from the server rather than decided in the browser.
 *
 * @remarks
 * One read for identity and grants together. Two reads would let a screen render against an
 * identity whose grants had not arrived, which is the state where an affordance flashes into view
 * and then disappears after the reader has pressed it.
 *
 * The response is transformed here rather than left to the default extraction, and that half is
 * why this is shared. The default reads the permission map out of a nested `body` and stops there:
 * it carries no user across, and a policy whose snapshot has no user is a policy every route guard
 * waits on for ever (the shell renders, the guard returns nothing, and nothing errors). The roles
 * arrive as objects where the policy wants their codes, which is the second half of the same
 * mismatch. A refusal of the read is recorded on its way through for {@link useSelfAccessRefusal}.
 *
 * The boundary itself is on the server. This decides what is drawn; what is allowed is decided
 * again on every request.
 *
 * @param config - The self endpoint and the fetch that carries the token.
 * @returns The policy the app reads before it draws anything a user may not have.
 */
export function createSelfAccessPolicy(config: SelfAccessConfig): AccessPolicy<DefaultActions> {
  const selfAdapter = createApiAdapter({
    endpoint: config.endpoint,
    fetchFn: async (path, options) => {
      try {
        const answer = await config.fetchFn(path, options);
        setRefusal(null);
        return answer;
      } catch (error) {
        setRefusal(refusalOf(error));
        throw error;
      }
    },
    transformResponse: (response: unknown) => {
      const body = ((response as { body?: SelfPermissions })?.body ?? response) as SelfPermissions;
      const roles = (body.roles ?? []).map((role) => role.roleCode);
      return {
        permissions: body.permissions ?? {},
        roles,
        isSuperAdmin: body.isSuperAdmin ?? false,
        user: {
          userId: body.userId,
          username: body.username,
          displayName: body.displayName,
          isSuperAdmin: body.isSuperAdmin ?? false,
          roles,
        },
      };
    },
  });

  // `createApiAdapter` is not generic and answers with the widened `AccessAdapter<string>`; the
  // policy uses the default action set the server's permission evaluator also uses.
  return createAccessPolicy<DefaultActions>({
    adapter: selfAdapter as AccessAdapter<DefaultActions>,
  });
}
