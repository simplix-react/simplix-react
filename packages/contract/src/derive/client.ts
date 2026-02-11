import type {
  ApiContractConfig,
  EntityDefinition,
  FetchFn,
  OperationDefinition,
} from "../types.js";
import type { ListParams, QueryBuilder } from "../helpers/query-types.js";
import { buildPath } from "../helpers/path-builder.js";
import { ApiError, defaultFetch } from "../helpers/fetch.js";

/**
 * Derives a type-safe HTTP client from an {@link ApiContractConfig}.
 *
 * Iterates over all entities and operations in the config and generates
 * corresponding CRUD methods and operation functions. Each entity produces
 * `list`, `get`, `create`, `update`, and `delete` methods. Each operation
 * produces a callable function with positional path parameter arguments.
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
 * const tasks = await client.task.list();
 * ```
 *
 * @see {@link defineApi} for the recommended high-level API.
 */
export function deriveClient<
  TEntities extends Record<string, EntityDefinition<any, any, any>>,
  TOperations extends Record<string, OperationDefinition<any, any>>,
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
      result[name] = createOperationClient(basePath, operation, fetchFn);
    }
  }

  return result;
}

function createEntityClient(
  basePath: string,
  entity: EntityDefinition<any, any, any>,
  fetchFn: FetchFn,
  queryBuilder?: QueryBuilder,
) {
  const { path, parent } = entity;

  return {
    list(parentIdOrParams?: string | ListParams, params?: ListParams) {
      let parentId: string | undefined;
      let listParams: ListParams | undefined;

      if (typeof parentIdOrParams === "string") {
        parentId = parentIdOrParams;
        listParams = params;
      } else {
        listParams = parentIdOrParams;
      }

      let url =
        parent && parentId
          ? `${basePath}${parent.path}/${parentId}${path}`
          : `${basePath}${path}`;

      if (listParams && queryBuilder) {
        const sp = queryBuilder.buildSearchParams(listParams);
        const qs = sp.toString();
        if (qs) url += `?${qs}`;
      }

      return fetchFn(url);
    },

    get(id: string) {
      return fetchFn(`${basePath}${path}/${id}`);
    },

    create(parentIdOrDto: unknown, dto?: unknown) {
      if (parent && typeof parentIdOrDto === "string") {
        const url = `${basePath}${parent.path}/${parentIdOrDto}${path}`;
        return fetchFn(url, {
          method: "POST",
          body: JSON.stringify(dto),
        });
      }
      const url = `${basePath}${path}`;
      return fetchFn(url, {
        method: "POST",
        body: JSON.stringify(parentIdOrDto),
      });
    },

    update(id: string, dto: unknown) {
      return fetchFn(`${basePath}${path}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      });
    },

    delete(id: string) {
      return fetchFn(`${basePath}${path}/${id}`, { method: "DELETE" });
    },
  };
}

function createOperationClient(
  basePath: string,
  operation: OperationDefinition<any, any>,
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
