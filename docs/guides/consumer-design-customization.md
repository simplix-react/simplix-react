# `@simplix-react/ui` 디자인 커스터마이징 가이드

이 문서는 `@simplix-react/ui`를 컨슈머 프로젝트에서 사용하면서 **디자인을 어떻게 변경할 수 있는지**를 정리합니다. 변경 범위에 따라 복사할 파일과 방법이 다릅니다.

관련 문서: [`consumer-styling-setup.md`](./consumer-styling-setup.md) — 최초 셋업 및 디자인 토큰 레퍼런스

---

## 목차

- [디자인 변경 — 어떤 파일을 복사해서 수정?](#디자인-변경--어떤-파일을-복사해서-수정)
  - [1. 색·폰트·radius만 바꾸고 싶다 (90% 케이스)](#1-색폰트radius만-바꾸고-싶다-90-케이스)
  - [2. 컬러 팔레트를 여러 개 두고 토글하고 싶다](#2-컬러-팔레트를-여러-개-두고-토글하고-싶다)
  - [3. 특정 컴포넌트 1개만 다르게 보이고 싶다](#3-특정-컴포넌트-1개만-다르게-보이고-싶다-예-button만-기업-스타일로)
  - [4. 특정 인스턴스 1곳만 살짝 다르게](#4-특정-인스턴스-1곳만-살짝-다르게)
  - [5. 테이블 스크롤바를 내 스타일로 바꾸고 싶다](#5-테이블-스크롤바를-내-스타일로-바꾸고-싶다)
  - [6. 컴포넌트 구조 자체를 바꾸고 싶다](#6-컴포넌트-구조-자체를-바꾸고-싶다-레이아웃동작-변경)
- [요약 결정 트리](#요약-결정-트리)
- [default.css에 포함된 것들](#defaultcss에-포함된-것들)
  - [Radius 정의](#radius-정의)
  - [default.css 전체 구성](#defaultcss-전체-구성)
- [테마 적용 단계별 가이드](#테마-적용-단계별-가이드)
  - [시나리오 A: 브랜드 컬러 하나로 통일 (가장 흔함)](#시나리오-a-브랜드-컬러-하나로-통일-가장-흔함)
  - [시나리오 B: 사용자가 테마를 골라 쓰는 멀티 테마](#시나리오-b-사용자가-테마를-골라-쓰는-멀티-테마)
  - [시나리오 C: 시스템 다크모드 자동 감지](#시나리오-c-시스템-다크모드-자동-감지)
  - [핵심 정리](#핵심-정리)
- [테마 셀렉트 동작 원리 (Storybook 예시 분석)](#테마-셀렉트-동작-원리-storybook-예시-분석)
  - [작동 원리 한 줄](#작동-원리-한-줄)
  - [Storybook의 구조 (3개 부분)](#storybook의-구조-3개-부분)
  - [동작 흐름](#동작-흐름)
  - [메커니즘 매핑](#메커니즘-매핑)

---

## 디자인 변경 — 어떤 파일을 복사해서 수정?

### 1. 색·폰트·radius만 바꾸고 싶다 (90% 케이스)

**복사**: `apps/storybook/src/themes/default.css` → 컨슈머의 `src/index.css` (또는 별도 `src/theme.css`)

**수정**:
- `:root { --primary, --background, --foreground, ... }` 값만 바꾸기
- 폰트 바꾸려면 `@theme inline { --font-sans, --font-display, --font-mono }`
- 둥글기는 `--radius` 한 값만 바꾸면 `--radius-sm/md/lg/xl` 자동 파생
- 다크모드 변형은 `.dark { ... }` 블록도 같이

이 한 파일만 고치면 **모든 Button, Input, Card, Badge 등이 자동 반영**됩니다 (컴포넌트 코드 안 건드림).

### 2. 컬러 팔레트를 여러 개 두고 토글하고 싶다

**복사**: `apps/storybook/src/themes/blue.css` (또는 green/rose/orange/violet 중 가까운 것)

**수정**:
- 셀렉터 이름 바꾸기: `[data-color-theme='blue']` → `[data-color-theme='mybrand']`
- 토큰 값 교체
- 컨슈머 앱에서 `<html data-color-theme="mybrand">` 토글

### 3. 특정 컴포넌트 1개만 다르게 보이고 싶다 (예: Button만 기업 스타일로)

**복사 안 함**. UIProvider 오버라이드 사용:

```tsx
import { UIProvider } from "@simplix-react/ui";
import { MyButton } from "./my-button";

<UIProvider overrides={{ Button: MyButton }}>
  <App />
</UIProvider>
```

오버라이드 가능 항목: `Input`, `Textarea`, `Label`, `Switch`, `Checkbox`, `Badge`, `Calendar`, `Select`, `RadioGroup` (`packages/ui/README.md:797`)

`Button`처럼 위 리스트에 없는 컴포넌트는 **오버라이드가 불가능하므로 4번 방식으로** 가야 합니다.

### 4. 특정 인스턴스 1곳만 살짝 다르게

**아무것도 복사 안 함**. `className` prop으로 덮기:

```tsx
<Button className="bg-emerald-600 hover:bg-emerald-700">저장</Button>
```

`cn()` 유틸이 `tailwind-merge`로 충돌 클래스를 자동 정리.

### 5. 테이블 스크롤바를 내 스타일로 바꾸고 싶다

**복사**: `packages/ui/src/styles.css` (30줄) → 컨슈머 프로젝트로

**수정 후**:
- `import "@simplix-react/ui/styles.css"` 줄 **삭제**
- 대신 컨슈머 버전을 import

### 6. 컴포넌트 구조 자체를 바꾸고 싶다 (레이아웃·동작 변경)

**복사 안 함**. 두 방법:
- (a) UIProvider 오버라이드로 통째로 교체 (오버라이드 가능 컴포넌트만)
- (b) 그 컴포넌트는 simplix를 안 쓰고 직접 작성

소스를 fork하는 건 비추 — 이 패키지는 자주 업데이트되고 fork는 머지 비용이 큽니다.

---

## 요약 결정 트리

| 원하는 것 | 복사할 파일 | 수정 위치 |
|---|---|---|
| 전체 톤·컬러·폰트 | `apps/storybook/src/themes/default.css` | 토큰 값 |
| 멀티 컬러 테마 | `apps/storybook/src/themes/blue.css` | 셀렉터 + 토큰 |
| 한 컴포넌트 통째 교체 | (복사 X) | `<UIProvider overrides={{ ... }}>` |
| 인스턴스 한 곳 | (복사 X) | `className` prop |
| 테이블 스크롤바 | `packages/ui/src/styles.css` | 컨슈머에 복사 후 import 교체 |

대부분의 경우는 **1번 (default.css 복사·수정)만으로 끝납니다.**

---

## default.css에 포함된 것들

`apps/storybook/src/themes/default.css` 한 파일에 **디자인 시스템 전부 (115줄)**가 들어있습니다.

### Radius 정의

**`:root` 안 (3번 라인)**:
```css
--radius: 0.625rem;
```

**`@theme inline` 안 (76-79번 라인) — 자동 파생**:
```css
--radius-sm: calc(var(--radius) - 4px);   /* 6px */
--radius-md: calc(var(--radius) - 2px);   /* 8px */
--radius-lg: var(--radius);               /* 10px */
--radius-xl: calc(var(--radius) + 4px);   /* 14px */
```

즉 **`--radius` 한 값만 바꾸면** `rounded-sm/md/lg/xl` 유틸리티가 전부 비례해서 따라옵니다. 4개를 따로 정의할 필요 없음.

### default.css 전체 구성

| 카테고리 | 정의 위치 |
|---|---|
| 색상 토큰 페어 (background, primary, muted, destructive, border 등 전체) | `:root` (4-24번 라인) |
| 차트 컬러 `--chart-1` ~ `--chart-5` | `:root` (25-29번 라인) |
| 사이드바 토큰 8종 | `:root` (31-38번 라인) |
| 다크모드 오버라이드 (모든 색 + 차트) | `.dark { ... }` (41-68번 라인) |
| **`--radius` 베이스 + sm/md/lg/xl 파생** | `:root` + `@theme inline` |
| 폰트 패밀리 4종 (`--font-sans`, `--font-display`, `--font-title`, `--font-mono`) | `@theme inline` (71-74번 라인) |
| Tailwind `--color-*` 별칭 매핑 (전체) | `@theme inline` (80-113번 라인) |

이 파일 **115줄에 디자인 시스템 전부**가 들어있어서, 그대로 복사해서 값만 고치면 됩니다.

---

## 테마 적용 단계별 가이드

컨슈머 프로젝트에서 simplix-react 컴포넌트에 테마를 입히는 전체 흐름입니다.

### 시나리오 A: 브랜드 컬러 하나로 통일 (가장 흔함)

#### Step 1. 테마 파일 복사

```bash
mkdir -p src/styles
cp /path/to/simplix-react/apps/storybook/src/themes/default.css \
   src/styles/theme.css
```

#### Step 2. 토큰 값 수정 (`src/styles/theme.css`)

```css
:root {
  --radius: 0.5rem;                          /* 모서리 둥글기 */
  --primary: oklch(0.55 0.22 240);           /* 브랜드 파랑 */
  --primary-foreground: oklch(0.98 0 0);     /* primary 위의 글자색 */
  --ring: oklch(0.55 0.22 240);              /* focus 링도 같이 */
  /* 나머지는 그대로 두면 됨 */
}

.dark {
  --primary: oklch(0.65 0.20 240);           /* 다크모드용 살짝 밝게 */
  /* ... */
}
```

#### Step 3. entry CSS에서 import (`src/index.css`)

```css
@import "tailwindcss";
@source "../node_modules/@simplix-react/ui/dist/**/*.js";
@source "./**/*.tsx";

@import "./styles/theme.css";    /* ← 이 한 줄 */

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply m-0 font-sans antialiased text-foreground bg-background; }
}
```

#### Step 4. main.tsx

```ts
import "./index.css";
import "@simplix-react/ui";
import "@simplix-react/ui/styles.css";
```

**끝.** Button, Input, Card 등 모든 컴포넌트가 자동으로 브랜드 컬러 반영. attribute 토글도 필요 없음.

---

### 시나리오 B: 사용자가 테마를 골라 쓰는 멀티 테마

#### Step 1. 테마 파일들 복사

```bash
mkdir -p src/styles/themes
cp /path/to/simplix-react/apps/storybook/src/themes/default.css src/styles/themes/
cp /path/to/simplix-react/apps/storybook/src/themes/blue.css    src/styles/themes/
cp /path/to/simplix-react/apps/storybook/src/themes/green.css   src/styles/themes/
cp /path/to/simplix-react/apps/storybook/src/themes/rose.css    src/styles/themes/
```

#### Step 2. 전부 import (`src/index.css`)

```css
@import "tailwindcss";
@source "../node_modules/@simplix-react/ui/dist/**/*.js";
@source "./**/*.tsx";

@import "./styles/themes/default.css";    /* :root — 항상 활성 (베이스) */
@import "./styles/themes/blue.css";       /* [data-color-theme='blue'] — 대기 */
@import "./styles/themes/green.css";      /* [data-color-theme='green'] — 대기 */
@import "./styles/themes/rose.css";       /* [data-color-theme='rose'] — 대기 */
```

#### Step 3. 테마 토글 훅 (`src/hooks/use-theme.ts`)

```ts
import { useEffect, useState } from "react";

type Theme = "default" | "blue" | "green" | "rose";
type Mode = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "default"
  );
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem("mode") as Mode) || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.colorTheme = theme;
    root.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", theme);
    localStorage.setItem("mode", mode);
  }, [theme, mode]);

  return { theme, setTheme, mode, setMode };
}
```

#### Step 4. 셀렉트 UI (`src/components/theme-switcher.tsx`)

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@simplix-react/ui";
import { useTheme } from "../hooks/use-theme";

export function ThemeSwitcher() {
  const { theme, setTheme, mode, setMode } = useTheme();

  return (
    <div className="flex gap-2">
      <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="blue">Blue</SelectItem>
          <SelectItem value="green">Green</SelectItem>
          <SelectItem value="rose">Rose</SelectItem>
        </SelectContent>
      </Select>

      <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>
        {mode === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}
```

#### Step 5. 어디든 배치

```tsx
function App() {
  return (
    <UIProvider>
      <header>
        <ThemeSwitcher />     {/* 사용자가 여기서 선택 */}
      </header>
      <main>
        {/* 모든 컴포넌트가 선택된 테마/모드 따라 색 전환 */}
      </main>
    </UIProvider>
  );
}
```

---

### 시나리오 C: 시스템 다크모드 자동 감지

`useTheme` 훅에서 OS 설정 따라가게:

```ts
useEffect(() => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    document.documentElement.classList.toggle("dark", mq.matches);
  };
  apply();
  mq.addEventListener("change", apply);
  return () => mq.removeEventListener("change", apply);
}, []);
```

---

### 핵심 정리

| 원하는 것 | 필요한 작업 |
|---|---|
| 단일 브랜드 컬러 | `:root` 토큰만 덮어쓰기 → 자동 |
| 멀티 테마 셀렉트 | import + `data-color-theme` 토글 |
| 다크/라이트 토글 | `<html>` 에 `.dark` 클래스 토글 |
| 사용자 선택 저장 | `localStorage` + `useEffect` |
| 부분 트리만 다른 테마 | 그 wrapper에 `data-color-theme` 부착 |

**모든 시나리오에서 simplix-react 컴포넌트 코드는 절대 안 건드립니다.** CSS 변수 한 번 셋업하면 그 이후엔 attribute 토글만으로 끝.

---

## 테마 셀렉트 동작 원리 (Storybook 예시 분석)

Storybook의 테마 셀렉트 UI가 어떻게 작동하는지 — 일반 React 앱에서도 동일한 패턴을 쓸 수 있습니다. 참고 파일: `apps/storybook/.storybook/preview.tsx`

### 작동 원리 한 줄

state → DOM attribute → CSS 캐스케이드 → 토큰 → Tailwind → 화면

React state가 바뀌면 DOM attribute가 바뀌고, 그 뒤는 **순수 CSS 메커니즘**으로 동작합니다. 컴포넌트는 자기가 무슨 색인지 알지도 못하고 그냥 `bg-primary`만 적어둡니다.

### Storybook의 구조 (3개 부분)

#### ① 셀렉트 메뉴 정의 (47-63번 라인)

```ts
globalTypes: {
  colorTheme: {
    description: "Color theme",
    toolbar: {
      title: "Theme",
      icon: "paintbrush",
      items: [
        { value: "default", title: "Default" },
        { value: "blue",    title: "Blue" },
        { value: "green",   title: "Green" },
        { value: "rose",    title: "Rose" },
        { value: "orange",  title: "Orange" },
        { value: "violet",  title: "Violet" },
      ],
      dynamicTitle: true,
    },
  },
}
```

`value`가 곧 `data-color-theme` 값이 될 문자열.

#### ② 초기값 (90-94번 라인)

```ts
initialGlobals: {
  colorTheme: "default",
  mode: "light",
  locale: "en",
}
```

#### ③ 데코레이터 — 매 렌더마다 attribute를 다시 그림 (96-118번 라인)

```tsx
decorators: [
  (Story, context) => {
    const colorTheme = context.globals.colorTheme || "default";
    const mode = context.globals.mode || "light";

    return (
      <div
        data-color-theme={colorTheme}
        className={mode === "dark" ? "dark bg-background text-foreground" : "bg-background text-foreground"}
      >
        <Story />
      </div>
    );
  },
]
```

### 동작 흐름

1. 사용자가 툴바에서 "Blue" 선택
2. Storybook이 `context.globals.colorTheme = "blue"` 로 업데이트하고 데코레이터를 **재실행**
3. 데코레이터가 `<div data-color-theme="blue">`로 다시 렌더
4. 브라우저가 CSS 캐스케이드 재평가 → `[data-color-theme='blue']` 셀렉터가 매칭됨 → `--primary` 등 토큰이 파랑 값으로 교체
5. `bg-primary`, `text-primary` 등 `var(--primary)`를 읽는 모든 Tailwind 유틸리티가 즉시 새 색 표시

### 메커니즘 매핑

| Storybook 부분 | 역할 | 일반 React 등가물 |
|---|---|---|
| `globalTypes.colorTheme.items` | 셀렉트 메뉴의 옵션 목록 | `<SelectItem>` 들 |
| `context.globals.colorTheme` | 현재 선택된 값 (state) | `useState<Theme>()` |
| `<div data-color-theme={...}>` | 값을 DOM attribute로 바인딩 | `useEffect`로 `documentElement.dataset.colorTheme` 설정 |
| CSS의 `[data-color-theme='blue']` 셀렉터 | attribute가 매칭되면 발동 | 동일 |
| Tailwind `var(--primary)` | 토큰 값 변화에 자동 반응 | 동일 |