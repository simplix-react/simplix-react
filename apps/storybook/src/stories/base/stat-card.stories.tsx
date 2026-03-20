import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "@simplix-react/ui";

const meta = {
  title: "Base/Charts/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Total Events",
    value: "1,234",
  },
};

export const WithTrend: Story = {
  name: "With Trend",
  args: {
    title: "Access Grants",
    value: "8,421",
    trend: { value: 12.5, label: "vs last month" },
  },
};

export const NegativeTrend: Story = {
  name: "Negative Trend",
  args: {
    title: "Denied Entries",
    value: 156,
    trend: { value: -3.2, label: "vs last week" },
  },
};

export const WithDescription: Story = {
  name: "With Description",
  args: {
    title: "Active Devices",
    value: 42,
    description: "3 offline, 1 maintenance",
  },
};

export const WithIcon: Story = {
  name: "With Icon",
  args: {
    title: "Online Readers",
    value: 28,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
};

export const FullExample: Story = {
  name: "Full Example",
  args: {
    title: "Monthly Revenue",
    value: "$12,450",
    description: "Updated 5 minutes ago",
    trend: { value: 8.3, label: "vs last month" },
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
};
