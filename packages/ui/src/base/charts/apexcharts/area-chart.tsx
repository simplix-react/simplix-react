import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { AreaChartProps } from "../types";
import { useChartTheme } from "./use-chart-theme";

export function ApexAreaChart({ series, categories, height = 350, curve = "smooth", stacked = false, gradient = true, className }: AreaChartProps) {
  const theme = useChartTheme();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);

  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: "area",
      stacked,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
    },
    stroke: { curve, width: 2 },
    fill: gradient
      ? { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } }
      : { type: "solid", opacity: 0.3 },
    xaxis: {
      categories,
      labels: { style: { colors: theme.mutedForeground, fontSize: "12px" } },
      axisBorder: { color: theme.border },
      axisTicks: { color: theme.border },
    },
    yaxis: {
      labels: { style: { colors: theme.mutedForeground, fontSize: "12px" } },
    },
    grid: { borderColor: theme.border, strokeDashArray: 4 },
    tooltip: { theme: "light" },
    legend: { labels: { colors: theme.foreground } },
    colors: series.map((s) => s.color).filter(Boolean) as string[],
  }), [series, categories, stacked, curve, gradient, theme]);

  if (!hasData) {
    return (
      <div className={className} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: theme.mutedForeground, fontSize: "14px" }}>No data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactApexChart type="area" options={options} series={series} height={height} />
    </div>
  );
}
