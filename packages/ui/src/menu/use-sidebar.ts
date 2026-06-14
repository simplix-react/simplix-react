import { useState, useCallback } from 'react'

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((v) => !v), [])
  return {
    collapsed,
    setCollapsed,
    toggle,
    state: collapsed ? 'collapsed' : 'expanded' as const,
    isOpen: !collapsed,
  }
}
