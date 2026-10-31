import { describe, expect, it } from "vitest";
import { crudDetailSectionBodyStyle } from "../../crud/detail/crud-detail.style";

// The section body draws each value as a flex row, so the value's text is a flex item sized by
// its min-content width. `overflow-wrap: break-word` does not lower that width; `anywhere` does.
// Without it a value with no break opportunity runs past the detail's edge.
describe("crudDetailSectionBodyStyle", () => {
  const base = crudDetailSectionBodyStyle.base;
  it("breaks an unbreakable value anywhere inside its flex row", () => {
    expect(base).toContain("[&_[data-slot=field-detail-value]]:flex");
    expect(base).toContain("[&_[data-slot=field-detail-value]]:wrap-anywhere");
    expect(base).not.toContain("[&_[data-slot=field-detail-value]]:break-words");
  });
});
