import { createContext, useContext } from "react";

import type { ActionVariant } from "../crud/shared/row-actions";

/**
 * Prop defaults a product sets once for its whole console.
 *
 * <p><b>Why a channel rather than a better default.</b> Some choices are genuinely the product's
 * and not the framework's — how dense a row action should read depends on how often the people
 * using it open the console at all. The framework keeps a defensible default; a product that
 * wants another one says so in one place instead of in every screen, and a screen that forgets
 * to say it is then impossible rather than merely unlikely.
 */
export interface UIDefaults {
  /**
   * How a list or tree row draws its action cluster when the screen does not say.
   *
   * <p>`"icon"` is the framework's own default: a compact strip that costs the least width and
   * asks the reader to know what each glyph means. A console whose readers open it rarely wants
   * `"ghost"`, where the label rides beside the icon.
   */
  actionVariant: ActionVariant;
}

/** What a product gets when it declares nothing. */
export const UI_DEFAULTS: UIDefaults = {
  actionVariant: "icon",
};

export const UIDefaultsContext = createContext<UIDefaults>(UI_DEFAULTS);

/**
 * The prop defaults in force here.
 *
 * @returns the nearest {@link UIProvider}'s defaults, merged over the framework's own
 */
export function useUIDefaults(): UIDefaults {
  return useContext(UIDefaultsContext);
}
