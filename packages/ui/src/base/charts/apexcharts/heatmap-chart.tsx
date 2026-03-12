import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { HeatmapChartProps } from "../types";
import { useChartTheme } from "./use-chart-theme";

export function ApexHeatmapChart({ series, colors, height = 350, className }: HeatmapChartProps) {
  const theme = useChartTheme();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);

  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: "heatmap",
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
    },
    plotOptions: {
      heatmap: {
        radius: 2,
        colorScale: {
          ranges: colors?.length
            ? colors.map((color, i) => ({ from: i * 25, to: (i + 1) * 25, color }))
            : [],
        },
      },
    },
    xaxis: {
      labels: { style: { colors: theme.mutedForeground, fontSize: "12px" } },
    },
    yaxis: {
      labels: { style: { colors: theme.mutedForeground, fontSize: "12px" } },
    },
    grid: { borderColor: theme.border },
    tooltip: { theme: "light" },
    dataLabels: { enabled: false },
  }), [colors, theme]);

  if (!hasData) {
    return (
      <div className={className} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: theme.mutedForeground, fontSize: "14px" }}>No data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactApexChart type="heatmap" options={options} series={series} height={height} />
    </div>
  );
}
