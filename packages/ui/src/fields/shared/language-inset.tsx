import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { slotAttributes } from "../../design/slot-style";
import { languageInsetAnchorStyle, languageInsetStyle } from "./language-selector.style";

/** Space kept between the selector and the text it sits beside, in pixels. */
const INSET_GAP = 8;

/** The control kinds a language selector can sit inside. */
export type LanguageInsetControl = "input" | "textarea";

interface LanguageInsetProps {
  control: LanguageInsetControl;
  /** The language selector to draw inside the control. */
  selector: ReactNode;
  /**
   * Renders the control. `reserve` is the padding that keeps the text clear of the selector,
   * measured from the selector's own box; merge it into the control's `style`.
   */
  children: (reserve: CSSProperties) => ReactNode;
}

/**
 * Draws a field's control with its language selector inside it, and reserves the room the
 * selector takes so the text never runs under it.
 *
 * <p>The reserve is `padding-inline-end`, a logical property, so the
 * selector and the room kept for it both follow the writing direction.
 */
export function LanguageInset({ control, selector, children }: LanguageInsetProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [width, setSize] = useState(0);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const measure = () => {
      setSize(anchor.getBoundingClientRect().width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  // Before the first measurement the reserve is left out rather than guessed.
  // A textarea keeps the same inline-end reserve as an input: its padding scrolls with the text,
  // so a block-end reserve alone would let a scrolled line pass under the selector.
  const reserve: CSSProperties = width === 0 ? {} : { paddingInlineEnd: width + INSET_GAP };

  return (
    // raw layout: positioning context for the absolutely placed selector; no primitive is one.
    <div className="relative min-w-0" {...slotAttributes(languageInsetStyle, { control })}>
      {children(reserve)}
      {/* raw layout: absolutely placed inside the control's box. */}
      <div
        ref={anchorRef}
        className="absolute"
        {...slotAttributes(languageInsetAnchorStyle, { control })}
      >
        {selector}
      </div>
    </div>
  );
}
