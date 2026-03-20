import type { Meta, StoryObj } from "@storybook/react";
import { ChartProvider, apexChartsAdapter, useChartAdapter } from "@simplix-react/ui";

function PieChartWrapper(props: React.ComponentProps<ReturnType<typeof useChartAdapter>["PieChart"]>) {
  const { PieChart } = useChartAdapter();
  return <PieChart {...props} />;
}

const meta = {
  title: "Base/Charts/PieChart",
  component: PieChartWrapper,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ChartProvider adapter={apexChartsAdapter}>
        <div style={{ width: 400 }}>
          <Story />
        </div>
      </ChartProvider>
    ),
  ],
  argTypes: {
    height: { control: "number" },
  },
} satisfies Meta<typeof PieChartWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    labels: ["Doors", "Turnstiles", "Elevators", "Readers"],
    series: [44, 55, 13, 33],
  },
};

export const CustomColors: Story = {
  name: "Custom Colors",
  args: {
    labels: ["Online", "Offline", "Maintenance"],
    series: [65, 20, 15],
    colors: ["#10b981", "#ef4444", "#f59e0b"],
  },
};

export const Empty: Story = {
  args: {
    labels: [],
    series: [],
  },
};
