import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { PieChartProps } from "../types";
import { useChartTheme } from "./use-chart-theme";

export function ApexPieChart({ labels, series, colors, height = 350, className }: PieChartProps) {
  const theme = useChartTheme();
  const hasData = series.length > 0 && series.some((v) => v > 0);

  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: "pie",
      fontFamily: theme.fontFamily,
      animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
    },
    labels,
    legend: {
      position: "bottom",
      labels: { colors: theme.foreground },
    },
    tooltip: { theme: "light", fixed: { enabled: false } },
    stroke: { colors: [theme.background], width: 2 },
    ...(colors?.length ? { colors } : {}),
  }), [labels, colors, theme]);

  if (!hasData) {
    return (
      <div className={className} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: theme.mutedForeground, fontSize: "14px" }}>No data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactApexChart type="pie" options={options} series={series} height={height} />
    </div>
  );
}
