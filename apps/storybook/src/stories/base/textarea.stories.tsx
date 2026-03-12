import type { Meta, StoryObj } from "@storybook/react";
import { Textarea, Label } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    rows: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Type your message here..." },
};

export const WithValue: Story = {
  name: "With Value",
  args: {
    defaultValue:
      "This is an existing message that can be edited. The textarea grows to fit content.",
  },
};

export const Disabled: Story = {
  args: { placeholder: "Cannot edit", disabled: true },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "Too short",
  },
};

export const WithLabel: Story = {
  name: "With Label",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="bio">Biography</Label>
      <Textarea
        id="bio"
        placeholder="Tell us about yourself..."
        rows={4}
      />
    </div>
  ),
};

export const CustomRows: Story = {
  name: "Custom Rows",
  args: {
    rows: 8,
    placeholder: "This textarea has 8 rows for longer content...",
  },
};
