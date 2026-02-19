export { default as i18nConfigTs } from "./i18n/config-ts.hbs";
export { default as i18nConstantsTs } from "./i18n/constants-ts.hbs";

const commonTranslations: Record<string, object> = {
  en: {
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
  ko: {
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
  ja: {
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
};

/**
 * Returns common translation JSON for a given locale.
 * Known locales (en, ko, ja) get starter content; others get an empty object.
 */
export function getCommonTranslationJson(locale: string): string {
  const content = commonTranslations[locale] ?? {};
  return JSON.stringify(content, null, 2);
}
