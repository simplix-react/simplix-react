import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { DonutChartProps } from "../types";
import { useChartTheme } from "./use-chart-theme";

export function ApexDonutChart({ labels, series, colors, centerLabel, height = 350, className }: DonutChartProps) {
  const theme = useChartTheme();
  const hasData = series.length > 0 && series.some((v) => v > 0);

  const options = useMemo((): ApexCharts.ApexOptions => ({
    chart: {
      type: "donut",
      fontFamily: theme.fontFamily,
      animations: { enabled: true, speed: 600, dynamicAnimation: { enabled: true, speed: 400 } },
    },
    labels,
    legend: {
      position: "bottom",
      labels: { colors: theme.foreground },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: !!centerLabel,
            total: {
              show: !!centerLabel,
              showAlways: false,
              ...(centerLabel ? { label: centerLabel, fontSize: "14px", color: theme.mutedForeground } : {}),
            },
          },
        },
      },
    },
    tooltip: { theme: "light", fixed: { enabled: false } },
    stroke: { colors: [theme.background], width: 2 },
    ...(colors?.length ? { colors } : {}),
  }), [labels, colors, centerLabel, theme]);

  if (!hasData) {
    return (
      <div className={className} style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: theme.mutedForeground, fontSize: "14px" }}>No data</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactApexChart type="donut" options={options} series={series} height={height} />
    </div>
  );
}
