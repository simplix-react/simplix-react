import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { LineChartProps } from "../types";
import { useChartTheme } from "./use-chart-theme";

export function ApexLineChart({ series, categories, height = 350, curve = "smooth", strokeWidth = 2, className }: LineChartProps) {
  const theme = useChartTheme();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);

  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: "line",
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
    },
    stroke: { curve, width: strokeWidth },
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
  }), [series, categories, curve, strokeWidth, theme]);

  if (!hasData) {
    return (
      <div className={className} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: theme.mutedForeground, fontSize: "14px" }}>No data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactApexChart type="line" options={options} series={series} height={height} />
    </div>
  );
}
