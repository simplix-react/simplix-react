// i18n configuration template files

export const i18nConfigTs = `import { createI18nConfig } from "@simplix-react/i18n";

// Import app-local translations via Vite's glob import
const appTranslations = import.meta.glob("/src/locales/**/*.json", { eager: true });

export const { adapter: i18nAdapter, i18nReady } = createI18nConfig({
  defaultLocale: "{{defaultLocale}}",
  fallbackLocale: "en",
  supportedLocales: {{{json locales}}},
  detection: { order: ["localStorage", "navigator"] },
  appTranslations,
  moduleTranslations: [],
});
`;

export const i18nConstantsTs = `export const SUPPORTED_LOCALES = {{{json locales}}} as const;
export const DEFAULT_LOCALE = "{{defaultLocale}}";
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
`;

export const commonEnJson = JSON.stringify(
  {
    app: {
      title: "My App",
      subtitle: "Built with simplix-react",
    },
    nav: {
      home: "Home",
      settings: "Settings",
    },
    actions: {
      create: "Create",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
    },
    messages: {
      loading: "Loading...",
      empty: "No items found.",
      error: "An error occurred",
    },
  },
  null,
  2,
);

export const commonKoJson = JSON.stringify(
  {
    app: {
      title: "My App",
      subtitle: "simplix-react로 구축됨",
    },
    nav: {
      home: "홈",
      settings: "설정",
    },
    actions: {
      create: "생성",
      save: "저장",
      cancel: "취소",
      delete: "삭제",
    },
    messages: {
      loading: "로딩 중...",
      empty: "항목이 없습니다.",
      error: "오류가 발생했습니다",
    },
  },
  null,
  2,
);

export const commonJaJson = JSON.stringify(
  {
    app: {
      title: "My App",
      subtitle: "simplix-reactで構築",
    },
    nav: {
      home: "ホーム",
      settings: "設定",
    },
    actions: {
      create: "作成",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
    },
    messages: {
      loading: "読み込み中...",
      empty: "アイテムが見つかりません。",
      error: "エラーが発生しました",
    },
  },
  null,
  2,
);
