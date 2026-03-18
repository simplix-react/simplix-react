// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ChartProvider, useChartAdapter } from "../../base/charts/chart-provider";
import type { ChartAdapter } from "../../base/charts/types";

afterEach(cleanup);

const stubAdapter: ChartAdapter = {
  LineChart: () => <div>Line</div>,
  AreaChart: () => <div>Area</div>,
  BarChart: () => <div>Bar</div>,
  PieChart: () => <div>Pie</div>,
  DonutChart: () => <div>Donut</div>,
  HeatmapChart: () => <div>Heatmap</div>,
};

function Consumer() {
  const adapter = useChartAdapter();
  return <div data-testid="adapter">{adapter.LineChart.name || "ok"}</div>;
}

describe("ChartProvider", () => {
  it("provides adapter to children", () => {
    render(
      <ChartProvider adapter={stubAdapter}>
        <Consumer />
      </ChartProvider>,
    );
    expect(screen.getByTestId("adapter")).toBeDefined();
  });

  it("throws when useChartAdapter is used without provider", () => {
    expect(() => {
      render(<Consumer />);
    }).toThrow("useChartAdapter must be used within <ChartProvider>");
  });

  it("renders children", () => {
    render(
      <ChartProvider adapter={stubAdapter}>
        <span data-testid="child">hello</span>
      </ChartProvider>,
    );
    expect(screen.getByTestId("child").textContent).toBe("hello");
  });
});
