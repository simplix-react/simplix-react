import { lazy } from "react";

import type { PlateEditorBasic } from "../plate-editor/plate-editor-basic";

/**
 * Lazily-loaded Plate editor presets shared by {@link PlateEditorField} and
 * {@link PlateEditorI18nField}. The Plate editor stack (plugins, lowlight
 * grammars, slate runtime) is by far the heaviest dependency of the field
 * namespace, so the presets are code-split: forms without a rich-text field
 * never fetch it.
 */
export type PlateEditorPresetComponent = typeof PlateEditorBasic;

export const LAZY_PRESET_BY_VARIANT = {
  basic: lazy(() =>
    import("../plate-editor/plate-editor-basic").then((m) => ({ default: m.PlateEditorBasic })),
  ),
  standard: lazy(() =>
    import("../plate-editor/plate-editor-standard").then((m) => ({
      default: m.PlateEditorStandard,
    })),
  ),
  advanced: lazy(() =>
    import("../plate-editor/plate-editor-advanced").then((m) => ({
      default: m.PlateEditorAdvanced,
    })),
  ),
} as const;
