import { describe, expect, it } from "vitest";

import { compareFence } from "../commands/kit-fence.js";

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
