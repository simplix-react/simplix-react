// Main editor components
export { PlateEditorBasic } from './plate-editor-basic'
export { PlateEditorStandard } from './plate-editor-standard'
export { PlateEditorAdvanced } from './plate-editor-advanced'

// Types
export type {
  PlateEditorBaseProps,
  PlateEditorBasicProps,
  PlateEditorStandardProps,
  PlateEditorAdvancedProps,
  MentionItem,
  Value,
} from './types'
export { EMPTY_EDITOR_VALUE, DEFAULT_IMAGE_CONFIG } from './types'

// Components (for custom composition)
export * from './components'

// Plugins (for custom composition)
export * from './plugins'

// Helpers (Plate value <-> JSON conversion + emptiness probe + i18n filled languages)
export {
  isPlateEditorEmpty,
  convertPlateI18nToJson,
  parsePlateI18nFromJson,
  getFilledLanguagesFromPlateI18n,
} from '../shared/plate-editor-helpers'
export { getFilledLanguages } from '../shared/filled-languages'
