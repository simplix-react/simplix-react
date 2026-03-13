import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { BarChartProps } from "../types";
import { hideGridRect, useChartTheme } from "./use-chart-theme";

export function ApexBarChart({ series, categories, height = 350, horizontal = false, stacked = false, className }: BarChartProps) {
  const theme = useChartTheme();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);

  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: "bar",
      stacked,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
      events: { mounted: hideGridRect, updated: hideGridRect },
    },
    plotOptions: {
      bar: { horizontal, borderRadius: 4, columnWidth: "60%", barHeight: "60%" },
    },
    xaxis: {
      categories,
      labels: { style: { colors: theme.mutedForeground, fontSize: "12px" } },
      axisBorder: { show: true, color: theme.borderLight },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: theme.mutedForeground, fontSize: "12px" } },
      axisBorder: { show: true, color: theme.borderLight },
      axisTicks: { show: false },
    },
    grid: {
      borderColor: theme.borderLight,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: { theme: theme.tooltipTheme },
    legend: { labels: { colors: theme.foreground } },
    dataLabels: { enabled: false },
    colors: series.map((s) => s.color).filter(Boolean) as string[],
  }), [series, categories, horizontal, stacked, theme]);

  if (!hasData) {
    return (
      <div className={className} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: theme.mutedForeground, fontSize: "14px" }}>No data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactApexChart type="bar" options={options} series={series} height={height} />
    </div>
  );
}
