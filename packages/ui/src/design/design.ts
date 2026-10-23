import type { UIDefaults } from "../provider/ui-defaults-context";

/**
 * A design: how every slot looks, and the structural choices that look implies.
 *
 * <p>Behaviour is the same in every design. What a design changes is drawn by its stylesheet
 * (`theme/designs/<id>.css`), which styles the slots components mark with `data-slot`, and by the
 * {@link UIDefaults} it brings, for the choices a stylesheet cannot make because the markup
 * differs (a detail beside the list or over it, a list as rows or as cards).
 *
 * <p>The design is an installation's choice. It is set once on the root {@link UIProvider}, which
 * writes `data-design` on the document element; a stylesheet scoped below the root would miss
 * every dialog, popover and toast, which render into `document.body`.
 */
export interface Design {
  /** The `data-design` value; `classic` is also what applies when no design is set. */
  id: string;
  /** Prop defaults this design implies; the provider's own `defaults` still win over them. */
  defaults?: Partial<UIDefaults>;
}

/** The framework's original look. Applies when no design is set. */
export const CLASSIC_DESIGN: Design = { id: "classic" };

/**
 * A light, quiet look: hairline borders on a near-white canvas, one accent that marks where the
 * reader is and what they can press, hierarchy from type weight and spacing. Drawn by
 * `theme/designs/clarity.css`; it sets rows a step looser than classic.
 */
export const CLARITY_DESIGN: Design = { id: "clarity", defaults: { density: "comfortable" } };

/** Every design this package draws, for a picker. */
export const DESIGNS: readonly Design[] = [CLASSIC_DESIGN, CLARITY_DESIGN];
