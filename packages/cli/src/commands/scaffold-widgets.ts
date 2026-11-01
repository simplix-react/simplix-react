import {
  detailTemplate,
  featureIndexTemplate,
  formTemplate,
  listTemplate,
  treeTemplate,
} from "../templates/ui/index.js";
import { templateFor, type ProjectTemplates } from "../utils/project-templates.js";
import { renderTemplate } from "../utils/template.js";

/** The operations an entity offers that decide which widgets are generated for it. */
export interface WidgetOperations {
  readonly hasList: boolean;
  readonly hasCreate: boolean;
  readonly hasUpdate: boolean;
  readonly hasGet: boolean;
}

/**
 * Renders the widget files of one entity, each from the project's own template where the project
 * has written one (`.simplix/templates/<name>.hbs`) and from the bundled template otherwise.
 *
 * <p>The names are the bundled ones: `list`, `tree`, `form`, `detail` and `feature-index`. A
 * project takes over the widgets it composes differently and leaves the rest to fall through.
 */
export function renderWidgetFiles(
  ops: WidgetOperations,
  hasTree: boolean,
  ctx: Record<string, unknown>,
  templates: ProjectTemplates,
): Record<string, string> {
  const files: Record<string, string> = {};
  if (hasTree) {
    files["tree.tsx"] = renderTemplate(templateFor(templates, "tree", treeTemplate), ctx);
  } else if (ops.hasList) {
    files["list.tsx"] = renderTemplate(templateFor(templates, "list", listTemplate), ctx);
  }
  if (ops.hasCreate || ops.hasUpdate) {
    files["form.tsx"] = renderTemplate(templateFor(templates, "form", formTemplate), ctx);
  }
  if (ops.hasGet) {
    files["detail.tsx"] = renderTemplate(templateFor(templates, "detail", detailTemplate), ctx);
  }
  files["index.ts"] = renderTemplate(templateFor(templates, "feature-index", featureIndexTemplate), ctx);
  return files;
}

/**
 * The hand-written companions of the widgets just rendered: `<widget>.blocks.tsx` for each widget
 * whose template in force has a `<widget>.blocks` sibling. They are tracked like the widgets: a
 * template carrying the generated marker is stamped, rewritten while untouched and merged once edited.
 */
export function renderWidgetBlocks(
  widgets: Readonly<Record<string, string>>,
  ctx: Record<string, unknown>,
  templates: ProjectTemplates,
): Record<string, string> {
  const blocks: Record<string, string> = {};
  for (const file of Object.keys(widgets)) {
    const name = file.replace(/\.tsx$/, "");
    const source = templates.get(`${name}.blocks`);
    if (source !== undefined) blocks[`${name}.blocks.tsx`] = renderTemplate(source, ctx);
  }
  return blocks;
}
