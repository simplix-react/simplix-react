import type { CellContext, ColumnDef, ColumnDefTemplate, HeaderContext } from "@tanstack/react-table";
import type { ReactNode } from "react";

interface DeclaredRenderers {
  cell: ColumnDefTemplate<CellContext<unknown, unknown>> | undefined;
  header: ColumnDefTemplate<HeaderContext<unknown, unknown>> | undefined;
}

/**
 * The renderers each column set was declared with, by column id.
 *
 * <p>Keyed by the column array handed to the table, which is the array the table reports back as
 * `table.options.columns` while it renders. A cell therefore reads the renderers of the very
 * column set its own row was built from, never those of a render React threw away.
 */
const declaredRenderers = new WeakMap<readonly unknown[], Map<string, DeclaredRenderers>>();

function renderTemplate<C extends object>(template: ColumnDefTemplate<C> | undefined, ctx: C): ReactNode {
  return typeof template === "function" ? (template(ctx) as ReactNode) : (template ?? null);
}

function ColumnCell(ctx: CellContext<unknown, unknown>): ReactNode {
  const declared = declaredRenderers.get(ctx.table.options.columns)!.get(ctx.column.id)!;
  return renderTemplate(declared.cell, ctx);
}

function ColumnHeader(ctx: HeaderContext<unknown, unknown>): ReactNode {
  const declared = declaredRenderers.get(ctx.table.options.columns)!.get(ctx.column.id)!;
  return renderTemplate(declared.header, ctx);
}

/**
 * Gives every column a cell and a header whose component type outlives the render.
 *
 * <p>`flexRender` treats a function as a component type. A table that rebuilds its columns from
 * `children` hands it a new function on every parent render, so React unmounts the whole cell and
 * mounts a replacement: a button inside the cell is swapped out between the press and the release
 * and the click never lands, and hover and focus drop with it. The columns here carry one shared
 * cell and one shared header component instead, and each looks up what its column declared in the
 * current render. The output is what the declared function returns, so every render still shows
 * the latest values; only the mount survives.
 *
 * <p>A cell or header is still mounted afresh when its column id changes or the column goes away,
 * because the table keys its cells and headers by column id. A string template, or a column that
 * declares none, is left as declared.
 *
 * @param columns the columns as declared in this render; every one carries an `id`
 * @returns the same columns, rendering through stable components
 */
export function stabilizeColumnRenderers<T>(columns: ColumnDef<T, unknown>[]): ColumnDef<T, unknown>[] {
  const renderers = new Map<string, DeclaredRenderers>();
  const stable = columns.map((column): ColumnDef<T, unknown> => {
    renderers.set(column.id!, { cell: column.cell, header: column.header } as DeclaredRenderers);
    return {
      ...column,
      ...(typeof column.cell === "function" ? { cell: ColumnCell } : {}),
      ...(typeof column.header === "function" ? { header: ColumnHeader } : {}),
    } as ColumnDef<T, unknown>;
  });
  declaredRenderers.set(stable, renderers);
  return stable;
}
