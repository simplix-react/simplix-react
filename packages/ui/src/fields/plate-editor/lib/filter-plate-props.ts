/**
 * Filter out Plate.js internal props that shouldn't be passed to DOM elements
 * These props are used internally by Plate.js for state management
 *
 * IMPORTANT: nodeProps contains injected styles (like textAlign, fontSize, color)
 * and must be merged into the final props
 */
export function filterPlateProps(props: Record<string, unknown>) {
  const {
    // Plate.js internal props to filter out
    setOption: _setOption,
    setOptions: _setOptions,
    getOption: _getOption,
    getOptions: _getOptions,
    element: _element,
    editor: _editor,
    nodeProps,
    attributes: _attributes,
    // Additional internal props that may be passed
    api: _api,
    tf: _tf,
    ...domProps
  } = props

  // Merge nodeProps (contains injected styles like textAlign, fontSize, color)
  if (typeof nodeProps === 'object' && nodeProps !== null && 'style' in nodeProps) {
    const nodeStyle = (nodeProps as { style?: Record<string, unknown> }).style
    domProps.style = { ...(domProps.style as Record<string, unknown>), ...nodeStyle }
  }

  return domProps
}
