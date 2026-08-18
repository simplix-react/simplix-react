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
   * <p><b>`"dialog"` is deliberately not one of these.</b> A centred modal capped at `max-w-2xl`
   * is a different claim — that the record is a short interruption rather than the thing being
   * worked on — and a screen that wants it says so on its own `variant`. An installation-wide
   * switch between a panel and a drawer never turns a working surface into an interruption.
   */
  detailPresentation: "panel" | "drawer";
}

/** What a product gets when it declares nothing. */
export const UI_DEFAULTS: UIDefaults = {
  actionVariant: "icon",
  detailPresentation: "panel",
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
