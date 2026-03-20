import type { Meta, StoryObj } from "@storybook/react";
import { ChartProvider, apexChartsAdapter, useChartAdapter } from "@simplix-react/ui";
import type { HeatmapSeries } from "@simplix-react/ui";

function HeatmapChartWrapper(props: React.ComponentProps<ReturnType<typeof useChartAdapter>["HeatmapChart"]>) {
  const { HeatmapChart } = useChartAdapter();
  return <HeatmapChart {...props} />;
}

const meta = {
  title: "Base/Charts/HeatmapChart",
  component: HeatmapChartWrapper,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ChartProvider adapter={apexChartsAdapter}>
        <div style={{ width: 600 }}>
          <Story />
        </div>
      </ChartProvider>
    ),
  ],
  argTypes: {
    height: { control: "number" },
  },
} satisfies Meta<typeof HeatmapChartWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

function generateHeatmapData(rows: string[], cols: string[], max: number): HeatmapSeries[] {
  return rows.map((name) => ({
    name,
    data: cols.map((x) => ({ x, y: Math.floor(Math.random() * max) })),
  }));
}

const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Default: Story = {
  args: {
    series: generateHeatmapData(days, hours, 100),
  },
};

export const CustomColors: Story = {
  name: "Custom Colors",
  args: {
    series: generateHeatmapData(days, hours, 100),
    colors: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1", "#0c4a6e"],
  },
};

export const Empty: Story = {
  args: {
    series: [],
  },
};
