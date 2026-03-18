// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock react-apexcharts: renders a div with the chart type as a data attribute
vi.mock("react-apexcharts", () => ({
  default: (props: { type: string; height: number; series: unknown; options: unknown }) => (
    <div data-testid="apex-chart" data-type={props.type} data-height={props.height}>
      ApexChart
    </div>
  ),
}));

// Mock useChartTheme to return stable values
vi.mock("../../base/charts/apexcharts/use-chart-theme", () => ({
  useChartTheme: () => ({
    foreground: "#09090b",
    mutedForeground: "#71717a",
    border: "#e4e4e7",
    borderLight: "rgba(0,0,0,0.12)",
    background: "#ffffff",
    fontFamily: "inherit",
    tooltipTheme: "light" as const,
  }),
  hideGridRect: vi.fn(),
  toHex6: (c: string) => c,
}));

import { ApexAreaChart } from "../../base/charts/apexcharts/area-chart";
import { ApexBarChart } from "../../base/charts/apexcharts/bar-chart";
import { ApexDonutChart } from "../../base/charts/apexcharts/donut-chart";
import { ApexHeatmapChart } from "../../base/charts/apexcharts/heatmap-chart";
import { ApexLineChart } from "../../base/charts/apexcharts/line-chart";
import { ApexPieChart } from "../../base/charts/apexcharts/pie-chart";

afterEach(cleanup);

const sampleSeries = [{ name: "A", data: [10, 20, 30], color: "#3b82f6" }];
const sampleCategories = ["Jan", "Feb", "Mar"];

// ── AreaChart ──

describe("ApexAreaChart", () => {
  it("renders chart with data", () => {
    render(<ApexAreaChart series={sampleSeries} categories={sampleCategories} />);
    const chart = screen.getByTestId("apex-chart");
    expect(chart.getAttribute("data-type")).toBe("area");
  });

  it("renders 'No data' when series is empty", () => {
    render(<ApexAreaChart series={[]} categories={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("renders 'No data' when all series data is empty", () => {
    render(<ApexAreaChart series={[{ name: "A", data: [] }]} categories={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("applies custom height", () => {
    render(<ApexAreaChart series={sampleSeries} categories={sampleCategories} height={200} />);
    const chart = screen.getByTestId("apex-chart");
    expect(chart.getAttribute("data-height")).toBe("200");
  });

  it("applies className", () => {
    const { container } = render(
      <ApexAreaChart series={sampleSeries} categories={sampleCategories} className="my-chart" />,
    );
    expect(container.firstElementChild!.className).toContain("my-chart");
  });

  it("accepts curve and stacked props without error", () => {
    render(
      <ApexAreaChart
        series={sampleSeries}
        categories={sampleCategories}
        curve="straight"
        stacked
        gradient={false}
      />,
    );
    expect(screen.getByTestId("apex-chart")).toBeDefined();
  });
});

// ── BarChart ──

describe("ApexBarChart", () => {
  it("renders chart with data", () => {
    render(<ApexBarChart series={sampleSeries} categories={sampleCategories} />);
    const chart = screen.getByTestId("apex-chart");
    expect(chart.getAttribute("data-type")).toBe("bar");
  });

  it("renders 'No data' when series is empty", () => {
    render(<ApexBarChart series={[]} categories={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("accepts horizontal and stacked props", () => {
    render(
      <ApexBarChart
        series={sampleSeries}
        categories={sampleCategories}
        horizontal
        stacked
      />,
    );
    expect(screen.getByTestId("apex-chart")).toBeDefined();
  });

  it("applies className", () => {
    const { container } = render(
      <ApexBarChart series={sampleSeries} categories={sampleCategories} className="bar-cls" />,
    );
    expect(container.firstElementChild!.className).toContain("bar-cls");
  });
});

// ── LineChart ──

describe("ApexLineChart", () => {
  it("renders chart with data", () => {
    render(<ApexLineChart series={sampleSeries} categories={sampleCategories} />);
    const chart = screen.getByTestId("apex-chart");
    expect(chart.getAttribute("data-type")).toBe("line");
  });

  it("renders 'No data' when series is empty", () => {
    render(<ApexLineChart series={[]} categories={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("accepts curve and strokeWidth props", () => {
    render(
      <ApexLineChart
        series={sampleSeries}
        categories={sampleCategories}
        curve="stepline"
        strokeWidth={3}
      />,
    );
    expect(screen.getByTestId("apex-chart")).toBeDefined();
  });
});

// ── PieChart ──

describe("ApexPieChart", () => {
  it("renders chart with data", () => {
    render(<ApexPieChart labels={["A", "B"]} series={[10, 20]} />);
    const chart = screen.getByTestId("apex-chart");
    expect(chart.getAttribute("data-type")).toBe("pie");
  });

  it("renders 'No data' when all values are zero", () => {
    render(<ApexPieChart labels={["A"]} series={[0]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("renders 'No data' when series is empty", () => {
    render(<ApexPieChart labels={[]} series={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("accepts colors prop", () => {
    render(<ApexPieChart labels={["A"]} series={[10]} colors={["#ff0000"]} />);
    expect(screen.getByTestId("apex-chart")).toBeDefined();
  });
});

// ── DonutChart ──

describe("ApexDonutChart", () => {
  it("renders chart with data", () => {
    render(<ApexDonutChart labels={["A", "B"]} series={[10, 20]} />);
    const chart = screen.getByTestId("apex-chart");
    expect(chart.getAttribute("data-type")).toBe("donut");
  });

  it("renders 'No data' when all values are zero", () => {
    render(<ApexDonutChart labels={["A"]} series={[0]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("accepts centerLabel prop", () => {
    render(<ApexDonutChart labels={["A"]} series={[10]} centerLabel="Total" />);
    expect(screen.getByTestId("apex-chart")).toBeDefined();
  });

  it("accepts colors prop", () => {
    render(<ApexDonutChart labels={["A"]} series={[10]} colors={["#ff0000"]} />);
    expect(screen.getByTestId("apex-chart")).toBeDefined();
  });
});

// ── HeatmapChart ──

describe("ApexHeatmapChart", () => {
  const heatmapSeries = [
    { name: "Row1", data: [{ x: "A", y: 10 }, { x: "B", y: 20 }] },
  ];

  it("renders chart with data", () => {
    render(<ApexHeatmapChart series={heatmapSeries} />);
    const chart = screen.getByTestId("apex-chart");
    expect(chart.getAttribute("data-type")).toBe("heatmap");
  });

  it("renders 'No data' when series is empty", () => {
    render(<ApexHeatmapChart series={[]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("renders 'No data' when all series data is empty", () => {
    render(<ApexHeatmapChart series={[{ name: "Row", data: [] }]} />);
    expect(screen.getByText("No data")).toBeDefined();
  });

  it("accepts colors prop", () => {
    render(<ApexHeatmapChart series={heatmapSeries} colors={["#ff0000", "#00ff00"]} />);
    expect(screen.getByTestId("apex-chart")).toBeDefined();
  });

  it("applies className", () => {
    const { container } = render(
      <ApexHeatmapChart series={heatmapSeries} className="heat-cls" />,
    );
    expect(container.firstElementChild!.className).toContain("heat-cls");
  });
});
