// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { toHex6, hideGridRect } from "../../base/charts/apexcharts/use-chart-theme";

describe("toHex6", () => {
  it("returns 7-char hex from full hex", () => {
    expect(toHex6("#ff0000")).toBe("#ff0000");
  });

  it("strips alpha from 9-char hex", () => {
    expect(toHex6("#ff0000ff")).toBe("#ff0000");
  });

  it("converts rgb() string to hex", () => {
    expect(toHex6("rgb(255, 0, 0)")).toBe("#ff0000");
  });

  it("converts rgba() string to hex", () => {
    expect(toHex6("rgba(0, 128, 255, 0.5)")).toBe("#0080ff");
  });

  it("returns input unchanged if not parseable", () => {
    expect(toHex6("oklch(0.5 0.2 120)")).toBe("oklch(0.5 0.2 120)");
  });
});

describe("hideGridRect", () => {
  it("sets stroke=none on gridRect element", () => {
    const rect = document.createElement("rect");
    rect.classList.add("apexcharts-gridRect");
    const container = document.createElement("div");
    container.appendChild(rect);

    const fakeChart = { el: container } as unknown as ApexCharts;
    hideGridRect(fakeChart);

    expect(rect.getAttribute("stroke")).toBe("none");
  });

  it("does nothing when gridRect is not found", () => {
    const container = document.createElement("div");
    const fakeChart = { el: container } as unknown as ApexCharts;
    // Should not throw
    hideGridRect(fakeChart);
  });

  it("does nothing when el is undefined", () => {
    const fakeChart = {} as unknown as ApexCharts;
    hideGridRect(fakeChart);
  });
});
