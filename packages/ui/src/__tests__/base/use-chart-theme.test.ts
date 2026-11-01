import { describe, expect, it } from "vitest";

import { cssColorOf } from "../../base/charts/apexcharts/use-chart-theme";

describe("cssColorOf", () => {
  it("wraps only a bare HSL triple", () => {
    expect(cssColorOf("240 10% 3.9%")).toBe("hsl(240 10% 3.9%)");
    expect(cssColorOf("0 0% 100% / 50%")).toBe("hsl(0 0% 100% / 50%)");
  });
  it("keeps a hex value, a colour function and a keyword as they are", () => {
    expect(cssColorOf("#f4f7f7")).toBe("#f4f7f7");
    expect(cssColorOf("oklch(0.98 0 0)")).toBe("oklch(0.98 0 0)");
    expect(cssColorOf("rgb(1 2 3)")).toBe("rgb(1 2 3)");
    expect(cssColorOf("white")).toBe("white");
  });
});
