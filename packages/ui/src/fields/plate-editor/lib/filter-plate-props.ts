/**
 * Filter out Plate.js internal props that shouldn't be passed to DOM elements
 * These props are used internally by Plate.js for state management
 *
 * IMPORTANT: nodeProps contains injected styles (like textAlign, fontSize, color)
 * and must be merged into the final props
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterPlateProps(props: Record<string, any>) {
  const {
    // Plate.js internal props to filter out
    setOption,
    setOptions,
    getOption,
    getOptions,
    element,
    editor,
    nodeProps,
    attributes,
    // Additional internal props that may be passed
    api,
    tf,
    ...domProps
  } = props

  // Merge nodeProps (contains injected styles like textAlign, fontSize, color)
  if (nodeProps?.style) {
    domProps.style = { ...domProps.style, ...nodeProps.style }
  }

  return domProps
}
