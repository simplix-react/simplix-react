import type { ReactNode } from "react";

/**
 * Renders a table header or cell by calling its renderer, never by mounting it.
 *
 * <p>`flexRender` from `@tanstack/react-table` mounts a function renderer as a component
 * (`createElement(renderer, ctx)`). A table that rebuilds its column definitions on a render
 * therefore hands React a new component type for every header and cell, and React unmounts the
 * old subtree and mounts a new one — every cell, every header, every row-action cell with its
 * tooltip, on every render. Called as a function, a renderer's result is reconciled in place, so a
 * new closure costs nothing but the call.
 *
 * <p>The renderer runs during the table's own render, so it must not call hooks. A cell that needs
 * state returns a component element instead; that component keeps its identity and its state.
 *
 * @param slot the column's `header` or `cell` — a string, a renderer, or nothing
 * @param ctx the header or cell context tanstack hands the renderer
 * @returns what the header or cell renders
 */
export function renderColumnSlot<C>(slot: string | ((ctx: C) => unknown) | undefined, ctx: C): ReactNode {
  return (typeof slot === "function" ? slot(ctx) : slot) as ReactNode;
}
