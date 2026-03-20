import type { Meta, StoryObj } from "@storybook/react";
import { ChartProvider, apexChartsAdapter, useChartAdapter } from "@simplix-react/ui";

function DonutChartWrapper(props: React.ComponentProps<ReturnType<typeof useChartAdapter>["DonutChart"]>) {
  const { DonutChart } = useChartAdapter();
  return <DonutChart {...props} />;
}

const meta = {
  title: "Base/Charts/DonutChart",
  component: DonutChartWrapper,
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
    centerLabel: { control: "text" },
  },
} satisfies Meta<typeof DonutChartWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    labels: ["Granted", "Denied", "Pending"],
    series: [120, 30, 10],
  },
};

export const WithCenterLabel: Story = {
  name: "With Center Label",
  args: {
    labels: ["Granted", "Denied", "Pending"],
    series: [120, 30, 10],
    centerLabel: "Total",
  },
};

export const CustomColors: Story = {
  name: "Custom Colors",
  args: {
    labels: ["Active", "Inactive", "Error"],
    series: [80, 15, 5],
    colors: ["#10b981", "#94a3b8", "#ef4444"],
    centerLabel: "Devices",
  },
};

export const Empty: Story = {
  args: {
    labels: [],
    series: [],
  },
};
