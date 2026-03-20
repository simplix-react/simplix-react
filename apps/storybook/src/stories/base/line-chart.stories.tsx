import type { Meta, StoryObj } from "@storybook/react";
import { ChartProvider, apexChartsAdapter, useChartAdapter } from "@simplix-react/ui";

function LineChartWrapper(props: React.ComponentProps<ReturnType<typeof useChartAdapter>["LineChart"]>) {
  const { LineChart } = useChartAdapter();
  return <LineChart {...props} />;
}

const meta = {
  title: "Base/Charts/LineChart",
  component: LineChartWrapper,
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
    strokeWidth: { control: "number" },
  },
} satisfies Meta<typeof LineChartWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export const Default: Story = {
  args: {
    series: [{ name: "Sales", data: [30, 40, 35, 50, 49, 60], color: "#3b82f6" }],
    categories,
  },
};

export const MultiSeries: Story = {
  name: "Multi Series",
  args: {
    series: [
      { name: "Revenue", data: [30, 40, 35, 50, 49, 60], color: "#3b82f6" },
      { name: "Expenses", data: [20, 35, 25, 45, 30, 50], color: "#ef4444" },
    ],
    categories,
  },
};

export const Straight: Story = {
  args: {
    series: [{ name: "Users", data: [10, 25, 15, 30, 22, 38], color: "#10b981" }],
    categories,
    curve: "straight",
  },
};

export const Stepline: Story = {
  args: {
    series: [{ name: "Steps", data: [10, 25, 15, 30, 22, 38], color: "#f59e0b" }],
    categories,
    curve: "stepline",
  },
};

export const Empty: Story = {
  args: {
    series: [],
    categories: [],
  },
};
