import type { Meta, StoryObj } from "@storybook/react";
import { ChartProvider, apexChartsAdapter, useChartAdapter } from "@simplix-react/ui";

function BarChartWrapper(props: React.ComponentProps<ReturnType<typeof useChartAdapter>["BarChart"]>) {
  const { BarChart } = useChartAdapter();
  return <BarChart {...props} />;
}

const meta = {
  title: "Base/Charts/BarChart",
  component: BarChartWrapper,
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
    horizontal: { control: "boolean" },
    stacked: { control: "boolean" },
  },
} satisfies Meta<typeof BarChartWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const Default: Story = {
  args: {
    series: [{ name: "Events", data: [44, 55, 41, 67, 22], color: "#3b82f6" }],
    categories,
  },
};

export const Horizontal: Story = {
  args: {
    series: [{ name: "Events", data: [44, 55, 41, 67, 22], color: "#10b981" }],
    categories,
    horizontal: true,
  },
};

export const Stacked: Story = {
  args: {
    series: [
      { name: "Granted", data: [44, 55, 41, 67, 22], color: "#3b82f6" },
      { name: "Denied", data: [13, 23, 20, 8, 13], color: "#ef4444" },
    ],
    categories,
    stacked: true,
  },
};

export const Empty: Story = {
  args: {
    series: [],
    categories: [],
  },
};
