
import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { cn } from '../../../utils/cn'

export function BulletedListElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement as="ul" className={cn('list-disc pl-6 my-2', className)} {...props} />
  )
}

export function NumberedListElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement as="ol" className={cn('list-decimal pl-6 my-2', className)} {...props} />
  )
}

export function ListItemElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement as="li" className={cn('my-1', className)} {...props} />
  )
}

export function ListItemContentElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement as="div" className={cn('', className)} {...props} />
  )
}
