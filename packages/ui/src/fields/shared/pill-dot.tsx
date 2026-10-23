import { slotAttributes } from "../../design/slot-style";
import { pillDotStyle } from "./pill-dot.style";

/** Small dot separator between constraint pills (mirrors original .fa-cdot). */
export function PillDot() {
  return (
    <span
      className="inline-block h-[3px] w-[3px] shrink-0"
      aria-hidden="true"
      {...slotAttributes(pillDotStyle, {})}
    />
  );
}
