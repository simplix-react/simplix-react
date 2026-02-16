# API Patterns Reference

Comprehensive API signatures for all simplix-react packages.

## @simplix-react/contract

### defineApi(config, options?)

```ts
function defineApi<TEntities, TOperations>(
  config: ApiContractConfig<TEntities, TOperations>,
  options?: { fetchFn?: FetchFn },
): ApiContract<TEntities, TOperations>;
```

Returns `{ config, client, queryKeys }`.

### ApiContractConfig

```ts
interface ApiContractConfig<TEntities, TOperations> {
  domain: string;
  basePath: string;
  entities: TEntities;           // Record<string, EntityDefinition>
  operations?: TOperations;      // Record<string, OperationDefinition>
  queryBuilder?: QueryBuilder;
}
```

### EntityDefinition

```ts
interface EntityDefinition<TSchema, TCreate, TUpdate> {
  path: string;
  schema: TSchema;               // z.ZodType -- response shape
  createSchema: TCreate;         // z.ZodType -- create payload
  updateSchema: TUpdate;         // z.ZodType -- update payload
  parent?: EntityParent;
  queries?: Record<string, EntityQuery>;
  filterSchema?: z.ZodType;
}
```

### EntityParent

```ts
interface EntityParent {
  param: string;   // route parameter name, e.g. "projectId"
  path: string;    // parent URL segment, e.g. "/projects"
}
```

URL pattern: `basePath + parent.path + /:param + entity.path`

Example: `/api/v1/projects/:projectId/tasks`

### EntityQuery

```ts
interface EntityQuery {
  parent: string;   // parent entity name, e.g. "project"
  param: string;    // route parameter name, e.g. "projectId"
}
```

### OperationDefinition

```ts
interface OperationDefinition<TInput, TOutput> {
  method: HttpMethod;            // "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string;                  // with :paramName, e.g. "/tasks/:taskId/assign"
  input: TInput;                 // z.ZodType
  output: TOutput;               // z.ZodType
  contentType?: "json" | "multipart";
  responseType?: "json" | "blob";
  invalidates?: (
    queryKeys: Record<string, QueryKeyFactory>,
    params: Record<string, string>,
  ) => readonly unknown[][];
}
```

Path parameters are positionally mapped to client function arguments.

### ApiContract (return type of defineApi)

```ts
interface ApiContract<TEntities, TOperations> {
  config: ApiContractConfig<TEntities, TOperations>;
  client: {
    [K in keyof TEntities]: EntityClient<...>;
  } & {
    [K in keyof TOperations]: (...args) => Promise<z.infer<TOutput>>;
  };
  queryKeys: {
    [K in keyof TEntities]: QueryKeyFactory;
  };
}
```

### EntityClient

```ts
interface EntityClient<TSchema, TCreate, TUpdate> {
  list(parentIdOrParams?: string | ListParams, params?: ListParams): Promise<z.infer<TSchema>[]>;
  get(id: string): Promise<z.infer<TSchema>>;
  create(parentIdOrDto: string | z.infer<TCreate>, dto?: z.infer<TCreate>): Promise<z.infer<TSchema>>;
  update(id: string, dto: z.infer<TUpdate>): Promise<z.infer<TSchema>>;
  delete(id: string): Promise<void>;
}
```

For child entities (with `parent`):

- `list(parentId, params?)` -- scoped to parent
- `create(parentId, dto)` -- POST under parent URL
- `get(id)`, `update(id, dto)`, `delete(id)` -- use entity's own ID

### QueryKeyFactory

```ts
interface QueryKeyFactory {
  all: readonly unknown[];                              // [domain, entity]
  lists(): readonly unknown[];                          // [domain, entity, "list"]
  list(params: Record<string, unknown>): readonly unknown[];  // [domain, entity, "list", params]
  details(): readonly unknown[];                        // [domain, entity, "detail"]
  detail(id: string): readonly unknown[];               // [domain, entity, "detail", id]
}
```

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

### defaultFetch

```ts
async function defaultFetch<T>(path: string, options?: RequestInit): Promise<T>;
```

- Adds `Content-Type: application/json` header
- Unwraps `{ data: T }` envelope
- Returns `undefined` for 204 No Content
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

### buildPath

```ts
function buildPath(template: string, params?: Record<string, string>): string;
```

Replaces `:paramName` placeholders with URI-encoded values.

### Case Transform Utilities

```ts
function camelToSnake(str: string): string;
function camelToKebab(str: string): string;
```

---

## @simplix-react/react

### deriveHooks(contract)

```ts
function deriveHooks<TEntities, TOperations>(
  contract: {
    config: ApiContractConfig<TEntities, TOperations>;
    client: Record<string, unknown>;
    queryKeys: Record<string, QueryKeyFactory>;
  },
): DerivedHooksResult<TEntities, TOperations>;
```

### Entity Hook Signatures

#### useList

```ts
type DerivedListHook<TData> = (
  parentIdOrParams?: string | ListParams,
  paramsOrOptions?: ListParams | Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
  options?: Omit<UseQueryOptions<TData[], Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData[]>;
```

Overloaded calling conventions:

- `useList()` -- all entities
- `useList(options)` -- with query options
- `useList(params)` -- filtered list
- `useList(params, options)` -- filtered list with options
- `useList(parentId)` -- child entity list
- `useList(parentId, params)` -- filtered child list
- `useList(parentId, params, options)` -- filtered child list with options

Auto-disables when `parentId` is falsy for child entities.

#### useGet

```ts
type DerivedGetHook<TData> = (
  id: string,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn">,
) => UseQueryResult<TData>;
```

Auto-disables when `id` is falsy.

#### useCreate

```ts
type DerivedCreateHook<TInput, TOutput> = (
  parentId?: string,
  options?: Omit<UseMutationOptions<TOutput, Error, TInput>, "mutationFn">,
) => UseMutationResult<TOutput, Error, TInput>;
```

Invalidates all entity queries on success.

#### useUpdate

```ts
type DerivedUpdateHook<TInput, TOutput> = (
  options?: Omit<UseMutationOptions<TOutput, Error, { id: string; dto: TInput }>, "mutationFn">
    & { optimistic?: boolean },
) => UseMutationResult<TOutput, Error, { id: string; dto: TInput }>;
```

Mutation variable shape: `{ id: string; dto: TInput }`.

When `optimistic: true`:

1. Cancels in-flight queries
2. Snapshots current list data
3. Optimistically updates list cache
4. Rolls back on error
5. Invalidates on settlement

#### useDelete

```ts
type DerivedDeleteHook = (
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) => UseMutationResult<void, Error, string>;
```

Mutation variable: entity `id` string. Invalidates all entity queries on success.

#### useInfiniteList

```ts
type DerivedInfiniteListHook<TData> = (
  parentId?: string,
  params?: Omit<ListParams, "pagination"> & { limit?: number },
  options?: Record<string, unknown>,
) => UseInfiniteQueryResult<{ data: TData[]; meta: PageInfo }, Error>;
```

Supports both cursor-based and offset-based pagination. Default limit: 20.

### Operation Hook Signatures

```ts
interface OperationHooks<TInput, TOutput> {
  useMutation: (
    options?: Omit<UseMutationOptions<TOutput, Error, TInput>, "mutationFn">,
  ) => UseMutationResult<TOutput, Error, TInput>;
}
```

Automatically invalidates query keys specified in the operation's `invalidates` callback.

---

## @simplix-react/mock

### deriveMockHandlers(config, mockConfig?)

```ts
function deriveMockHandlers<TEntities, TOperations>(
  config: ApiContractConfig<TEntities, TOperations>,
  mockConfig?: Record<string, MockEntityConfig>,
): HttpHandler[];
```

Generates MSW handlers for each entity:

- `GET list` -- filtering, sorting, offset-based pagination
- `GET :id` -- with optional `belongsTo` relation loading
- `POST create` -- auto-generates UUID `id`
- `PATCH :id` -- partial update with `updated_at` timestamp
- `DELETE :id` -- remove by id

### MockEntityConfig

```ts
interface MockEntityConfig {
  tableName?: string;          // default: snake_case(entityName) + "s"
  defaultLimit?: number;       // default: 50
  maxLimit?: number;           // default: 100
  defaultSort?: string;        // default: "created_at DESC"
  relations?: Record<string, {
    table: string;
    localKey: string;
    foreignKey?: string;       // default: "id"
    type: "belongsTo";
  }>;
}
```

### setupMockWorker(config)

```ts
async function setupMockWorker(config: MockServerConfig): Promise<void>;

interface MockDomainConfig {
  name: string;
  enabled?: boolean;                            // default: true
  handlers: RequestHandler[];
  migrations: Array<(db: PGlite) => Promise<void>>;
  seed?: Array<(db: PGlite) => Promise<void>>;
}

interface MockServerConfig {
  dataDir?: string;                             // default: "idb://simplix-mock"
  domains: MockDomainConfig[];
}
```

Steps: filter enabled domains -> init PGlite -> run all migrations -> run all seeds -> start MSW worker.

### PGlite Utilities

```ts
async function initPGlite(dataDir: string): Promise<PGlite>;
function getPGliteInstance(): PGlite;          // throws if not initialized
function resetPGliteInstance(): void;          // for test teardown
```

### SQL Utilities

```ts
async function executeSql<T>(sql: string, values?: unknown[]): Promise<T[]>;
function buildSetClause(dto: Record<string, unknown>): SetClauseResult;
function mapRow<T>(row: Record<string, unknown>): T;    // snake_case -> camelCase
function mapRows<T>(rows: Record<string, unknown>[]): T[];
function toSnakeCase(str: string): string;
function toCamelCase(str: string): string;
async function tableExists(tableName: string): Promise<boolean>;
async function columnExists(tableName: string, columnName: string): Promise<boolean>;
async function addColumnIfNotExists(tableName: string, columnName: string, columnType: string): Promise<void>;
```

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
function mockFailure<T>(error: MockError): MockResult<T>;
```

---

## @simplix-react/i18n

### createI18nConfig(options)

```ts
function createI18nConfig(options: CreateI18nConfigOptions): I18nConfigResult;

interface CreateI18nConfigOptions {
  defaultLocale?: LocaleCode;        // default: "en"
  fallbackLocale?: LocaleCode;       // default: "en"
  supportedLocales?: LocaleConfig[];
  detection?: { order: string[] };
  appTranslations?: Record<string, unknown>;   // from import.meta.glob
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

  // Properties
  readonly locale: LocaleCode;
  readonly fallbackLocale: LocaleCode;
  readonly availableLocales: LocaleCode[];

  // Lifecycle
  initialize(defaultLocale?: LocaleCode): Promise<void>;
  dispose(): Promise<void>;

  // Locale
  setLocale(locale: LocaleCode): Promise<void>;
  getLocaleInfo(locale: LocaleCode): LocaleInfo | null;

  // Translation
  t(key: string, values?: TranslationValues): string;
  tn(namespace: string, key: string, values?: TranslationValues): string;
  tp(key: string, count: number, values?: TranslationValues): string;
  exists(key: string, namespace?: string): boolean;

  // Formatting
  formatDate(date: Date, options?: DateTimeFormatOptions): string;
  formatTime(date: Date, options?: DateTimeFormatOptions): string;
  formatDateTime(date: Date, options?: DateTimeFormatOptions): string;
  formatRelativeTime(date: Date): string;
  formatNumber(value: number, options?: NumberFormatOptions): string;
  formatCurrency(value: number, currency?: string): string;

  // Resource management
  loadTranslations(locale: string, namespace: string, translations: Record<string, string | PluralForms>): void;
  addResources(locale: string, namespace: string, resources: Record<string, unknown>): void;
  getLoadState(locale: string, namespace?: string): TranslationLoadState;

  // Events
  onLocaleChange(handler: (locale: string) => void): () => void;

  // Advanced
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

### React Hooks (from `@simplix-react/i18n/react`)

```ts
function useTranslation(namespace: string): {
  t: (key: string, values?: TranslationValues) => string;
  locale: string;
  exists: (key: string) => boolean;
};

function useLocale(): LocaleCode;

function useI18n(): II18nAdapter | null;
```

### Type Constants

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

Returns a `QueryClient` with: `retry: false`, `gcTime: 0`, `staleTime: 0`.

### createTestWrapper(options?)

```ts
function createTestWrapper(options?: {
  queryClient?: QueryClient;
}): FC<{ children: ReactNode }>;
```

Returns a component wrapping children with `QueryClientProvider`.

### createMockClient(config, data)

```ts
function createMockClient<TEntities>(
  config: Pick<ApiContractConfig<TEntities>, "entities">,
  data: Record<string, unknown[]>,
): Record<string, { list, get, create, update, delete }>;
```

In-memory CRUD client backed by plain arrays. Methods:

- `list(params?)` -- returns all items
- `get(id)` -- find by id, rejects if not found
- `create(dto)` -- appends with auto-generated UUID id
- `update(id, dto)` -- merges fields, rejects if not found
- `delete(id)` -- removes, rejects if not found

### waitForQuery(queryClient, queryKey, options?)

```ts
async function waitForQuery(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  options?: { timeout?: number },   // default: 5000
): Promise<void>;
```

Polls every 10ms until query leaves "pending" status. Throws on timeout.
