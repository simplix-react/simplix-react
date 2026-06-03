# API Patterns Reference

Full API signatures for the simplix-react packages on the contract → derive pipeline.

## Contents

- [@simplix-react/contract](#simplix-reactcontract)
- [@simplix-react/react](#simplix-reactreact)
- [@simplix-react/form](#simplix-reactform)
- [@simplix-react/mock](#simplix-reactmock)
- [@simplix-react/i18n](#simplix-reacti18n)
- [@simplix-react/testing](#simplix-reacttesting)

---

## @simplix-react/contract

### defineApi(config, options?)

```ts
function defineApi<TEntities, TOperations>(
  config: ApiContractConfig<TEntities, TOperations>,
  options?: { fetchFn?: FetchFn },
): ApiContract<TEntities, TOperations>;
```

Returns `{ config, client, queryKeys }`. Internally calls `deriveClient` and `deriveQueryKeys` (both also exported for advanced use).

### ApiContractConfig

```ts
interface ApiContractConfig<TEntities, TOperations> {
  domain: string;                // query-key namespace
  basePath: string;              // URL prefix for all operation paths
  entities: TEntities;           // Record<string, EntityDefinition>
  operations?: TOperations;      // Record<string, OperationDefinition> — standalone RPC
  queryBuilder?: QueryBuilder;   // optional; without it, list params are not serialized
}
```

### EntityDefinition

```ts
interface EntityDefinition<TSchema, TOperations> {
  schema: TSchema;                         // z.ZodType — full entity shape
  identity?: string[];                     // identity field(s) for cache keys; default ["id"]
  operations: TOperations;                 // Record<string, EntityOperationDef> — REQUIRED
  parent?: EntityParent;                   // nested URL config
  queries?: Record<string, EntityQuery>;   // named query scopes
  filterSchema?: z.ZodType;                // list filter validation
}
```

There is no `path`, `createSchema`, or `updateSchema` on the entity. Each CRUD endpoint is an entry in `operations`, and its create/update DTO is that operation's `input`.

### EntityOperationDef

```ts
interface EntityOperationDef<TInput, TOutput> {
  method: HttpMethod;            // "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string;                  // with :paramName placeholders
  role?: CrudRole;               // inferred from operation name when omitted
  input?: TInput;                // z.ZodType — request payload (optional for GET/DELETE)
  output?: TOutput;              // z.ZodType — response payload (falls back to entity schema)
  contentType?: "json" | "multipart";
  responseType?: "json" | "blob";
  invalidates?: (queryKeys, params) => readonly unknown[][];
  transformRequest?: (input: unknown, url: string) => TransformedRequest;
  transformResponse?: (raw: unknown) => unknown;
}
```

### CrudRole and CRUD_OPERATIONS

```ts
type CrudRole =
  | "list" | "get" | "getForEdit" | "create" | "update" | "delete"
  | "order" | "tree" | "subtree" | "multiUpdate" | "batchUpdate"
  | "batchDelete" | "search";

const CRUD_OPERATIONS: {
  list:   { method: "GET" };
  get:    { method: "GET" };
  create: { method: "POST" };
  update: { method: "PATCH" };
  delete: { method: "DELETE" };
};
```

`CRUD_OPERATIONS` provides standard method defaults to spread into an operation:

```ts
operations: {
  create: { ...CRUD_OPERATIONS.create, path: "/products", input: createProductSchema },
}
```

Only `list`/`get`/`create`/`update`/`delete`/`tree` have dedicated client + hook handling; other roles are recognized by `resolveRole` but treated as generic operations.

### EntityParent

```ts
interface EntityParent {
  param: string;   // route parameter name, e.g. "projectId"
  path: string;    // parent URL segment, e.g. "/projects"
}
```

URL pattern: `basePath + parent.path + /:param + operation.path` → `/api/v1/projects/:projectId/tasks`.

### EntityQuery

```ts
interface EntityQuery {
  parent: string;   // parent entity name, e.g. "project"
  param: string;    // route parameter name, e.g. "projectId"
}
```

### OperationDefinition (standalone, top-level)

```ts
interface OperationDefinition<TInput, TOutput> {
  method: HttpMethod;
  path: string;                  // :paramName params map positionally to client args
  input: TInput;                 // z.ZodType — REQUIRED
  output: TOutput;               // z.ZodType — REQUIRED
  contentType?: "json" | "multipart";
  responseType?: "json" | "blob";
  invalidates?: (queryKeys, params) => readonly unknown[][];
  transformRequest?: (input: unknown, url: string) => TransformedRequest;
  transformResponse?: (raw: unknown) => unknown;
}
```

### customizeApi(base, patch, options?)

```ts
function customizeApi<TEntities, TOperations>(
  base: { config: ApiContractConfig<TEntities, TOperations> },
  patch: ApiPatch,
  options?: { fetchFn?: FetchFn },
): ApiContract<TEntities, TOperations>;

interface ApiPatch {
  entities?: Record<string, EntityPatch>;
}
interface EntityPatch {
  operations?: Record<string, EntityOperationDef | null>; // null removes; object adds/replaces
}
```

Returns a re-derived contract (`{ config, client, queryKeys }`). The canonical way to adapt an OpenAPI-generated contract without editing generated files.

### ApiContract (return of defineApi / customizeApi)

```ts
interface ApiContract<TEntities, TOperations> {
  config: ApiContractConfig<TEntities, TOperations>;
  client: {
    [K in keyof TEntities]: EntityClient<TEntities[K]["schema"], TEntities[K]["operations"]>;
  } & {
    [K in keyof TOperations]: (...args: unknown[]) => Promise<z.infer<TOperations[K]["output"]>>;
  };
  queryKeys: {
    [K in keyof TEntities]: QueryKeyFactory;
  };
}
```

### EntityClient

A mapped type keyed by the entity's `operations`, not a fixed CRUD interface:

```ts
type EntityClient<TSchema, TOperations> = {
  [K in keyof TOperations]: (...args: unknown[]) => Promise<InferOutputData<TOperations[K]["output"]>>;
};
```

Each operation name becomes a callable, so custom operations (e.g. `archive`) appear alongside CRUD. Calling conventions per role:

```ts
client.product.list(params?);                 // or list(parentId, params?) for child entities
client.product.get(id);
client.product.create(dto);                   // or create(parentId, dto) for child entities
client.product.update(id, dto);
client.product.delete(id);
client.product.archive(id, { reason });       // custom op: path params positional, then body
```

### QueryKeyFactory

```ts
interface QueryKeyFactory {
  all: readonly unknown[];                              // [domain, entity]
  lists(): readonly unknown[];                          // [domain, entity, "list"]
  list(params: Record<string, unknown>): readonly unknown[];  // [..., "list", params]
  details(): readonly unknown[];                        // [domain, entity, "detail"]
  detail(id: EntityId): readonly unknown[];             // [..., "detail", id]
  trees(): readonly unknown[];                          // [domain, entity, "tree"]
  tree(params?: Record<string, unknown>): readonly unknown[]; // [..., "tree", params]
}
```

`EntityId` is `string | Record<string, string>` (supports composite keys).

### ListParams

```ts
interface ListParams<TFilters = Record<string, unknown>> {
  filters?: TFilters;
  sort?: SortParam | SortParam[];
  pagination?: PaginationParam;
}

interface SortParam {
  field: string;
  direction: "asc" | "desc";
}

type PaginationParam =
  | { type: "offset"; page: number; limit: number }
  | { type: "cursor"; cursor: string; limit: number };
```

### PageInfo

```ts
interface PageInfo {
  total?: number;
  hasNextPage: boolean;
  nextCursor?: string;
}
```

### QueryBuilder

```ts
interface QueryBuilder {
  buildSearchParams(params: ListParams): URLSearchParams;
  parsePageInfo?(response: unknown): PageInfo;
}
```

Built-in: `simpleQueryBuilder`

- Filters: flat key-value pairs
- Sort: `field:direction` comma-separated (e.g. `sort=name:asc,createdAt:desc`)
- Pagination offset: `page=1&limit=10`
- Pagination cursor: `cursor=abc123&limit=10`

### FetchFn

```ts
type FetchFn = <T>(path: string, options?: RequestInit) => Promise<T>;
```

### createFetch(options)

```ts
function createFetch(options?: CreateFetchOptions): FetchFn;
```

The builder behind `defaultFetch`. Build a custom `FetchFn` from declarative options instead of hand-coding fetch logic:

- `baseUrl` — prefix prepended to request paths
- `getToken` — returns a bearer token added as `Authorization: Bearer <token>` when present
- `transformResponse` — maps the parsed body (e.g. unwrap an envelope)
- `onError` — custom error handling

Also exports the context types `CreateFetchOptions`, `FetchContext`, `FetchErrorContext`.

### configureDefaultFetch(fn)

```ts
function configureDefaultFetch(fn: FetchFn): void;
```

Sets a process-wide default fetch used by every contract that does not pass an explicit `options.fetchFn`.

### defaultFetch

```ts
async function defaultFetch<T>(path: string, options?: RequestInit): Promise<T>;
```

A `createFetch` preset. Behavior:

- Adds `Content-Type: application/json` only for POST/PUT/PATCH requests whose body is not `FormData` (never for GET)
- Adds an `X-Timezone` header, and `Authorization: Bearer <token>` when a token getter is configured
- Unwraps the `{ data: T }` envelope via `transformResponse`
- Returns `undefined` for `204 No Content`
- Throws `ApiError` for non-2xx responses

### ApiError

```ts
class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  );
}
```

### Path & case helpers

```ts
function buildPath(template: string, params?: Record<string, string>): string;
function extractPathParams(path: string): string[];
function interpolatePath(path: string, params: Record<string, string>): string;
function camelToSnake(str: string): string;
```

`buildPath` / `interpolatePath` replace `:paramName` placeholders with URI-encoded values; `extractPathParams` lists the placeholder names.

### Advanced exports

`resolveRole(opName, op)` resolves a `CrudRole`; `TreeNode<T>` (`{ data, children }`) is the tree-response node shape; `wired` / `isWiredSchema` / `WiredSchema` / `InferOutputData` support wire-format envelopes for operation outputs; `TransformedRequest` is the return type of `transformRequest`. `AnyEntityDef` / `AnyOperationDef` are convenience aliases. These are primarily consumed by generated code.

---

## @simplix-react/react

### deriveEntityHooks(contract)

```ts
function deriveEntityHooks<TEntities, TOperations>(
  contract: {
    config: ApiContractConfig<TEntities, TOperations>;
    client: Record<string, unknown>;
    queryKeys: Record<string, QueryKeyFactory>;
  },
): DerivedEntityHooksResult<TEntities, TOperations>;
```

Per entity, derives a hook per operation: `use${Capitalized(operationName)}`. The standard roles produce `useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, `useInfiniteList`; a `tree`-role operation produces `useTree`; any other custom operation produces a `use<Name>` hook (GET → query, otherwise mutation). Standalone (top-level) operations expose `useMutation`.

Exported types: `DerivedEntityHooksResult` (the full return), `EntityHooks` (per-entity container), `OperationHooks` / `OperationMutationHook` (operation container + its function type), and the per-hook aliases below.

> **Type inference.** Everything derived from the contract is fully typed from the entity's Zod schema and each operation's `input` / `output` — no casts. `hooks.product.useList()` is `UseQueryResult<Product[]>`, `hooks.product.useGet(id)` is `UseQueryResult<Product>`, `hooks.product.useCreate()` is `UseMutationResult<Product, Error, CreateInput>`, the client (`api.client.product.get(id)` → `Promise<Product>`), `queryKeys`, and standalone operation `useMutation` hooks are all inferred. The per-hook signatures below describe exactly what each call returns.
>
> Two practice notes to preserve inference:
> - **Define operations inline** in `defineApi`. Extracting one into a `const … satisfies OperationDefinition` widens its generics to `OperationDefinition<ZodType, ZodType>`, which de-types its derived hook.
> - For a **standalone operation's** `invalidates`, annotate the param — `(queryKeys: Record<string, QueryKeyFactory>) => …` — so contract inference doesn't fall back. (Entity-operation `invalidates` callbacks infer the param automatically.)

### useList

```ts
type DerivedListHook<TData> = (
  parentIdOrParams?: string | ListParams,
  paramsOrOptions?: ListParams | Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
  options?: Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData[]>;
```

Overloaded calling conventions:

- `useList()` — all entities
- `useList(options)` — with query options
- `useList(params)` / `useList(params, options)` — filtered list
- `useList(parentId)` / `useList(parentId, params)` / `useList(parentId, params, options)` — child entity

Auto-disables when `parentId` is falsy for child entities.

### useGet

```ts
type DerivedGetHook<TData> = (
  id: EntityId,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData>;
```

`EntityId` is `string | Record<string, string>`. Auto-disables when a string `id` is falsy, or when a composite (object) `id` has no keys.

### useCreate

```ts
type DerivedCreateHook<TInput, TOutput> = (
  parentId?: string,
  options?: Omit<UseMutationOptions<TOutput, Error, TInput>, "mutationFn">,
) => UseMutationResult<TOutput, Error, TInput>;
```

Invalidates all entity queries on success.

### useUpdate

```ts
type DerivedUpdateHook<TInput, TOutput> = (
  options?: Omit<UseMutationOptions<TOutput, Error, { id: EntityId; dto: TInput }>, "mutationFn">
    & { optimistic?: boolean },
) => UseMutationResult<TOutput, Error, { id: EntityId; dto: TInput }>;
```

Mutation variable: `{ id: EntityId; dto: TInput }`. With `optimistic: true`: cancels in-flight queries → snapshots list data → optimistically updates the list cache → rolls back on error → invalidates on settlement.

### useDelete

```ts
type DerivedDeleteHook = (
  options?: Omit<UseMutationOptions<void, Error, EntityId>, "mutationFn">,
) => UseMutationResult<void, Error, EntityId>;
```

Mutation variable: the entity `id` (`EntityId`). Invalidates all entity queries on success.

### useInfiniteList

```ts
type DerivedInfiniteListHook<TData> = (
  parentId?: string,
  params?: Omit<ListParams, "pagination"> & { limit?: number },
  options?: Record<string, unknown>,
) => UseInfiniteQueryResult<{ data: TData[]; meta: PageInfo }, Error>;
```

Supports cursor- and offset-based pagination. Default limit: 20.

### useTree

```ts
type DerivedTreeHook<TData> = (
  params?: Record<string, unknown>,
  options?: Record<string, unknown>,
) => UseQueryResult<TData>;
```

Present only for a `tree`-role operation. Keyed by `queryKeys.<entity>.tree(params)`.

### Operation hooks (standalone operations)

```ts
interface OperationHooks<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  useMutation: OperationMutationHook<z.infer<TInput>, z.infer<TOutput>>;
}

type OperationMutationHook<TInput, TOutput> = (
  options?: Omit<UseMutationOptions<TOutput, Error, TInput>, "mutationFn">,
) => UseMutationResult<TOutput, Error, TInput>;
```

Automatically invalidates the query keys returned by the operation's `invalidates` callback.

### useBatchDetails

```ts
function useBatchDetails<TList, TDetail>(
  listData: TList[] | undefined,
  extractId: (item: TList) => string | undefined,
  getQueryOptions: (id: string) => { queryKey: readonly unknown[]; queryFn: QueryFunction<TDetail> },
): { data: TDetail[]; isPending: boolean };
```

Fetches a detail record for every item in a list (one query per extracted id, via `useQueries` + `combine`). Items whose `extractId` returns `undefined` are skipped; only successfully-resolved details are returned. Use to avoid hand-rolling N+1 list → detail fetching.

---

## @simplix-react/form

Derives TanStack Form hooks from the same contract. Mirrors `deriveEntityHooks`.

### deriveEntityFormHooks(contract, hooks)

```ts
function deriveEntityFormHooks<TEntities>(
  contract: { config: ApiContractConfig<TEntities, any> },
  hooks: { [K in keyof TEntities]: EntityHooks<TEntities[K]["schema"]> },
): DerivedEntityFormHooksResult<TEntities>;
```

Takes the contract from `defineApi()` AND the React Query hooks from `deriveEntityHooks()`. Per entity, produces `useCreateForm` / `useUpdateForm` when the entity has `create` / `update` operations.

### EntityFormHooks

```ts
interface EntityFormHooks<TSchema> {
  useCreateForm?: DerivedCreateFormHook<TCreate>;   // present only if a "create" op exists
  useUpdateForm?: DerivedUpdateFormHook<TSchema>;   // present only if an "update" op exists
}
```

### useCreateForm

```ts
type DerivedCreateFormHook<TCreate> = (
  parentId?: string,
  options?: CreateFormOptions<TCreate>,
) => CreateFormReturn;

interface CreateFormOptions<TCreate> {
  defaultValues?: Partial<z.infer<TCreate>>;
  resetOnSuccess?: boolean;            // default true
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface CreateFormReturn {
  form: AnyFormApi;                    // TanStack Form instance (form.Field, form.handleSubmit())
  isSubmitting: boolean;
  submitError: Error | null;
  reset: () => void;
}
```

### useUpdateForm

```ts
type DerivedUpdateFormHook<TSchema> = (
  entityId: string,
  options?: UpdateFormOptions,
) => UpdateFormReturn<TSchema>;

interface UpdateFormOptions {
  dirtyOnly?: boolean;                 // default true — send only changed fields (PATCH-friendly)
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UpdateFormReturn<TSchema> {
  form: AnyFormApi;
  isLoading: boolean;                  // entity still loading from server
  isSubmitting: boolean;
  submitError: Error | null;
  entity: z.infer<TSchema> | undefined;
}
```

### Form utilities

```ts
function extractDirtyFields<T>(values: T, defaults: T): Partial<T>;
function mapServerErrorsToForm(form: AnyFormApi, error: unknown): void;
function zodToFieldErrors(error: z.ZodError): Record<string, string>;
```

`mapServerErrorsToForm` projects server-side validation errors back onto the relevant form fields.

---

## @simplix-react/mock

### deriveMockHandlers(config, mockConfig?, options?)

```ts
function deriveMockHandlers<TEntities, TOperations>(
  config: ApiContractConfig<TEntities, TOperations>,
  mockConfig?: Record<string, MockEntityConfig>,
  options?: MockHandlerOptions,
): HttpHandler[];
```

Generates MSW handlers for each entity:

- `GET list` — filtering, sorting, offset-based pagination
- `GET :id` — with optional `belongsTo` relation loading
- `POST create` — assigns a numeric auto-increment `id` (via `getNextId`) when none is provided
- `PATCH :id` — partial update; stamps an `updatedAt` timestamp
- `DELETE :id` — remove by id

### MockEntityConfig

```ts
interface MockEntityConfig {
  defaultLimit?: number;       // default: 50
  maxLimit?: number;           // default: 100
  defaultSort?: string;        // default: "createdAt:desc"
  relations?: Record<string, {
    entity: string;
    localKey: string;
    foreignKey?: string;       // default: "id"
    type: "belongsTo";
  }>;
  resolvers?: Record<string, (info: { request: Request; params: Record<string, string> }) => Promise<Response> | Response>;
}
```

### MockHandlerOptions / MockResponseWrapper

```ts
interface MockHandlerOptions {
  responseWrapper?: MockResponseWrapper;
}
interface MockResponseWrapper {
  success: (data: unknown) => Record<string, unknown>;
  error: (error: { code?: string; message?: string } | undefined) => Record<string, unknown>;
}
```

`options.responseWrapper` customizes the response envelope — e.g. to emit a backend's wrapped shape (SimpliX Boot's `{ type, message, body, timestamp }`). Defaults: success → `{ data }`, error → `{ code, message }`.

### setupMockWorker(config)

```ts
async function setupMockWorker(config: MockServerConfig): Promise<void>;

interface MockDomainConfig {
  name: string;
  enabled?: boolean;                            // default: true
  handlers: RequestHandler[];
  seed?: Record<string, Record<string, unknown>[]>;
}

interface MockServerConfig {
  domains: MockDomainConfig[];
}
```

Steps: filter enabled domains → reset in-memory stores → seed stores → start the MSW worker.

### In-memory store (contract system)

```ts
function getEntityStore(storeName: string): Map<string | number, Record<string, unknown>>;
function getNextId(storeName: string): number;
function seedEntityStore(storeName: string, records: Record<string, unknown>[]): void;
function resetStore(): void;
```

Store naming: `{domain}_{snake_case_entity}` (e.g. `"project_tasks"`).

### Typed entity store (Orval models)

```ts
function createMockEntityStore<T>(seeds?: T[], idField?: string): MockEntityStore<T>; // idField default "id"
```

A separate typed store for generated Orval models. `MockEntityStore<T>` exposes `list`, `listPaged`, `filter`, `getById`, `create`, `update`, `upsert`, `remove`, `reset`. `listPaged` returns a Spring-style `PagedResult<T>`:

```ts
interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

### Tree builders

```ts
function buildEmbeddedTree<T>(rows: T[], identityField?: string, parentField?: string): T[];  // defaults "id" / "parentId"
function buildTreeFromFlatRows<T>(rows: T[], identityField?: string): TreeNode<T>[];           // default "id"
```

`buildEmbeddedTree` nests `children` into each row; `buildTreeFromFlatRows` wraps rows as `TreeNode<T>` (`{ data, children }`). Used by the `tree`-role handler.

### MockResult

```ts
interface MockResult<T> {
  success: boolean;
  data?: T;
  error?: MockError;
}

interface MockError {
  code: string;    // "not_found" | "unique_violation" | "foreign_key_violation" | ...
  message: string;
}

function mockSuccess<T>(data: T): MockResult<T>;
function mockFailure(error: MockError): MockResult<never>;   // not generic
```

---

## @simplix-react/i18n

### createI18nConfig(options)

```ts
function createI18nConfig(options: CreateI18nConfigOptions): I18nConfigResult;

interface CreateI18nConfigOptions {
  defaultLocale?: LocaleCode;                       // default: "en"
  fallbackLocale?: LocaleCode;                      // default: "en"
  supportedLocales?: (LocaleCode | LocaleConfig)[]; // string codes resolve against DEFAULT_LOCALES
  detection?: {
    order: ("localStorage" | "navigator")[];
    storageKey?: string;                            // default: "i18n:locale"
  };
  appTranslations?: Record<string, unknown>;        // from import.meta.glob
  moduleTranslations?: ModuleTranslations[];
  debug?: boolean;
}

interface I18nConfigResult {
  adapter: I18nextAdapter;
  i18nReady: Promise<void>;
}
```

### I18nextAdapter

```ts
class I18nextAdapter implements II18nAdapter {
  constructor(options?: I18nextAdapterOptions);

  readonly locale: LocaleCode;
  readonly fallbackLocale: LocaleCode;
  readonly availableLocales: LocaleCode[];

  initialize(defaultLocale?: LocaleCode): Promise<void>;
  dispose(): Promise<void>;

  setLocale(locale: LocaleCode): Promise<void>;
  getLocaleInfo(locale: LocaleCode): LocaleInfo | null;

  t(key: string, values?: TranslationValues): string;
  tn(namespace: string, key: string, values?: TranslationValues): string;
  tp(key: string, count: number, values?: TranslationValues): string;
  exists(key: string, namespace?: string): boolean;

  formatDate(date: Date, options?: DateTimeFormatOptions): string;
  formatTime(date: Date, options?: DateTimeFormatOptions): string;
  formatDateTime(date: Date, options?: DateTimeFormatOptions): string;
  formatRelativeTime(date: Date): string;
  formatNumber(value: number, options?: NumberFormatOptions): string;
  formatCurrency(value: number, currency?: string): string;

  loadTranslations(locale: string, namespace: string, translations: Record<string, string | PluralForms>): void;
  addResources(locale: string, namespace: string, resources: Record<string, unknown>): void;
  getLoadState(locale: string, namespace?: string): TranslationLoadState;

  onLocaleChange(handler: (locale: string) => void): () => void;
  getI18nextInstance(): I18nextInstance;
}
```

### I18nextAdapterOptions

```ts
interface I18nextAdapterOptions {
  defaultLocale?: LocaleCode;        // default: "en"
  fallbackLocale?: LocaleCode;       // default: "en"
  locales?: LocaleConfig[];          // default: built-in ko/en/ja
  resources?: TranslationResources;
  i18nextInstance?: I18nextInstance;
  debug?: boolean;
}
```

### buildModuleTranslations(options)

```ts
function buildModuleTranslations(options: BuildModuleTranslationsOptions): ModuleTranslations;

interface BuildModuleTranslationsOptions {
  namespace: string;
  locales: string[];
  components: Record<string, ComponentTranslations>;
}

interface ComponentTranslations {
  [locale: string]: () => Promise<{ default: Record<string, unknown> }>;
}

interface ModuleTranslations {
  namespace: string;
  locales: string[];
  load(locale: string): Promise<Record<string, Record<string, unknown>>>;
}
```

Also exported from the main entry: `registerModuleTranslations`, `registerDomainTranslations` (with `DomainTranslationConfig`), and the locale constants `DEFAULT_LOCALES` / `SUPPORTED_LOCALES`.

### React hooks (`@simplix-react/i18n/react`)

```ts
function I18nProvider(props: { adapter: II18nAdapter; children: ReactNode }): JSX.Element;

function useTranslation(namespace: string): {
  t: (key: string, values?: TranslationValues) => string;
  locale: string;
  exists: (key: string) => boolean;
};

function useLocale(): LocaleCode;
function useI18n(): II18nAdapter | null;
function useI18nAdapter(): II18nAdapter | null;
```

Also available: `useEntityTranslation` (entity-scoped labels), `useLocalePicker` (drop-in locale switcher options), `useLocalizedText`.

### Type constants

```ts
const DATE_TIME_STYLES = { FULL: "full", LONG: "long", MEDIUM: "medium", SHORT: "short" };
const NUMBER_FORMAT_STYLES = { DECIMAL: "decimal", CURRENCY: "currency", PERCENT: "percent", UNIT: "unit" };
const TEXT_DIRECTIONS = { LTR: "ltr", RTL: "rtl" };
const TRANSLATION_LOAD_STATES = { IDLE: "idle", LOADING: "loading", LOADED: "loaded", ERROR: "error" };
```

---

## @simplix-react/testing

### createTestQueryClient()

```ts
function createTestQueryClient(): QueryClient;
```

Returns a `QueryClient` with `queries: { retry: false, gcTime: 0, staleTime: 0 }` and `mutations: { retry: false }`.

### createTestWrapper(options?)

```ts
function createTestWrapper(options?: { queryClient?: QueryClient }): FC<{ children: ReactNode }>;
```

Wraps children in a `QueryClientProvider`.

### createMockClient(config, data)

```ts
function createMockClient<TEntities>(
  config: Pick<ApiContractConfig<TEntities>, "entities">,
  data: Record<string, unknown[]>,
): Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
```

An in-memory client backed by plain arrays. Method keys are the entity's actual operation names (mapped by CRUD role), not a fixed verb set. Behaviors by role:

- `list(params?)` — returns all items
- `get(id)` — find by id, rejects if not found
- `create(dto)` or `create(parentId, dto)` — appends with a `crypto.randomUUID()` id (a string first arg is treated as a parent id)
- `update(id, dto)` — merges fields, rejects if not found
- `delete(id)` — removes, rejects if not found
- `tree()` — returns an empty array
- any non-CRUD / custom operation — returns `null` by default

### waitForQuery(queryClient, queryKey, options?)

```ts
async function waitForQuery(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  options?: { timeout?: number },   // default: 5000
): Promise<void>;
```

Polls every 10ms until the query leaves "pending" status. Throws on timeout.

### Access-control test utilities

```ts
function createMockPolicy(options?: MockPolicyOptions): AccessPolicy;

interface MockPolicyOptions {
  rules?: AccessRule[];
  user?: AccessUser;
  allowAll?: boolean;   // default true → full access (manage/all)
}

function createAccessTestWrapper(options?: AccessTestWrapperOptions): FC<{ children: ReactNode }>;

interface AccessTestWrapperOptions {
  queryClient?: QueryClient;
  policy?: AccessPolicy;
}
```

`createMockPolicy` builds a mock `AccessPolicy` (from `@simplix-react/access`) defaulting to full access. `createAccessTestWrapper` wraps children in both a `QueryClientProvider` and an `AccessProvider` — use it to render access-gated UI in tests.
