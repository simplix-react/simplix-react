import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { BarChartProps } from "../types";
import { hideGridRect, useChartTheme } from "./use-chart-theme";

/**
 * The most ticks a whole-number axis is given, before it is capped by the largest bar.
 *
 * <p>Five is what the renderer aims for on its own. The cap matters more than the number: asked
 * for five ticks over a largest bar of two, the renderer rounds 0.4 and 0.8 to the same label and
 * draws 0 · 0 · 1 · 2 · 2 up the side.
 */
const WHOLE_AXIS_TICKS = 5;

export function ApexBarChart({ series, categories, height = 350, horizontal = false, stacked = false, showLegend = false, className }: BarChartProps) {
  const theme = useChartTheme();
  const hasData = series.length > 0 && series.some((s) => s.data.length > 0);

  // **A chart of whole numbers gets a whole-number axis.** The renderer divides the range evenly
  // and does not know what the bars count, so a largest bar of 1 is drawn against 0 · 0.2 · 0.4 ·
  // 0.6 · 0.8 · 1 — and there is no 0.4 of an occurrence, a person, or a document. Decided from
  // the data rather than from a prop the caller has to remember: where every value is an integer
  // the fractional ticks mean nothing to anybody, and where any value is fractional this leaves
  // the axis exactly as it was.
  //
  // **Vertical bars only.** With `horizontal` the value axis is the one carrying `categories`,
  // and the two are configured through the same `xaxis` key — so the same treatment there needs
  // its own reading, and the charts that pass `horizontal` keep today's axis untouched.
  const values = series.flatMap((one) => one.data).filter((value) => Number.isFinite(value));
  const wholeNumbers = !horizontal && values.length > 0 && values.every(Number.isInteger);
  const largest = values.length > 0 ? Math.max(...values) : 0;

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
      ...(wholeNumbers
        ? {
            min: 0,
            // Capped by the largest bar so no two ticks round to the same label.
            tickAmount: Math.max(1, Math.min(largest, WHOLE_AXIS_TICKS)),
            decimalsInFloat: 0,
          }
        : {}),
    },
    grid: {
      borderColor: theme.borderLight,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: { theme: theme.tooltipTheme },
    legend: { showForSingleSeries: showLegend, labels: { colors: theme.foreground } },
    dataLabels: { enabled: false },
    colors: series.map((s) => s.color).filter(Boolean) as string[],
  }), [series, categories, horizontal, stacked, showLegend, theme, wholeNumbers, largest]);

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
