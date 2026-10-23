// Chart abstraction layer
export { ChartProvider, useChartAdapter } from "./chart-provider";
export type { ChartProviderProps } from "./chart-provider";

// Chart types
export type {
  BaseChartProps,
  ChartAdapter,
  ChartCategory,
  ChartSeries,
  PieChartData,
  HeatmapCell,
  HeatmapSeries,
  LineChartProps,
  AreaChartProps,
  BarChartProps,
  PieChartProps,
  DonutChartProps,
  HeatmapChartProps,
} from "./types";

// ApexCharts adapter
export { apexChartsAdapter } from "./apexcharts";

// StatCard
export { StatCard } from "./stat-card";
export type { StatCardProps } from "./stat-card";

// Hand-drawn plots
export { StackedColumnChart } from "./stacked-column-chart";
export type { StackedColumnChartProps, StackedColumnSeries } from "./stacked-column-chart";
export { TrendLineChart } from "./trend-line-chart";
export type { TrendLineChartProps, TrendLineSeries } from "./trend-line-chart";
export { PlotSwatch, PlotTooltipRow } from "./plot-parts";
export type { PlotFill } from "./plot-parts";
