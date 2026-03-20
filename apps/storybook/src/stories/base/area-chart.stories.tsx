import type { Meta, StoryObj } from "@storybook/react";
import { ChartProvider, apexChartsAdapter, useChartAdapter } from "@simplix-react/ui";

function AreaChartWrapper(props: React.ComponentProps<ReturnType<typeof useChartAdapter>["AreaChart"]>) {
  const { AreaChart } = useChartAdapter();
  return <AreaChart {...props} />;
}

const meta = {
  title: "Base/Charts/AreaChart",
  component: AreaChartWrapper,
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
    curve: { control: "select", options: ["smooth", "straight", "stepline"] },
    stacked: { control: "boolean" },
    gradient: { control: "boolean" },
  },
} satisfies Meta<typeof AreaChartWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const Default: Story = {
  args: {
    series: [{ name: "Traffic", data: [31, 40, 28, 51, 42, 60], color: "#3b82f6" }],
    categories,
  },
};

export const Stacked: Story = {
  args: {
    series: [
      { name: "Organic", data: [31, 40, 28, 51, 42, 60], color: "#3b82f6" },
      { name: "Paid", data: [11, 20, 15, 22, 18, 30], color: "#10b981" },
    ],
    categories,
    stacked: true,
  },
};

export const NoGradient: Story = {
  name: "No Gradient",
  args: {
    series: [{ name: "Views", data: [20, 35, 25, 45, 30, 55], color: "#8b5cf6" }],
    categories,
    gradient: false,
  },
};

export const Empty: Story = {
  args: {
    series: [],
    categories: [],
  },
};
