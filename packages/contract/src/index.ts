// Core API
export { defineApi } from "./define-api.js";
export { customizeApi } from "./customize-api.js";
export type { ApiPatch, EntityPatch } from "./customize-api.js";

// Derive functions
export { deriveClient } from "./derive/client.js";
export { deriveQueryKeys } from "./derive/query-keys.js";

// Helpers
export { buildPath } from "./helpers/path-builder.js";
export { ApiError, defaultFetch, configureDefaultFetch } from "./helpers/fetch.js";
export { createFetch } from "./helpers/create-fetch.js";
export type { CreateFetchOptions, FetchContext, FetchErrorContext } from "./helpers/create-fetch.js";
export { camelToSnake } from "./helpers/case-transform.js";
export { simpleQueryBuilder } from "./helpers/query-builders.js";
export { extractPathParams, interpolatePath } from "./helpers/path-params.js";
export { resolveRole } from "./helpers/resolve-role.js";

// Types
export type {
  WiredSchema,
  InferOutputData,
  TransformedRequest,
  EntityDefinition,
  EntityParent,
  EntityQuery,
  EntityOperationDef,
  CrudRole,
  TreeNode,
  OperationDefinition,
  HttpMethod,
  ApiContractConfig,
  QueryKeyFactory,
  EntityClient,
  ApiContract,
  EntityId,
  FetchFn,
  AnyEntityDef,
  AnyOperationDef,
} from "./types.js";

export { wired, isWiredSchema, CRUD_OPERATIONS } from "./types.js";

export type {
  ListParams,
  SortParam,
  PaginationParam,
  PageInfo,
  QueryBuilder,
} from "./helpers/query-types.js";
