# `@simplix-react/ui` 컨슈머 스타일/토큰 셋업 가이드

이 문서는 다른 프로젝트에서 `@simplix-react/ui`를 의존성으로 추가해 컴포넌트를 사용할 때, **컨슈머 측에서 무엇을 정의해야 하는지**를 정리한 레퍼런스입니다.

## 한 줄 요약

이 패키지는 CSS 파일을 거의 배포하지 않습니다. 컴포넌트 className이 참조하는 **디자인 토큰(CSS 변수)과 Tailwind 설정은 컨슈머가 직접 제공**해야 하며, 패키지가 배포하는 CSS는 테이블 스크롤바 보정용 한 개뿐입니다.

---

## 1. 패키지가 실제로 배포하는 스타일 파일 (단 1개)

| 파일 | 내용 | 사용 시점 |
|---|---|---|
| `@simplix-react/ui/styles.css` (소스: `packages/ui/src/styles.css` → 빌드 시 `dist/styles.css`로 그대로 복사) | `[data-slot="table-container"]`의 cross-browser 스크롤바 보정 ~30줄 | `Table` 계열을 쓰면 필요. 그 외엔 선택 |

내부에서 `var(--muted)`, `var(--border)`를 참조하므로 컨슈머가 토큰을 정의하지 않으면 transparent로 그려집니다.

빌드 설정 근거: `packages/ui/tsup.config.ts` → `onSuccess: "cp src/styles.css dist/styles.css"`

---

## 2. 컨슈머가 정의해야 하는 CSS 변수 (디자인 토큰)

컴포넌트 className에서 `bg-background`, `text-muted-foreground`, `border-input`, `bg-primary/10` 같은 Tailwind 유틸리티를 사용하므로, Tailwind v4 `@theme` 블록에서 아래 변수들이 정의돼 있어야 합니다.

증명 위치:
- `packages/ui/src/base/inputs/textarea.tsx:12` — `border-input bg-background placeholder:text-muted-foreground aria-[invalid=true]:border-destructive`
- `packages/ui/src/base/inputs/icon-picker.tsx:319-337` — `bg-primary/10 text-primary bg-muted`

### 2-1. 색상 토큰 (페어 사용)

| 토큰 | 페어 | 어디서 쓰이는가 |
|---|---|---|
| `--background` | `--foreground` | 전역 body, 모든 surface |
| `--card` | `--card-foreground` | `Card`, `CrudDetail` 섹션 |
| `--popover` | `--popover-foreground` | `Popover`, `DropdownMenu`, `Select`, `Tooltip` 콘텐츠 |
| `--primary` | `--primary-foreground` | `Button`(default), 활성 상태, 링 강조 |
| `--secondary` | `--secondary-foreground` | `Button`(secondary), 보조 강조 |
| `--muted` | `--muted-foreground` | 비활성 텍스트, hover surface, placeholder |
| `--accent` | `--accent-foreground` | Hover/Focus surface, 메뉴 아이템 |
| `--destructive` | `--destructive-foreground` | 삭제 버튼, 에러, `aria-invalid` |
| `--warning` | — | 알림/경고 |
| `--info` | — | 정보 알림 |
| `--border` | — | 모든 분리선, input/카드 테두리 |
| `--input` | — | `Input`, `Textarea` 테두리 (보통 `--border`와 동일) |
| `--ring` | — | focus-visible 링 |

### 2-2. 차트 토큰 (`base/charts/`가 사용)

`--chart-1` ~ `--chart-5`

### 2-3. 사이드바 토큰 (Optional — 레이아웃/메뉴 컴포넌트가 사용)

`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`

### 2-4. 모서리 반경

`--radius` (베이스) → `--radius-sm | --radius-md | --radius-lg | --radius-xl`이 `calc()`로 자동 파생됨

### 2-5. 폰트 패밀리

- `--font-sans` — 본문 (Tailwind `font-sans`)
- `--font-display` — 헤딩 강조 (Tailwind `font-display`)
- `--font-mono` — 코드 (Tailwind `font-mono`)
- `--font-title` — 일부 헤딩이 직접 참조 (Optional)

---

## 3. Tailwind 설정 요구사항

이 패키지는 **Tailwind CSS v4** (catalog 기준 `^4.2.1`) 전제입니다. 컨슈머 빌드 측에서 다음이 필요합니다.

1. `@tailwindcss/vite` 플러그인을 `vite.config.ts`에 추가
2. 컨슈머 entry CSS에서:
   - `@import "tailwindcss";`
   - **`@source "../node_modules/@simplix-react/ui/dist/**/*.js";`** — 빠뜨리면 컴포넌트 클래스가 트리쉐이크돼서 스타일이 사라짐
   - `@theme { ... }` 블록에 위 토큰들 정의

CLI가 생성하는 starter가 정확히 이 모양입니다: `packages/cli/src/templates/project/app/index-css.hbs`

---

## 4. 다크모드 / 멀티 컬러 테마

- **다크모드**: `<html>` 또는 wrapper에 `.dark` 클래스 토글 → `.dark { ... }` 블록의 토큰 override
- **컬러 스킴 스왑**: `data-color-theme="blue"` 같은 attribute selector로 토큰 재정의
- **레퍼런스 구현 6종**: `apps/storybook/src/themes/{default,blue,green,rose,orange,violet}.css`

이 6개 파일이 가장 완전한 토큰 정의 예시이므로, 컨슈머가 만들 `index.css`의 출발점으로 그대로 복사해서 쓸 수 있습니다.

---

## 5. i18n 사이드이펙트 (의도된 side-effect import)

`@simplix-react/ui`를 import만 해도 `src/locales/index.ts`가 실행돼서 `@simplix-react/i18n`의 모듈 레지스트리에 `simplix` namespace(en/ko/ja)가 자동 등록됩니다.

- `package.json`의 `sideEffects`가 이 파일들을 보존하도록 설정돼 있음
- **import 순서 중요**: `createI18nConfig()` **호출 전에** `@simplix-react/ui`를 import해야 함 (`apps/storybook/.storybook/preview.tsx:11` 코멘트 참조)

---

## 6. 컨슈머 최소 셋업 (실전 체크리스트)

```bash
pnpm add @simplix-react/ui @simplix-react/i18n @simplix-react/form @simplix-react/react \
         @tanstack/react-query react react-dom
pnpm add -D tailwindcss@^4.2 @tailwindcss/vite
```

`vite.config.ts`:
```ts
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`src/index.css`:
```css
@import "tailwindcss";
@source "../node_modules/@simplix-react/ui/dist/**/*.js";
@source "./**/*.tsx";

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  /* ... apps/storybook/src/themes/default.css 의 모든 토큰을 복사 */
}
.dark { /* dark override */ }

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... 모든 --color-* 별칭 매핑 */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply m-0 font-sans antialiased text-foreground bg-background; }
}
```

`src/main.tsx`:
```ts
import "./index.css";
import "@simplix-react/ui";              // i18n side-effect를 먼저
import "@simplix-react/ui/styles.css";   // Table 쓰면 필수
// 그 다음 createI18nConfig(), createRoot 등
```

App 루트:
```tsx
<UIProvider>
  <CrudProvider router={createReactRouterAdapter({ useNavigate, useSearchParams, useLocation })}>
    <App />
  </CrudProvider>
</UIProvider>
```

---

## 7. 파일 위치 인덱스 (트러블슈팅용)

| 파일 | 역할 |
|---|---|
| `packages/ui/src/styles.css` | 패키지가 배포하는 **유일한** CSS (스크롤바 보정) |
| `packages/ui/tsup.config.ts` | CSS를 가공 없이 `dist/styles.css`로 복사 |
| `packages/ui/src/index.ts` | 외부 노출 surface (모든 컴포넌트/훅/타입 export) |
| `packages/ui/src/locales/{en,ko,ja}.json` | 패키지 내장 번역 |
| `packages/ui/src/locales/index.ts` | i18n 모듈 자동 등록 (side-effect) |
| `apps/storybook/src/index.css` | Tailwind import + `@source` + `@layer base` 레퍼런스 |
| `apps/storybook/src/themes/default.css` | `:root` + `.dark` + `@theme inline` 완전 예시 (115줄) — 컨슈머가 복사할 베이스 |
| `apps/storybook/src/themes/{blue,green,rose,orange,violet}.css` | `data-color-theme="..."` 멀티 테마 패턴 |
| `apps/storybook/.storybook/preview.tsx` | import 순서 + 테마 토글 데모 |
| `packages/cli/src/templates/project/app/index-css.hbs` | CLI 생성 starter (production 최소 토큰 셋) |
| `packages/cli/src/templates/project/app/vite-config.hbs` | Vite + Tailwind v4 플러그인 셋업 |
| `packages/cli/src/templates/project/app/main-tsx.hbs` | entry import 순서 |
| `packages/ui/README.md:148` | UIProvider 오버라이드 등 5단계 커스터마이징 가이드 |