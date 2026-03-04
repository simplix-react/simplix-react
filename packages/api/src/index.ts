export interface ResponseAdapter {
  unwrap?: <T>(raw: unknown) => T;
  toError?: (raw: unknown, status: number) => Error;
}

export type OrvalMutator = <T>(url: string, options?: RequestInit) => Promise<T>;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function createAppFetch(options: {
  baseUrl?: string;
  getToken?: () => string | null;
  responseAdapter?: ResponseAdapter;
}): OrvalMutator {
  const { baseUrl = "", getToken, responseAdapter } = options;

  return async <T>(url: string, init?: RequestInit): Promise<T> => {
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = getToken?.();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(fullUrl, { ...init, headers });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (responseAdapter?.toError) {
        throw responseAdapter.toError(body, response.status);
      }
      const message =
        (body as Record<string, unknown> | null)?.message ?? response.statusText;
      throw new HttpError(response.status, `HTTP ${response.status}: ${message}`);
    }

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    if (!text) return undefined as T;

    const json: unknown = JSON.parse(text);
    if (responseAdapter?.unwrap) {
      return responseAdapter.unwrap<T>(json);
    }
    return json as T;
  };
}

const _registry = new Map<string, OrvalMutator>();

export function configureMutator(fetch: OrvalMutator): void;
export function configureMutator(strategy: string, fetch: OrvalMutator): void;
export function configureMutator(
  fetchOrStrategy: OrvalMutator | string,
  fetch?: OrvalMutator,
): void {
  if (typeof fetchOrStrategy === "string") {
    _registry.set(fetchOrStrategy, fetch!);
  } else {
    _registry.set("default", fetchOrStrategy);
  }
}

export function getMutator(strategy = "default"): OrvalMutator {
  const mutator = _registry.get(strategy);
  if (!mutator) {
    throw new Error(
      `Mutator "${strategy}" not configured. Call configureMutator() first.`,
    );
  }
  return mutator;
}

// Types that Orval imports in generated code
export type ErrorType<T = unknown> = Error & { data?: T };
export type BodyType<T> = T;
