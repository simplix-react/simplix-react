import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { slotAttributes } from '../../../design/slot-style'
import { plateListItemStyle, plateListStyle } from './list-node.style'

export function BulletedListElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="ul"
      className={className}
      {...props}
      attributes={{ ...props.attributes, ...slotAttributes(plateListStyle, { kind: 'bulleted' }) }}
    />
  )
}

export function NumberedListElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="ol"
      className={className}
      {...props}
      attributes={{ ...props.attributes, ...slotAttributes(plateListStyle, { kind: 'numbered' }) }}
    />
  )
}

export function ListItemElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement as="li" className={className} {...props} attributes={{ ...props.attributes, ...slotAttributes(plateListItemStyle, {}) }} />
  )
}

export function ListItemContentElement({ className, ...props }: PlateElementProps) {
  return <PlateElement as="div" className={className} {...props} />
}
