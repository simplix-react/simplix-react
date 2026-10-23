import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { slotAttributes } from '../../../design/slot-style'
import { plateHorizontalRuleLineStyle, plateHorizontalRuleStyle } from './horizontal-rule-node.style'

/**
 * Horizontal rule element component
 * Note: Uses a div with border styling instead of <hr> to avoid React 19 void element issues
 */
export function HorizontalRuleElement({ className, children, ...props }: PlateElementProps) {
  return (
    <PlateElement className={className} {...props} attributes={{ ...props.attributes, ...slotAttributes(plateHorizontalRuleStyle, {}) }}>
      <div
        className="h-px w-full"
        contentEditable={false}
        {...slotAttributes(plateHorizontalRuleLineStyle, {})}
      />
      {children}
    </PlateElement>
  )
}
