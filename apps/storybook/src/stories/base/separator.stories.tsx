import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "@simplix-react/ui";

const meta = {
  title: "Base/Display/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: { control: "boolean" },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <p style={{ fontSize: 14, marginBottom: 8 }}>Section One</p>
      <Separator />
      <p style={{ fontSize: 14, marginTop: 8 }}>Section Two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 24 }}>
      <span style={{ fontSize: 14 }}>Home</span>
      <Separator orientation="vertical" />
      <span style={{ fontSize: 14 }}>Settings</span>
      <Separator orientation="vertical" />
      <span style={{ fontSize: 14 }}>Profile</span>
    </div>
  ),
};
