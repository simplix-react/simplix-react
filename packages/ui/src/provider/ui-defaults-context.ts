import { createContext, useContext } from "react";

import type { ActionVariant } from "../crud/shared/row-actions";
import type { LanguageSelectorPlacement } from "../fields/shared/language-selector";

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
  /**
   * How a list screen opens the record a reader picked, when the screen does not say.
   *
   * <p>`"panel"` is the framework's own default and what every screen has drawn until now: the
   * detail takes a column beside the list, with a draggable divider between them. `"drawer"` slides
   * it in from the right edge over the full height instead, leaving the list at its full width
   * underneath.
   *
   * <p><b>This is an installation's choice, not a screen's.</b> The two show the same detail, with
   * the same content, opened by the same act and closed back to the same list — what differs is
   * where it appears, which is a matter of how wide the operators' monitors are and how they like
   * to work. A screen that hardcodes one takes that choice away from every installation, which is
   * why it belongs here.
   *
   * <p>`"dialog"` opens the record as a centred modal capped at `max-w-2xl`: the record reads as a
   * short interruption rather than the thing being worked on, so it suits an installation whose
   * records are brief. A screen can still choose its own presentation on `variant`.
   */
  detailPresentation: "panel" | "drawer" | "dialog";
  /**
   * How tightly tables and lists set their rows when the screen does not say.
   *
   * <p>An installation's choice for the same reason as {@link UIDefaults.detailPresentation}: it
   * follows the operators' monitors and how much they read at once, and a design may bring its own
   * default (a quieter design breathes more).
   */
  density: "compact" | "default" | "comfortable";
  /**
   * How a record list draws its rows when the screen does not say.
   *
   * <p>`"auto"` draws a table while its columns fit and cards once the list is narrower than its
   * columns need; `"table"` and `"cards"` hold one shape at every width.
   */
  listPresentation: "auto" | "table" | "cards";
  /**
   * Where an i18n text field or textarea draws its language selector when the field does not say.
   *
   * <p>`"label"` is the framework's own default: the selector sits beside the label, above the
   * control. `"inset"` draws it inside the control, at the inline end of an input and in the
   * bottom inline-end corner of a textarea, with the text kept clear of it. A form-wide look,
   * so an installation picks it once at its root; a field can still set its own.
   */
  languageSelectorPlacement: LanguageSelectorPlacement;
}

/** What a product gets when it declares nothing. */
export const UI_DEFAULTS: UIDefaults = {
  actionVariant: "icon",
  detailPresentation: "panel",
  density: "default",
  listPresentation: "auto",
  languageSelectorPlacement: "label",
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
