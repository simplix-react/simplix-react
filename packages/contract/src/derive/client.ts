import type {
  ApiContractConfig,
  EntityDefinition,
  EntityOperationDef,
  FetchFn,
  OperationDefinition,
} from "../types.js";
import type { ListParams, QueryBuilder } from "../helpers/query-types.js";
import { buildPath } from "../helpers/path-builder.js";
import { interpolatePath, extractPathParams } from "../helpers/path-params.js";
import { resolveRole } from "../helpers/resolve-role.js";
import { ApiError, defaultFetch } from "../helpers/fetch.js";

/**
 * Derives a type-safe HTTP client from an {@link ApiContractConfig}.
 *
 * Iterates over all entities and operations in the config and generates
 * corresponding client methods. Entity operations are generated dynamically
 * from the `operations` map. Each top-level operation produces a callable
 * function with positional path parameter arguments.
 *
 * Typically called internally by {@link defineApi} rather than used directly.
 *
 * @typeParam TEntities - Map of entity names to their definitions.
 * @typeParam TOperations - Map of operation names to their definitions.
 * @param config - The API contract configuration.
 * @param fetchFn - Custom fetch function; defaults to {@link defaultFetch}.
 * @returns A client object with typed methods for each entity and operation.
 *
 * @example
 * ```ts
 * import { deriveClient } from "@simplix-react/contract";
 *
 * const client = deriveClient(config);
 * const products = await client.product.list();
 * ```
 *
 * @see {@link defineApi} for the recommended high-level API.
 */
export function deriveClient<
  TEntities extends Record<string, EntityDefinition>,
  TOperations extends Record<string, OperationDefinition>,
>(
  config: ApiContractConfig<TEntities, TOperations>,
  fetchFn: FetchFn = defaultFetch,
) {
  const { basePath, entities, operations, queryBuilder } = config;
  const result: Record<string, unknown> = {};

  for (const [name, entity] of Object.entries(entities)) {
    result[name] = createEntityClient(basePath, entity, fetchFn, queryBuilder);
  }

  if (operations) {
    for (const [name, operation] of Object.entries(operations)) {
      result[name] = createTopLevelOperationClient(basePath, operation, fetchFn);
    }
  }

  return result;
}

function createEntityClient(
  basePath: string,
  entity: EntityDefinition,
  fetchFn: FetchFn,
  queryBuilder?: QueryBuilder,
) {
  const client: Record<string, unknown> = {};

  for (const [name, op] of Object.entries(entity.operations)) {
    const role = resolveRole(name, op);
    client[name] = createOperationFn(basePath, op, role, entity, fetchFn, queryBuilder);
  }

  return client;
}

function createOperationFn(
  basePath: string,
  op: EntityOperationDef,
  role: string | undefined,
  entity: EntityDefinition,
  fetchFn: FetchFn,
  queryBuilder?: QueryBuilder,
) {
  switch (role) {
    case "list":
      return createListFn(basePath, op, entity, fetchFn, queryBuilder);
    case "get":
      return createGetFn(basePath, op, fetchFn);
    case "create":
      return createCreateFn(basePath, op, entity, fetchFn);
    case "update":
      return createUpdateFn(basePath, op, fetchFn);
    case "delete":
      return createDeleteFn(basePath, op, fetchFn);
    case "tree":
      return createTreeFn(basePath, op, fetchFn, queryBuilder);
    default:
      return createGenericOperationFn(basePath, op, fetchFn);
  }
}

// ── Role-specific client functions ──

function createListFn(
  basePath: string,
  op: EntityOperationDef,
  entity: EntityDefinition,
  fetchFn: FetchFn,
  queryBuilder?: QueryBuilder,
) {
  const { parent } = entity;

  return function list(parentIdOrParams?: string | ListParams, params?: ListParams) {
    let parentId: string | undefined;
    let listParams: ListParams | undefined;

    if (typeof parentIdOrParams === "string") {
      parentId = parentIdOrParams;
      listParams = params;
    } else {
      listParams = parentIdOrParams;
    }

    let url: string;
    if (parent && parentId) {
      url = `${basePath}${parent.path}/${parentId}${op.path}`;
    } else {
      url = `${basePath}${op.path}`;
    }

    if (listParams && queryBuilder) {
      const sp = queryBuilder.buildSearchParams(listParams);
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }

    return fetchFn(url);
  };
}

function createGetFn(
  basePath: string,
  op: EntityOperationDef,
  fetchFn: FetchFn,
) {
  const pathParams = extractPathParams(op.path);

  return function get(idOrParams: string | Record<string, string>) {
    const params = typeof idOrParams === "string"
      ? { [pathParams[pathParams.length - 1] ?? "id"]: idOrParams }
      : idOrParams;
    const url = `${basePath}${interpolatePath(op.path, params)}`;
    return fetchFn(url);
  };
}

function createCreateFn(
  basePath: string,
  op: EntityOperationDef,
  entity: EntityDefinition,
  fetchFn: FetchFn,
) {
  const { parent } = entity;

  return function create(parentIdOrDto: unknown, dto?: unknown) {
    if (parent && typeof parentIdOrDto === "string") {
      const url = `${basePath}${parent.path}/${parentIdOrDto}${op.path}`;
      return fetchFn(url, {
        method: op.method,
        body: JSON.stringify(dto),
      });
    }
    const url = `${basePath}${op.path}`;
    return fetchFn(url, {
      method: op.method,
      body: JSON.stringify(parentIdOrDto),
    });
  };
}

function createUpdateFn(
  basePath: string,
  op: EntityOperationDef,
  fetchFn: FetchFn,
) {
  const pathParams = extractPathParams(op.path);

  return function update(idOrParams: string | Record<string, string>, dto: unknown) {
    const params = typeof idOrParams === "string"
      ? { [pathParams[pathParams.length - 1] ?? "id"]: idOrParams }
      : idOrParams;
    const url = `${basePath}${interpolatePath(op.path, params)}`;
    return fetchFn(url, {
      method: op.method,
      body: JSON.stringify(dto),
    });
  };
}

function createDeleteFn(
  basePath: string,
  op: EntityOperationDef,
  fetchFn: FetchFn,
) {
  const pathParams = extractPathParams(op.path);

  return function deleteFn(idOrParams: string | Record<string, string>) {
    const params = typeof idOrParams === "string"
      ? { [pathParams[pathParams.length - 1] ?? "id"]: idOrParams }
      : idOrParams;
    const url = `${basePath}${interpolatePath(op.path, params)}`;
    return fetchFn(url, { method: op.method });
  };
}

function createTreeFn(
  basePath: string,
  op: EntityOperationDef,
  fetchFn: FetchFn,
  queryBuilder?: QueryBuilder,
) {
  return function tree(params?: Record<string, unknown>) {
    let url = `${basePath}${op.path}`;

    if (params && queryBuilder) {
      const sp = queryBuilder.buildSearchParams({ filters: params });
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    } else if (params) {
      const sp = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          sp.set(key, String(value));
        }
      }
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }

    return fetchFn(url);
  };
}

function createGenericOperationFn(
  basePath: string,
  op: EntityOperationDef,
  fetchFn: FetchFn,
) {
  const paramNames = extractPathParams(op.path);

  return (...args: unknown[]) => {
    const pathParams: Record<string, string> = {};
    let argIndex = 0;

    for (const paramName of paramNames) {
      if (argIndex < args.length) {
        pathParams[paramName] = String(args[argIndex]);
        argIndex++;
      }
    }

    let inputData: unknown = undefined;
    if (argIndex < args.length) {
      inputData = args[argIndex];
    }

    const url = `${basePath}${buildPath(op.path, pathParams)}`;

    if (op.contentType === "multipart" && inputData !== undefined) {
      return multipartFetch(url, op.method, toFormData(inputData), op.responseType);
    }

    if (op.responseType === "blob") {
      return blobFetch(url, op.method, inputData);
    }

    const options: RequestInit = { method: op.method };
    if (inputData !== undefined && op.method !== "GET") {
      options.body = JSON.stringify(inputData);
    }

    return fetchFn(url, options);
  };
}

// ── Top-level operation client (unchanged from original) ──

function createTopLevelOperationClient(
  basePath: string,
  operation: OperationDefinition,
  fetchFn: FetchFn,
) {
  return (...args: unknown[]) => {
    const pathParams: Record<string, string> = {};
    const paramNames = (operation.path.match(/:(\w+)/g) ?? []).map((p) =>
      p.slice(1),
    );

    let inputData: unknown = undefined;
    let argIndex = 0;

    for (const paramName of paramNames) {
      if (argIndex < args.length) {
        pathParams[paramName] = String(args[argIndex]);
        argIndex++;
      }
    }

    if (argIndex < args.length) {
      inputData = args[argIndex];
    }

    const url = `${basePath}${buildPath(operation.path, pathParams)}`;

    if (operation.contentType === "multipart" && inputData !== undefined) {
      return multipartFetch(url, operation.method, toFormData(inputData), operation.responseType);
    }

    if (operation.responseType === "blob") {
      return blobFetch(url, operation.method, inputData);
    }

    const options: RequestInit = { method: operation.method };
    if (inputData !== undefined && operation.method !== "GET") {
      options.body = JSON.stringify(inputData);
    }

    return fetchFn(url, options);
  };
}

// ── Utility functions ──

function toFormData(data: unknown): FormData {
  const formData = new FormData();
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
  }
  return formData;
}

async function multipartFetch(
  url: string,
  method: string,
  formData: FormData,
  responseType?: "json" | "blob",
): Promise<unknown> {
  const res = await fetch(url, { method, body: formData });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  if (responseType === "blob") {
    return res.blob();
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

async function blobFetch(
  url: string,
  method: string,
  inputData?: unknown,
): Promise<Blob> {
  const options: RequestInit = { method };
  if (inputData !== undefined && method !== "GET") {
    options.body = JSON.stringify(inputData);
    options.headers = { "Content-Type": "application/json" };
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  return res.blob();
}
