import type { ChartAdapter } from "../types";
import { ApexLineChart } from "./line-chart";
import { ApexAreaChart } from "./area-chart";
import { ApexBarChart } from "./bar-chart";
import { ApexPieChart } from "./pie-chart";
import { ApexDonutChart } from "./donut-chart";
import { ApexHeatmapChart } from "./heatmap-chart";

export const apexChartsAdapter: ChartAdapter = {
  LineChart: ApexLineChart,
  AreaChart: ApexAreaChart,
  BarChart: ApexBarChart,
  PieChart: ApexPieChart,
  DonutChart: ApexDonutChart,
  HeatmapChart: ApexHeatmapChart,
};
