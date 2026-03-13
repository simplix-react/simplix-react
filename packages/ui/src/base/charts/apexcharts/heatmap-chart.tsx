import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { HeatmapChartProps } from "../types";
import { hideGridRect, toHex6, useChartTheme } from "./use-chart-theme";

export function ApexHeatmapChart({ series, colors, height = 350, className }: HeatmapChartProps) {
  const theme = useChartTheme();
  const isDark = theme.tooltipTheme === "dark";
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);

  const options = useMemo((): ApexCharts.ApexOptions => {
    // Build heatmap plot options based on mode
    let heatmapOpts: NonNullable<ApexCharts.ApexOptions["plotOptions"]>["heatmap"] = { radius: 2 };

    if (colors?.length) {
      heatmapOpts = {
        ...heatmapOpts,
        colorScale: {
          ranges: colors.map((color, i) => ({ from: i * 25, to: (i + 1) * 25, color })),
        },
      };
    } else {
      // Explicit intensity ranges for consistent legend in both modes
      const allValues = series.flatMap((s) => s.data.map((d) => d.y));
      const maxVal = Math.max(1, ...allValues);
      const bg = toHex6(theme.background);
      const q1 = Math.ceil(maxVal * 0.25);
      const q2 = Math.ceil(maxVal * 0.5);
      const q3 = Math.ceil(maxVal * 0.75);
      const palette = isDark
        ? ["#0f2740", "#1e3a5f", "#2563eb", "#f59e0b", "#ef4444"]
        : ["#e0effe", "#bfdbfe", "#3b82f6", "#f59e0b", "#ef4444"];
      heatmapOpts = {
        ...heatmapOpts,
        enableShades: false,
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: palette[0], name: "0" },
            { from: 1, to: q1, color: palette[1], name: `1–${q1}` },
            { from: q1 + 1, to: q2, color: palette[2], name: `${q1 + 1}–${q2}` },
            { from: q2 + 1, to: q3, color: palette[3], name: `${q2 + 1}–${q3}` },
            { from: q3 + 1, to: maxVal, color: palette[4], name: `${q3 + 1}–${maxVal}` },
          ],
        },
      };
    }

    return {
      chart: {
        type: "heatmap",
        toolbar: { show: false },
        fontFamily: theme.fontFamily,
        animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
        events: { mounted: hideGridRect, updated: hideGridRect },
      },
      plotOptions: { heatmap: heatmapOpts },
      stroke: { width: 2, colors: [toHex6(theme.background)] },
      xaxis: {
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
    };
  }, [series, colors, theme, isDark]);

  if (!hasData) {
    return (
      <div className={className} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: theme.mutedForeground, fontSize: "14px" }}>No data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactApexChart key={isDark ? "dark" : "light"} type="heatmap" options={options} series={series} height={height} />
    </div>
  );
}
