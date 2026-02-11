import type { FetchFn } from "@simplix-react/contract";

// ── Auth Scheme ──

/**
 * Defines the contract for an authentication strategy.
 *
 * Each scheme encapsulates how credentials are attached to requests,
 * how tokens are refreshed, and how auth state is managed.
 *
 * @see {@link bearerScheme} for Bearer token authentication.
 * @see {@link apiKeyScheme} for API key authentication.
 * @see {@link oauth2Scheme} for OAuth2 refresh_token grant flow.
 * @see {@link customScheme} for user-defined authentication.
 */
export interface AuthScheme {
  /** Unique identifier for this scheme. */
  readonly name: string;

  /**
   * Returns headers to attach to each outgoing request.
   * May perform async work (e.g., decrypt a stored token).
   */
  getHeaders(): Promise<Record<string, string>>;

  /**
   * Attempts to refresh the authentication credentials.
   * Called when a 401 response is received.
   */
  refresh?(): Promise<void>;

  /** Returns whether the scheme currently holds valid credentials. */
  isAuthenticated(): boolean;

  /** Clears all stored credentials for this scheme. */
  clear(): void;
}

// ── Token Store ──

/**
 * Abstraction over key-value storage for tokens.
 *
 * @see {@link memoryStore} for in-memory implementation.
 * @see {@link localStorageStore} for localStorage-based storage.
 * @see {@link sessionStorageStore} for sessionStorage-based storage.
 */
export interface TokenStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

// ── Token Pair ──

/**
 * Represents an access/refresh token pair returned from an auth endpoint.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  /** Token validity duration in seconds. */
  expiresIn?: number;
}

// ── Auth Config ──

/**
 * Configuration for creating an auth instance via {@link createAuth}.
 */
export interface AuthConfig {
  /** One or more authentication schemes to compose. */
  schemes: AuthScheme[];

  /** Token store shared across schemes. */
  store?: TokenStore;

  /** Called when all refresh attempts fail. */
  onRefreshFailure?: (error: Error) => void;

  /** Maximum retry attempts after 401. Defaults to `1`. */
  maxRetries?: number;
}

// ── Auth Instance ──

/**
 * Reactive auth instance returned by {@link createAuth}.
 *
 * Provides a `fetchFn` compatible with {@link defineApi} that automatically
 * injects auth headers, handles 401 retries, and manages token refresh.
 */
export interface AuthInstance {
  /** Authenticated fetch function for use with `defineApi`. */
  fetchFn: FetchFn;

  /** Returns true if any scheme reports valid credentials. */
  isAuthenticated(): boolean;

  /** Returns the current access token from the store, or `null`. */
  getAccessToken(): string | null;

  /** Stores a token pair and notifies subscribers. */
  setTokens(tokens: TokenPair): void;

  /** Clears all auth state and notifies subscribers. */
  clear(): void;

  /**
   * Subscribes to auth state changes.
   * @returns An unsubscribe function.
   */
  subscribe(listener: () => void): () => void;
}

// ── Scheme Options ──

/**
 * Options for {@link bearerScheme}.
 */
export interface BearerSchemeOptions {
  /** Token store for persisting access and refresh tokens. */
  store: TokenStore;

  /**
   * Static token string or function returning the current access token.
   * If a function, called on each request.
   */
  token: string | (() => string | null);

  /** Optional refresh configuration. */
  refresh?: {
    /** Async function that returns a fresh token pair. */
    refreshFn: () => Promise<TokenPair>;

    /** Seconds before expiry to trigger proactive refresh. */
    refreshBeforeExpiry?: number;
  };
}

/**
 * Options for {@link apiKeyScheme}.
 */
export interface ApiKeySchemeOptions {
  /** Where to place the API key. */
  in: "header" | "query";

  /** Header name or query parameter name (e.g., `"X-API-Key"`). */
  name: string;

  /** Static key string or function returning the current key. */
  key: string | (() => string | null);
}

/**
 * Options for {@link oauth2Scheme}.
 */
export interface OAuth2SchemeOptions {
  /** Token store for persisting OAuth2 tokens. */
  store: TokenStore;

  /** URL of the token endpoint. */
  tokenEndpoint: string;

  /** OAuth2 client ID. */
  clientId: string;

  /** OAuth2 client secret (optional for public clients). */
  clientSecret?: string;

  /** Requested scopes. */
  scopes?: string[];

  /** Additional headers for the token endpoint request. */
  tokenEndpointHeaders?: Record<string, string>;

  /** Additional body parameters for the token endpoint request. */
  tokenEndpointBody?: Record<string, string>;
}

/**
 * Options for {@link customScheme}.
 */
export interface CustomSchemeOptions {
  /** Unique name for this custom scheme. */
  name: string;

  /** Returns headers to attach to each request. */
  getHeaders: () => Promise<Record<string, string>>;

  /** Optional refresh logic. */
  refresh?: () => Promise<void>;

  /** Returns whether credentials are currently valid. */
  isAuthenticated: () => boolean;

  /** Clears all stored credentials. */
  clear: () => void;
}
