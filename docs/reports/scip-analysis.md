# simplix-react SCIP Code Intelligence Report

> Generated via [scip-typescript](https://github.com/sourcegraph/scip-typescript) + [scip CLI](https://github.com/sourcegraph/scip)
> Date: 2026-02-11

---

## 1. Overview

| Metric | Value |
| --- | --- |
| Total documents indexed | 99 |
| Global symbols | 2,881 |
| Symbol mentions | 6,709 |
| Definition ranges | 492 |
| Index chunks | 143 |

---

## 2. Package Summary

| Package | Files (src) | Files (test) | Lines (src) | Lines (test) | Symbols |
| --- | --- | --- | --- | --- | --- |
| `@simplix-react/cli` | 37 | 2 | 4,891 | 941 | 971 |
| `@simplix-react/i18n` | 11 | 0 | 1,248 | — | 608 |
| `@simplix-react/contract` | 10 | 2 | 1,089 | 301 | 361 |
| `@simplix-react/mock` | 9 | 1 | 1,201 | 139 | 274 |
| `@simplix-react/react` | 3 | 0 | 690 | — | 143 |
| `@simplix-react/testing` | 5 | 0 | 234 | — | 54 |
| **Total** | **75** | **5** | **9,353** | **1,381** | **2,411** |

External dependency symbols: 470

---

## 3. Public API Surface

### 3.1 Interfaces & Types

| Package | Interfaces | Types | Classes | Total |
| --- | --- | --- | --- | --- |
| `contract` | 16 | — | — | 16 |
| `i18n` | — | — | — | 24 |
| `mock` | — | 10 | — | 10 |
| `react` | — | 13 | — | 13 |

### 3.2 Core Interfaces — `@simplix-react/contract`

| Interface | Description |
| --- | --- |
| `ApiContract` | Fully constructed API contract returned by `defineApi()` |
| `ApiContractConfig` | Complete API contract configuration with entities and operations |
| `EntityDefinition` | CRUD-capable API entity with Zod schemas |
| `EntityClient` | Type-safe CRUD client for a single entity |
| `EntityParent` | Parent resource in a nested entity relationship |
| `EntityQuery` | Named query scope filtering entities by parent |
| `QueryKeyFactory` | Structured query key generators for React Query |
| `OperationDefinition` | Custom (non-CRUD) API operation |
| `FetchFn` | Customizable fetch function signature |
| `HttpMethod` | Supported HTTP methods |
| `ListParams` | List query parameters: filters, sorting, pagination |
| `PageInfo` | Pagination metadata from server |
| `PaginationParam` | Offset-based and cursor-based pagination |
| `QueryBuilder` | List parameter serialization to URL search params |
| `SortParam` | Sort directive with field name and direction |
| `ApiError` | HTTP error response (class) |

### 3.3 Core Interfaces — `@simplix-react/react`

| Type | Description |
| --- | --- |
| `DerivedHooksResult` | Complete set of hooks returned by `deriveHooks()` |
| `EntityHooks` | CRUD hooks for a single entity (list, get, create, update, delete) |
| `OperationHooks` | Hooks for custom operations |
| `DerivedListHook` | List query hook with overloaded signatures |
| `DerivedInfiniteListHook` | Infinite list hook for cursor-based pagination |
| `DerivedGetHook` | Detail query hook for single entity by ID |
| `DerivedCreateHook` | Create mutation hook with auto-invalidation |
| `DerivedUpdateHook` | Update mutation hook |
| `DerivedDeleteHook` | Delete mutation hook |
| `OperationMutationHook` | Mutation hook for custom operations |

### 3.4 Core Interfaces — `@simplix-react/mock`

| Type | Description |
| --- | --- |
| `MockEntityConfig` | Per-entity configuration for mock handler generation |
| `MockServerConfig` | Configuration for `setupMockWorker()` |
| `MockResult` | Outcome wrapper for mock repository operations |
| `MockError` | Mapped database error with HTTP-friendly status code |
| `ParsedSearchParams` | Parsed URL search parameters |
| `SetClauseResult` | SQL SET clause builder result |
| `DbRow` | Raw database row type |
| `RequestHandler` | MSW request handler type |

### 3.5 Core Interfaces — `@simplix-react/i18n`

| Type | Description |
| --- | --- |
| `II18nAdapter` | Internationalization adapter contract |
| `I18nextAdapter` | i18next implementation of `II18nAdapter` (class) |
| `I18nextAdapterOptions` | Constructor options for `I18nextAdapter` |
| `LocaleConfig` | Configuration for a single supported locale |
| `LocaleInfo` | Locale metadata (display names, text direction) |
| `LocaleCode` | BCP 47 locale code string |
| `TextDirection` | Text direction value (ltr/rtl) |
| `TranslationNamespace` | Translation namespace identifier |
| `TranslationValues` | Key-value pairs for interpolation |
| `PluralForms` | Plural form strings following CLDR rules |
| `DateTimeFormatOptions` | Date/time formatting configuration |
| `NumberFormatOptions` | Number formatting configuration |
| `TranslationLoadState` | Translation loading state |
| `TranslateFunction` | Type-safe translation function |
| `UseTranslationReturn` | Return type of `useTranslation()` hook |
| `I18nProviderProps` | Props for `I18nProvider` component |
| `CreateI18nConfigOptions` | Options for `createI18nConfig()` |
| `I18nConfigResult` | Result of `createI18nConfig()` |
| `ModuleTranslations` | Output of `buildModuleTranslations()` |
| `ComponentTranslations` | Locale-to-lazy-loader mapping |
| `BuildModuleTranslationsOptions` | Options for `buildModuleTranslations()` |

---

## 4. Function Catalog

### 4.1 `@simplix-react/contract` (13 functions)

| Function | File | Signature |
| --- | --- | --- |
| `defineApi()` | `define-api.ts` | `<TEntities, TOperations>(...) → ApiContract` |
| `deriveClient()` | `derive/client.ts` | `<TEntities, TOperations>(...) → Record<string, EntityClient>` |
| `createEntityClient()` | `derive/client.ts` | `(basePath, entity, fetchFn) → EntityClient` |
| `createOperationClient()` | `derive/client.ts` | `(basePath, operation, fetchFn) → Function` |
| `deriveQueryKeys()` | `derive/query-keys.ts` | `<TEntities>(...) → Record<string, QueryKeyFactory>` |
| `createQueryKeyFactory()` | `derive/query-keys.ts` | `(domain, entity) → QueryKeyFactory` |
| `defaultFetch()` | `helpers/fetch.ts` | `<T>(path, options?) → Promise<T>` |
| `buildPath()` | `helpers/path-builder.ts` | `(template, params?) → string` |
| `camelToKebab()` | `helpers/case-transform.ts` | `(str) → string` |
| `camelToSnake()` | `helpers/case-transform.ts` | `(str) → string` |
| `blobFetch()` | `derive/client.ts` | `(url, method, inputData?) → Promise<Blob>` |
| `multipartFetch()` | `derive/client.ts` | `(url, method, formData, responseType?) → Promise` |
| `toFormData()` | `derive/client.ts` | `(data) → FormData` |

### 4.2 `@simplix-react/react` (7 functions)

| Function | File | Signature |
| --- | --- | --- |
| `deriveHooks()` | `derive-hooks.ts` | `<TEntities, TOperations>(contract) → DerivedHooksResult` |
| `createEntityHooks()` | `derive-hooks.ts` | `(entity, entityClient, keys, ...) → EntityHooks` |
| `createOperationHooks()` | `derive-hooks.ts` | `(opClient, operation, ...) → OperationHooks` |
| `resolveListArgs()` | `derive-hooks.ts` | `(firstArg, secondArg, thirdArg) → { parentId, params, options }` |
| `isListParams()` | `derive-hooks.ts` | `(value) → value is ListParams` |
| `isRecord()` | `derive-hooks.ts` | `(value) → value is Record` |
| `omit()` | `derive-hooks.ts` | `<T>(obj, keys) → Partial<T>` |

### 4.3 `@simplix-react/mock` (17 functions)

| Function | File | Signature |
| --- | --- | --- |
| `deriveMockHandlers()` | `derive-mock-handlers.ts` | `<TEntities, TOperations>(config) → HttpHandler[]` |
| `setupMockWorker()` | `msw.ts` | `(config: MockServerConfig) → Promise<void>` |
| `initPGlite()` | `pglite.ts` | `(dataDir) → Promise<PGlite>` |
| `getPGliteInstance()` | `pglite.ts` | `() → PGlite` |
| `resetPGliteInstance()` | `pglite.ts` | `() → void` |
| `mockSuccess()` | `mock-result.ts` | `<T>(data) → MockResult<T>` |
| `mockFailure()` | `mock-result.ts` | `(error) → MockResult<never>` |
| `toResponse()` | `derive-mock-handlers.ts` | `<T>(result, status?) → HttpResponse` |
| `queryById()` | `derive-mock-handlers.ts` | `<T>(tableName, id) → Promise<MockResult<T>>` |
| `queryByIdWithRelations()` | `derive-mock-handlers.ts` | `<T>(tableName, id, relations) → Promise<MockResult<T>>` |
| `queryListWithParams()` | `derive-mock-handlers.ts` | `<T>(tableName, parentColumn, parentId, ...) → Promise` |
| `insertRow()` | `derive-mock-handlers.ts` | `<T>(tableName, dto) → Promise<MockResult<T>>` |
| `updateRow()` | `derive-mock-handlers.ts` | `<T>(tableName, id, dto) → Promise<MockResult<T>>` |
| `deleteRow()` | `derive-mock-handlers.ts` | `(tableName, id) → Promise<MockResult<void>>` |
| `parseSearchParams()` | `derive-mock-handlers.ts` | `(requestUrl) → ParsedSearchParams` |
| `mapRow()` / `mapRows()` | `sql/row-mapping.ts` | snake_case → camelCase 변환 |
| `buildSetClause()` | `sql/query-building.ts` | `<T>(input, startIndex?) → SetClauseResult` |

*(+ `mapPgError`, `executeSql`, `tableExists`, `columnExists`, `addColumnIfNotExists`)*

### 4.4 `@simplix-react/i18n` (7 functions)

| Function | File | Signature |
| --- | --- | --- |
| `createI18nConfig()` | `create-i18n-config.ts` | `(options) → I18nConfigResult` |
| `buildModuleTranslations()` | `module-translations.ts` | `(options) → ModuleTranslations` |
| `I18nProvider()` | `react/i18n-provider.tsx` | `({ children, adapter }) → Element` |
| `useTranslation()` | `react/use-translation.ts` | `<TKeys>(namespace) → UseTranslationReturn` |
| `useLocale()` | `react/use-translation.ts` | `() → string` |
| `useI18n()` | `react/use-translation.ts` | `() → II18nAdapter \| null` |
| `useI18nAdapter()` | `react/i18n-provider.tsx` | `() → II18nAdapter \| null` |

### 4.5 `@simplix-react/testing` (4 functions)

| Function | File | Signature |
| --- | --- | --- |
| `createTestQueryClient()` | `test-query-client.ts` | `() → QueryClient` |
| `createTestWrapper()` | `test-wrapper.ts` | `(options?) → React wrapper component` |
| `waitForQuery()` | `wait-for-query.ts` | `(queryClient, queryKey, options?) → Promise` |
| `createMockClient()` | `mock-client.ts` | `<TEntities>(contract) → mocked client` |

### 4.6 `@simplix-react/cli` (주요 함수)

| Function | File | Purpose |
| --- | --- | --- |
| `defineConfig()` | `config/define-config.ts` | `simplix.config.ts` 타입 헬퍼 |
| `loadConfig()` | `config/config-loader.ts` | 설정 파일 로드 |
| `getDefaultConfig()` | `config/config-loader.ts` | 기본 설정값 |
| `frameworkVersion()` | `versions.ts` | 프레임워크 버전 조회 |
| `frameworkRange()` | `versions.ts` | 프레임워크 버전 범위 |
| `depVersion()` | `versions.ts` | 소비자 의존성 버전 조회 |
| `withVersions()` | `versions.ts` | 템플릿 컨텍스트에 버전 주입 |
| `generateDomainPackage()` | `commands/openapi.ts` | OpenAPI → 도메인 패키지 생성 |
| `buildTemplateContext()` | `commands/openapi.ts` | 템플릿 변수 구성 |
| `groupEntitiesByDomain()` | `openapi/domain-splitter.ts` | 태그 기반 도메인 분할 |
| `buildEntity()` | `openapi/entity-extractor.ts` | OpenAPI → entity 추출 |
| `computeDiff()` | `openapi/diff-engine.ts` | 스키마 변경 감지 |

---

## 5. TSDoc Coverage

| Package | Symbols | Documented | Coverage |
| --- | --- | --- | --- |
| `testing` | 54 | 54 | **100.0%** |
| `react` | 143 | 143 | **100.0%** |
| `i18n` | 608 | 605 | **99.5%** |
| `cli` | 971 | 933 | **96.1%** |
| `mock` | 274 | 260 | **94.9%** |
| `contract` | 361 | 333 | **92.2%** |

All packages exceed 90% documentation coverage.

---

## 6. Complexity Hotspots

Files ranked by symbol density (definitions per file):

| Rank | File | Symbols |
| --- | --- | --- |
| 1 | `packages/i18n/src/i18next-adapter.ts` | 26 |
| 2 | `packages/cli/src/openapi/types.ts` | 18 |
| 3 | `packages/cli/src/openapi/entity-extractor.ts` | 16 |
| 4 | `packages/mock/src/derive-mock-handlers.ts` | 14 |
| 5 | `packages/react/src/derive-hooks.ts` | 12 |
| 6 | `packages/i18n/src/types.ts` | 12 |
| 7 | `packages/contract/src/types.ts` | 11 |
| 8 | `packages/react/src/types.ts` | 10 |
| 9 | `packages/cli/src/validators/i18n-rules.ts` | 9 |
| 10 | `packages/cli/src/commands/i18n-codegen.ts` | 8 |

---

## 7. External Dependencies

Symbols referencing external npm packages:

| Dependency | Symbol References |
| --- | --- |
| `i18next` | 196 |
| `vitest` | 35 |
| `@tanstack/*` (react-query, router) | 34 |
| `msw` | 24 |
| `zod` | 21 |
| `react` | 16 |
| `commander` | 13 |
| `handlebars` | 7 |
| `@electric-sql/pglite` | 5 |

---

## 8. Cross-Package Dependencies

```
contract ──→ cli (templates reference contract types)
react    ──→ cli (templates reference react exports)
mock     ──→ cli (templates reference mock exports)
i18n     ──→ cli (templates reference i18n exports)
testing  ──→ cli (templates reference testing exports)
```

The CLI package acts as the orchestration hub, referencing all other packages
in its code generation templates. Framework packages (`contract`, `react`,
`mock`, `i18n`, `testing`) are **independent** of each other at the symbol level,
following the "define once, derive everything" architecture:

```
contract  →  react   (deriveHooks uses ApiContract)
contract  →  mock    (deriveMockHandlers uses ApiContractConfig)
contract  →  testing (createMockClient uses EntityDefinition)
```

---

## 9. Architecture Derivation Chain

```
defineApi()           @simplix-react/contract
    │
    ├── .client       → deriveClient()        (auto-generated CRUD clients)
    ├── .queryKeys    → deriveQueryKeys()      (React Query key factories)
    └── .config       → ApiContractConfig
            │
            ├── deriveHooks(contract)          @simplix-react/react
            │     └── EntityHooks { useList, useGet, useCreate, useUpdate, useDelete }
            │
            └── deriveMockHandlers(config)     @simplix-react/mock
                  └── HttpHandler[] (MSW handlers with PGlite backend)
```

---

## 10. Test Coverage Gaps

| Package | Test Files | Src Files | Coverage |
| --- | --- | --- | --- |
| `cli` | 2 | 37 | ⚠ Low — only validators and openapi-codegen tested |
| `contract` | 2 | 10 | ◐ Moderate — derive and helpers tested |
| `mock` | 1 | 9 | ⚠ Low — only sql-utils tested |
| `i18n` | 0 | 11 | ● No tests |
| `react` | 0 | 3 | ● No tests |
| `testing` | 0 | 5 | ● No tests (utility package) |

**Recommendation:** Priority testing targets:

1. `@simplix-react/react` — `deriveHooks()` is the primary consumer-facing API
2. `@simplix-react/i18n` — `I18nextAdapter` has 26 symbols (highest complexity)
3. `@simplix-react/mock` — `deriveMockHandlers()` has complex SQL generation logic

---

## 11. Package Size Distribution

```
CLI        ████████████████████████████████████████████████  4,891 LOC (52.3%)
i18n       ████████████                                      1,248 LOC (13.3%)
mock       ███████████                                       1,201 LOC (12.8%)
contract   ██████████                                        1,089 LOC (11.6%)
react      ██████                                              690 LOC  (7.4%)
testing    ██                                                  234 LOC  (2.5%)
                                                      Total: 9,353 LOC
```

---

## Appendix: Index Generation

```bash
# 1. Generate SCIP index
npx @sourcegraph/scip-typescript index --pnpm-workspaces

# 2. Convert to SQLite
scip expt-convert --output index.db index.scip

# 3. View stats
scip stats index.scip
```
