import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { slotAttributes } from "../../design/slot-style";
import {
  languageInsetAnchorStyle,
  languageInsetOverlayStyle,
  languageInsetStyle,
} from "./language-selector.style";

/** The gap kept between the text and the selector: two steps of the spacing scale. */
const INSET_GAP = "calc(var(--spacing) * 2)";

/** The control kinds a language selector can sit inside. */
export type LanguageInsetControl = "input" | "textarea";

interface LanguageInsetProps {
  control: LanguageInsetControl;
  /** The language selector to draw inside the control. */
  selector: ReactNode;
  /** The per-language fill bar drawn along the control's bottom edge. */
  bar?: ReactNode;
  /**
   * Renders the control. `reserve` is the padding that keeps the text clear of the selector,
   * measured from the selector's own box; merge it into the control's `style`.
   */
  children: (reserve: CSSProperties) => ReactNode;
}

/**
 * Draws a field's control with its language selector as the control's own inline-end segment
 * (an input) or column (a textarea), full height inside the border, and the fill bar along the
 * bottom edge across the control's whole width.
 *
 * <p>The selector and the bar sit on a layer laid over the control's padding box, so they follow
 * its border and corners. The text keeps clear of the selector through `padding-inline-end`, a
 * logical property, so both follow the writing direction.
 */
export function LanguageInset({ control, selector, bar, children }: LanguageInsetProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const measure = () => {
      setWidth(anchor.getBoundingClientRect().width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  // Before the first measurement the reserve is left out rather than guessed. The reserve is the
  // selector's width plus one spacing step, so the text keeps a token gap from the selector.
  const reserve: CSSProperties =
    width === 0 ? {} : { paddingInlineEnd: `calc(${width}px + ${INSET_GAP})` };

  return (
    // raw layout: positioning context for the layer laid over the control; no primitive is one.
    <div className="relative min-w-0" {...slotAttributes(languageInsetStyle, { control })}>
      {children(reserve)}
      {/* raw layout: absolutely laid over the control's padding box. */}
      <div className="absolute" {...slotAttributes(languageInsetOverlayStyle, {})}>
        {/* raw layout: the inline-end segment, absolutely placed inside the overlay. */}
        <div
          ref={anchorRef}
          className="absolute"
          {...slotAttributes(languageInsetAnchorStyle, { control })}
        >
          {selector}
        </div>
        {bar}
      </div>
    </div>
  );
}
