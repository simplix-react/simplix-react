import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "@simplix-react/ui";

const meta = {
  title: "Base/Display/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    style: { width: 200, height: 20 },
  },
};

export const Circle: Story = {
  args: {
    className: "rounded-full",
    style: { width: 48, height: 48 },
  },
};

export const CardSkeleton: Story = {
  name: "Card Loading",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 300 }}>
      <Skeleton style={{ height: 160, borderRadius: 8 }} />
      <Skeleton style={{ height: 20, width: "70%" }} />
      <Skeleton style={{ height: 14, width: "90%" }} />
      <Skeleton style={{ height: 14, width: "50%" }} />
    </div>
  ),
};

export const ListSkeleton: Story = {
  name: "List Loading",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton className="rounded-full" style={{ width: 40, height: 40, flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            <Skeleton style={{ height: 16, width: "60%" }} />
            <Skeleton style={{ height: 12, width: "80%" }} />
          </div>
        </div>
      ))}
    </div>
  ),
};
