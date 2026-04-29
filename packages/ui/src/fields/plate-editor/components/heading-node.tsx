
import type { PlateElementProps } from 'platejs/react'
import { PlateElement } from 'platejs/react'
import { cn } from '../../../utils/cn'

export function H1Element({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="h1"
      className={cn('text-2xl font-bold mb-4 mt-6 first:mt-0', className)}
      {...props}
    />
  )
}

export function H2Element({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="h2"
      className={cn('text-xl font-semibold mb-3 mt-5 first:mt-0', className)}
      {...props}
    />
  )
}

export function H3Element({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="h3"
      className={cn('text-lg font-semibold mb-2 mt-4 first:mt-0', className)}
      {...props}
    />
  )
}
