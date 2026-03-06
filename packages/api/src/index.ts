export type OrvalMutator = <T>(url: string, options?: RequestInit) => Promise<T>;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
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

export {
  type ValidationFieldError,
  type ErrorCategory,
  type ServerErrorEvent,
  getValidationErrors,
  getErrorMessage,
  getErrorCode,
  getHttpStatus,
  classifyError,
  createMutationErrorHandler,
} from "./error-utils.js";
