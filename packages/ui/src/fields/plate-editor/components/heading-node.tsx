import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { slotAttributes } from '../../../design/slot-style'
import { plateHeadingStyle } from './heading-node.style'

export function H1Element({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="h1"
      className={className}
      {...props}
      attributes={{ ...props.attributes, ...slotAttributes(plateHeadingStyle, { level: '1' }) }}
    />
  )
}

export function H2Element({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="h2"
      className={className}
      {...props}
      attributes={{ ...props.attributes, ...slotAttributes(plateHeadingStyle, { level: '2' }) }}
    />
  )
}

export function H3Element({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="h3"
      className={className}
      {...props}
      attributes={{ ...props.attributes, ...slotAttributes(plateHeadingStyle, { level: '3' }) }}
    />
  )
}
