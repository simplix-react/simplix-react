import { describe, expect, it } from "vitest";

import { renderWidgetFiles } from "../commands/scaffold-widgets.js";
import {
  detailTemplate,
  featureIndexTemplate,
  formTemplate,
  listTemplate,
  treeTemplate,
} from "../templates/ui/index.js";
import { renderTemplate } from "../utils/template.js";

const ALL = { hasList: true, hasCreate: true, hasUpdate: true, hasGet: true };
const ctx = { entityName: "widget", EntityName: "Widget", entityPascal: "Widget", fields: [] };

const bundled = (template: string) => renderTemplate(template, ctx);

describe("widget templates a project takes over", () => {
  it.each([
    ["list", "list.tsx", false],
    ["tree", "tree.tsx", true],
    ["form", "form.tsx", false],
    ["detail", "detail.tsx", false],
    ["feature-index", "index.ts", false],
  ] as const)("renders %s from the project's template", (name, file, hasTree) => {
    const templates = new Map([[name, `project ${name} for {{EntityName}}`]]);
    const files = renderWidgetFiles(ALL, hasTree, ctx, templates);
    expect(files[file]).toBe(`project ${name} for Widget`);
  });

  it("falls back to the bundled template for every widget the project has not written", () => {
    const templates = new Map([["list", "project list"]]);
    const files = renderWidgetFiles(ALL, false, ctx, templates);
    expect(files["list.tsx"]).toBe("project list");
    expect(files["form.tsx"]).toBe(bundled(formTemplate));
    expect(files["detail.tsx"]).toBe(bundled(detailTemplate));
    expect(files["index.ts"]).toBe(bundled(featureIndexTemplate));
  });

  it("renders the bundled list and tree when the project has no templates", () => {
    expect(renderWidgetFiles(ALL, false, ctx, new Map())["list.tsx"]).toBe(bundled(listTemplate));
    expect(renderWidgetFiles(ALL, true, ctx, new Map())["tree.tsx"]).toBe(bundled(treeTemplate));
  });
});
