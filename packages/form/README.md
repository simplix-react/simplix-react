# @simplix-react/form

TanStack Form hooks derived automatically from `@simplix-react/contract` schemas and `@simplix-react/react` hooks.

> **Prerequisites:** Requires a contract defined with `@simplix-react/contract` and hooks derived with `@simplix-react/react`.

## Installation

```bash
pnpm add @simplix-react/form @tanstack/react-form
```

**Peer dependencies:**

| Package | Version |
| --- | --- |
| `@simplix-react/contract` | workspace |
| `@simplix-react/react` | workspace |
| `@tanstack/react-form` | >= 1.0.0 |
| `@tanstack/react-query` | >= 5.0.0 |
| `react` | >= 18.0.0 |
| `zod` | >= 4.0.0 |

## Quick Example

```ts
import { defineApi } from "@simplix-react/contract";
import { deriveHooks } from "@simplix-react/react";
import { deriveFormHooks } from "@simplix-react/form";
import { z } from "zod";

// 1. Define the contract
const projectContract = defineApi({
  domain: "project",
  basePath: "/api",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string(), status: z.string() }),
      createSchema: z.object({ title: z.string(), status: z.string() }),
      updateSchema: z.object({ title: z.string().optional(), status: z.string().optional() }),
    },
  },
});

// 2. Derive React Query hooks
const hooks = deriveHooks(projectContract);

// 3. Derive form hooks — one call generates everything
const formHooks = deriveFormHooks(projectContract, hooks);

// 4. Use in components
function CreateTaskForm({ projectId }: { projectId: string }) {
  const { form, isSubmitting, submitError, reset } = formHooks.task.useCreateForm(projectId);

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="title">
        {(field) => <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}
      </form.Field>
      <button type="submit" disabled={isSubmitting}>Create</button>
      {submitError && <p>{submitError.message}</p>}
    </form>
  );
}
```

## API Overview

| Export | Kind | Description |
| --- | --- | --- |
| `deriveFormHooks` | Function | contract + hooks → entity form hooks 파생 |
| `extractDirtyFields` | Function | 변경된 필드만 추출 (PATCH 요청용) |
| `mapServerErrorsToForm` | Function | 422 서버 에러를 폼 필드 에러로 매핑 |
| `CreateFormOptions` | Type | `useCreateForm` 옵션 인터페이스 |
| `UpdateFormOptions` | Type | `useUpdateForm` 옵션 인터페이스 |
| `CreateFormReturn` | Type | `useCreateForm` 반환값 인터페이스 |
| `UpdateFormReturn` | Type | `useUpdateForm` 반환값 인터페이스 |
| `DerivedCreateFormHook` | Type | Create form hook 시그니처 |
| `DerivedUpdateFormHook` | Type | Update form hook 시그니처 |
| `EntityFormHooks` | Type | 단일 엔티티의 폼 hook 인터페이스 |

## Key Concepts

### Hook Derivation

`deriveFormHooks()`는 API contract의 엔티티 정의를 읽어 각 엔티티별로 `useCreateForm`과 `useUpdateForm` hook을 생성한다. 내부적으로 `@simplix-react/react`의 mutation hooks를 TanStack Form에 연결한다.

```ts
const formHooks = deriveFormHooks(projectContract, projectHooks);
// formHooks.task.useCreateForm  → create mutation + TanStack Form
// formHooks.task.useUpdateForm  → update mutation + TanStack Form + dirty tracking
```

### Auto Dirty-Field Extraction

`useUpdateForm`은 기본적으로 변경된 필드만 서버에 전송한다 (`dirtyOnly: true`). 원본 엔티티 데이터와 현재 폼 값을 비교하여 변경 사항만 추출하므로 PATCH-friendly한 요청을 자동으로 생성한다.

### Server Error Mapping

서버에서 422 Validation Error가 반환되면, `mapServerErrorsToForm`이 자동으로 필드별 에러 메시지를 폼에 설정한다. Rails 형식과 JSON:API 형식을 모두 지원한다.

## Hook Reference

### `useCreateForm`

새 엔티티를 생성하는 폼 hook. TanStack Form 인스턴스와 create mutation을 연결한다.

```ts
const { form, isSubmitting, submitError, reset } = formHooks.task.useCreateForm(parentId?, options?);
```

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `parentId` | `string?` | 상위 엔티티 ID (하위 엔티티인 경우) |
| `options.defaultValues` | `Partial<CreateSchema>?` | 폼 초기값 |
| `options.resetOnSuccess` | `boolean?` | 성공 시 폼 초기화 (default: `true`) |
| `options.onSuccess` | `(data) => void` | 성공 콜백 |
| `options.onError` | `(error) => void` | 에러 콜백 |

**Returns:**

| Property | Type | Description |
| --- | --- | --- |
| `form` | `AnyFormApi` | TanStack Form 인스턴스 |
| `isSubmitting` | `boolean` | 제출 진행 중 여부 |
| `submitError` | `Error \| null` | 마지막 제출 에러 |
| `reset` | `() => void` | 폼 및 에러 상태 초기화 |

### `useUpdateForm`

기존 엔티티를 수정하는 폼 hook. 엔티티 데이터를 자동 로드하고, 리페치 시 폼을 자동 리셋한다.

```ts
const { form, isLoading, isSubmitting, submitError, entity } = formHooks.task.useUpdateForm(entityId, options?);
```

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `entityId` | `string` | 수정할 엔티티 ID (필수) |
| `options.dirtyOnly` | `boolean?` | 변경된 필드만 전송 (default: `true`) |
| `options.onSuccess` | `(data) => void` | 성공 콜백 |
| `options.onError` | `(error) => void` | 에러 콜백 |

**Returns:**

| Property | Type | Description |
| --- | --- | --- |
| `form` | `AnyFormApi` | TanStack Form 인스턴스 |
| `isLoading` | `boolean` | 엔티티 데이터 로딩 중 여부 |
| `isSubmitting` | `boolean` | 제출 진행 중 여부 |
| `submitError` | `Error \| null` | 마지막 제출 에러 |
| `entity` | `Entity \| undefined` | 로드된 엔티티 데이터 |

## Utilities

### `extractDirtyFields(current, original)`

두 객체를 deep equality로 비교하여 변경된 필드만 추출한다. Date, 배열, 중첩 객체를 모두 지원한다.

```ts
import { extractDirtyFields } from "@simplix-react/form";

const dirty = extractDirtyFields(
  { name: "Updated", status: "active", priority: 1 },
  { name: "Original", status: "active", priority: 1 },
);
// → { name: "Updated" }
```

### `mapServerErrorsToForm(error, form)`

422 `ApiError`의 응답 본문을 파싱하여 TanStack Form 필드 에러로 매핑한다.

지원하는 에러 형식:

- **Rails:** `{ errors: { [field]: string[] } }`
- **JSON:API:** `{ errors: [{ field, message }] }`

```ts
import { mapServerErrorsToForm } from "@simplix-react/form";

// 수동 사용 (hook 내부에서 자동 호출됨)
try {
  await mutation.mutateAsync(data);
} catch (error) {
  mapServerErrorsToForm(error, form);
}
```

## CLI Integration

`@simplix-react/cli`의 OpenAPI 코드 생성 시 form hooks 파일이 자동 생성된다.

```bash
simplix openapi <spec-path>     # form-hooks.ts 포함 생성
simplix openapi <spec-path> --no-forms  # form hooks 생성 생략
```

## Related Packages

| Package | Description |
| --- | --- |
| `@simplix-react/contract` | Zod 기반 type-safe API contract 정의 |
| `@simplix-react/react` | contract에서 파생된 React Query hooks |
| `@simplix-react/mock` | MSW handlers + PGlite repositories 자동 생성 |

---

Next Step → `@simplix-react/mock`
