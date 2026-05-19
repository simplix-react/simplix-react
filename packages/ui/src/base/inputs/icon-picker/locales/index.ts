import en from './en.json'
import ko from './ko.json'
import ja from './ja.json'

// Base locale type for icon picker
export interface IconPickerLocale {
  triggerPlaceholder: string
  noIconsFound: string
  randomIcons: string
  iconsCount: string
  iconsInCategory: string
  selectCategory: string
  clear: string
  categories: Record<string, string>
}

export const iconPickerLocales: Record<string, IconPickerLocale> = {
  en: en as IconPickerLocale,
  ko: ko as IconPickerLocale,
  ja: ja as IconPickerLocale,
}

// Get locale with fallback to English
export function getIconPickerLocale(lang: string): IconPickerLocale {
  // Handle language codes like 'ko-KR' -> 'ko'
  const shortLang = lang.split('-')[0]
  return iconPickerLocales[shortLang] || iconPickerLocales.en
}

// Get translated category name
export function getCategoryName(
  locale: IconPickerLocale,
  category: string
): string {
  const categories = locale.categories as Record<string, string>
  return categories[category] || category
}

// Interpolate template strings like "{{count}} icons"
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    String(values[key] ?? '')
  )
}
