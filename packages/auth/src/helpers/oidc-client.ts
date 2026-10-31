import { AuthError } from "../errors.js";
import type { TokenPair } from "../types.js";

/** The parts of an OpenID Connect discovery document the client reads. */
export interface OidcDiscovery {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
}

/** Where the client keeps the state of a sign-in between the redirect out and the redirect back. */
export interface OidcPendingStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Options for {@link createOidcClient}.
 */
export interface OidcClientOptions {
  /** The issuer URL; its discovery document is read from `<issuer>/.well-known/openid-configuration`. */
  issuer: string;
  /** The public client registered at the issuer. */
  clientId: string;
  /** Where the issuer sends the browser back with the code; must be registered for the client. */
  redirectUri: string;
  /** Where the issuer sends the browser after sign-out. */
  postLogoutRedirectUri?: string;
  /** Requested scopes. Defaults to `["openid"]`. */
  scopes?: string[];
  /** Holds the verifier and state across the redirect. Defaults to `sessionStorage`. */
  storage?: OidcPendingStorage;
  /** Key the pending sign-in is kept under. Defaults to `"simplix:oidc:pending"`. */
  storageKey?: string;
  /** Fetch used for discovery and the token endpoint. Defaults to the global `fetch`. */
  fetchFn?: typeof fetch;
  /** Sends the browser to a URL. Defaults to `window.location.assign`. */
  navigate?: (url: string) => void;
}

/** Tokens the issuer returned, with the ID token kept for sign-out. */
export interface OidcTokens extends TokenPair {
  idToken?: string;
}

/**
 * A public OpenID Connect client using the authorization code flow with PKCE.
 */
export interface OidcClient {
  /**
   * Sends the browser to the issuer's sign-in page.
   *
   * @param options.returnTo - an app path handed back by {@link OidcClient.completeSignIn}
   * @param options.params - extra authorization parameters, such as `ui_locales` or `prompt`
   */
  signIn(options?: { returnTo?: string; params?: Record<string, string> }): Promise<void>;
  /**
   * Finishes a sign-in from the URL the issuer redirected back to: checks the state, exchanges
   * the code with the verifier, and forgets the pending sign-in either way.
   *
   * @throws {AuthError} `SIGN_IN_FAILED` when the issuer reported an error, the state does not
   *   match the pending sign-in, or the code exchange is refused
   */
  completeSignIn(callbackUrl: string): Promise<{ tokens: OidcTokens; returnTo?: string }>;
  /**
   * Exchanges a refresh token for new tokens.
   *
   * @throws {AuthError} `REFRESH_FAILED` when the issuer refuses it
   */
  refresh(refreshToken: string): Promise<OidcTokens>;
  /** The issuer's sign-out URL, or `null` when it publishes none. */
  signOutUrl(idTokenHint?: string): Promise<string | null>;
  /** The issuer's discovery document, read once. */
  discovery(): Promise<OidcDiscovery>;
}

interface PendingSignIn {
  state: string;
  verifier: string;
  returnTo?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}

function randomUrlSafe(bytes: number): string {
  const random = new Uint8Array(bytes);
  crypto.getRandomValues(random);
  return base64Url(random);
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function challengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}

function toTokens(data: TokenResponse): OidcTokens {
  const now = Date.now();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
    // A refresh lifetime of 0 means the session decides, as for an offline token.
    refreshTokenExpiresAt:
      data.refresh_expires_in ? now + data.refresh_expires_in * 1000 : undefined,
  };
}

/**
 * Creates a public OpenID Connect client for a browser application.
 *
 * Signs in with the authorization code flow and PKCE (S256), so no client secret is held in the
 * browser. Pair it with a token store through `AuthInstance.setTokens` after
 * {@link OidcClient.completeSignIn}, and use {@link OidcClient.refresh} as the refresh function.
 *
 * @example
 * ```ts
 * const oidc = createOidcClient({
 *   issuer: "https://id.example.com/realms/staff",
 *   clientId: "backoffice",
 *   redirectUri: `${location.origin}/login/complete`,
 * });
 * await oidc.signIn({ returnTo: "/users" });
 * ```
 */
export function createOidcClient(options: OidcClientOptions): OidcClient {
  const issuer = options.issuer.replace(/\/+$/, "");
  const storageKey = options.storageKey ?? "simplix:oidc:pending";
  const scopes = options.scopes ?? ["openid"];
  const fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
  const storage = (): OidcPendingStorage => options.storage ?? sessionStorage;
  const navigate = options.navigate ?? ((url: string) => window.location.assign(url));

  let discovered: Promise<OidcDiscovery> | null = null;

  function discovery(): Promise<OidcDiscovery> {
    if (!discovered) {
      discovered = fetchFn(`${issuer}/.well-known/openid-configuration`)
        .then(async (response) => {
          if (!response.ok) {
            throw new AuthError("SCHEME_ERROR", `OIDC discovery failed: ${response.status}`);
          }
          return (await response.json()) as OidcDiscovery;
        })
        .catch((error: unknown) => {
          // A failed read is not remembered; the next call asks again.
          discovered = null;
          throw error;
        });
    }
    return discovered;
  }

  async function token(body: URLSearchParams, code: "SIGN_IN_FAILED" | "REFRESH_FAILED"): Promise<OidcTokens> {
    const { token_endpoint } = await discovery();
    const response = await fetchFn(token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      throw new AuthError(code, `OIDC token request refused: ${response.status}`, {
        issuerError: await issuerErrorOf(response),
      });
    }
    return toTokens((await response.json()) as TokenResponse);
  }

  return {
    discovery,

    async signIn(signInOptions = {}) {
      const { authorization_endpoint } = await discovery();
      const pending: PendingSignIn = {
        state: randomUrlSafe(16),
        verifier: randomUrlSafe(48),
        returnTo: signInOptions.returnTo,
      };
      storage().setItem(storageKey, JSON.stringify(pending));
      const url = new URL(authorization_endpoint);
      const params: Record<string, string> = {
        client_id: options.clientId,
        response_type: "code",
        redirect_uri: options.redirectUri,
        scope: scopes.join(" "),
        state: pending.state,
        code_challenge: await challengeFor(pending.verifier),
        code_challenge_method: "S256",
        ...signInOptions.params,
      };
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
      navigate(url.toString());
    },

    async completeSignIn(callbackUrl) {
      const raw = storage().getItem(storageKey);
      storage().removeItem(storageKey);
      const query = new URL(callbackUrl).searchParams;
      const error = query.get("error");
      if (error) {
        throw new AuthError("SIGN_IN_FAILED", `The issuer refused the sign-in: ${error}`);
      }
      let pending: PendingSignIn | null = null;
      try {
        pending = raw ? (JSON.parse(raw) as PendingSignIn) : null;
      } catch {
        pending = null;
      }
      const code = query.get("code");
      if (!pending || !code || query.get("state") !== pending.state) {
        throw new AuthError("SIGN_IN_FAILED", "No sign-in is pending for this response");
      }
      const tokens = await token(
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: options.redirectUri,
          client_id: options.clientId,
          code_verifier: pending.verifier,
        }),
        "SIGN_IN_FAILED",
      );
      return { tokens, returnTo: pending.returnTo };
    },

    refresh(refreshToken) {
      return token(
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: options.clientId,
        }),
        "REFRESH_FAILED",
      );
    },

    async signOutUrl(idTokenHint) {
      const { end_session_endpoint } = await discovery();
      if (!end_session_endpoint) return null;
      const url = new URL(end_session_endpoint);
      url.searchParams.set("client_id", options.clientId);
      if (idTokenHint) url.searchParams.set("id_token_hint", idTokenHint);
      if (options.postLogoutRedirectUri) {
        url.searchParams.set("post_logout_redirect_uri", options.postLogoutRedirectUri);
      }
      return url.toString();
    },
  };
}

/**
 * The `error` and `error_description` of a refused token request, so a caller can tell one
 * refusal from another - an ended session and a disabled account are both `invalid_grant`, and
 * only the description separates them.
 */
async function issuerErrorOf(response: Response): Promise<{ error: string; description?: string } | undefined> {
  try {
    const body = (await response.json()) as { error?: unknown; error_description?: unknown };
    if (typeof body.error !== "string") return undefined;
    return {
      error: body.error,
      description: typeof body.error_description === "string" ? body.error_description : undefined,
    };
  } catch (unreadable) {
    if (unreadable instanceof SyntaxError) return undefined;
    throw unreadable;
  }
}
