/** Common chart data interfaces — library-agnostic */

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartCategory {
  categories: string[];
}

export interface PieChartData {
  labels: string[];
  series: number[];
  colors?: string[];
}

export interface HeatmapCell {
  x: string;
  y: number;
}

export interface HeatmapSeries {
  name: string;
  data: HeatmapCell[];
}

export interface BaseChartProps {
  height?: number | string;
  className?: string;
}

export interface LineChartProps extends BaseChartProps {
  series: ChartSeries[];
  categories: string[];
  curve?: "smooth" | "straight" | "stepline";
  strokeWidth?: number;
}

export interface AreaChartProps extends BaseChartProps {
  series: ChartSeries[];
  categories: string[];
  curve?: "smooth" | "straight" | "stepline";
  stacked?: boolean;
  gradient?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  series: ChartSeries[];
  categories: string[];
  horizontal?: boolean;
  stacked?: boolean;
}

export interface PieChartProps extends BaseChartProps {
  labels: string[];
  series: number[];
  colors?: string[];
}

export interface DonutChartProps extends BaseChartProps {
  labels: string[];
  series: number[];
  colors?: string[];
  centerLabel?: string;
}

export interface HeatmapChartProps extends BaseChartProps {
  series: HeatmapSeries[];
  colors?: string[];
}

export interface ChartAdapter {
  LineChart: React.ComponentType<LineChartProps>;
  AreaChart: React.ComponentType<AreaChartProps>;
  BarChart: React.ComponentType<BarChartProps>;
  PieChart: React.ComponentType<PieChartProps>;
  DonutChart: React.ComponentType<DonutChartProps>;
  HeatmapChart: React.ComponentType<HeatmapChartProps>;
}
