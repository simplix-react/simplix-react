import { describe, expect, it } from "vitest";

import { compareFence, compareFenceOverrides, writeFence } from "../commands/kit-fence.js";

const kit = [{ name: "@scope/ui", importNames: ["CrudList", "ListDetail"], message: "use the kit" }];

describe("kit fence", () => {
  it("agrees when the lint config refuses the same names in any order", () => {
    expect(compareFence(kit, [{ name: "@scope/ui", importNames: ["ListDetail", "CrudList"], message: "use the kit" }])).toEqual([]);
  });

  it("names a part the lint config lets through", () => {
    expect(compareFence(kit, [{ name: "@scope/ui", importNames: ["CrudList"], message: "use the kit" }])).toEqual(["lint lacks @scope/ui#ListDetail"]);
  });

  it("names a part the lint config refuses that the kit does not fence", () => {
    expect(compareFence(kit, [{ name: "@scope/ui", importNames: ["CrudList", "ListDetail", "Button"], message: "use the kit" }])).toEqual([
      "lint adds @scope/ui#Button, which the kit does not fence",
    ]);
  });

  it("refuses a lint config with no fence at all", () => {
    expect(compareFence(kit, [])).toEqual(["lint lacks @scope/ui#CrudList", "lint lacks @scope/ui#ListDetail"]);
  });
});

describe("a lint config that narrows imports per group", () => {
  const config = () => ({
    overrides: [
      { files: ["modules/**"], rules: { "no-restricted-imports": ["error", { paths: [kit[0]] }] } },
      { files: ["modules/admin/**"], rules: { "no-restricted-imports": ["error", { paths: [kit[0]], patterns: [{ group: ["**/portal/**"] }] }] } },
      { files: ["tests/**"], rules: { eqeqeq: "error" } },
    ],
  });
  const wider = [...kit, { name: "@scope/kit/layout", importNames: ["Tiles"], message: "the page draws it" }];

  it("writes the fence into every override holding the rule, keeping each one's patterns", () => {
    const lint = config();
    expect(writeFence(lint, wider)).toBe(2);
    const admin = lint.overrides[1]!.rules["no-restricted-imports"] as [string, { paths: unknown[]; patterns: unknown[] }];
    expect(admin[1].paths).toEqual(wider);
    expect(admin[1].patterns).toEqual([{ group: ["**/portal/**"] }]);
    expect(lint.overrides[2]!.rules).toEqual({ eqeqeq: "error" });
  });

  it("names a later override that lacks a fenced part, which the first one alone would hide", () => {
    const lint = config();
    (lint.overrides[0]!.rules["no-restricted-imports"] as [string, { paths: unknown[] }])[1].paths = wider;
    expect(compareFenceOverrides(lint, wider)).toEqual(["modules/admin/**: lint lacks @scope/kit/layout#Tiles"]);
  });

  it("agrees once every override carries the fence", () => {
    const lint = config();
    writeFence(lint, wider);
    expect(compareFenceOverrides(lint, wider)).toEqual([]);
  });
});
