// Core API
export { defineApi } from "./define-api.js";

// Derive functions
export { deriveClient } from "./derive/client.js";
export { deriveQueryKeys } from "./derive/query-keys.js";

// Helpers
export { buildPath } from "./helpers/path-builder.js";
export { ApiError, defaultFetch } from "./helpers/fetch.js";
export { camelToKebab, camelToSnake } from "./helpers/case-transform.js";
export { simpleQueryBuilder } from "./helpers/query-builders.js";

// Types
export type {
  EntityDefinition,
  EntityParent,
  EntityQuery,
  OperationDefinition,
  HttpMethod,
  ApiContractConfig,
  QueryKeyFactory,
  EntityClient,
  ApiContract,
  FetchFn,
  AnyEntityDef,
  AnyOperationDef,
} from "./types.js";

export type {
  ListParams,
  SortParam,
  PaginationParam,
  PageInfo,
  QueryBuilder,
} from "./helpers/query-types.js";
