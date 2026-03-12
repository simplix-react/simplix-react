import type { Meta, StoryObj } from "@storybook/react";
import { Input, Label } from "@simplix-react/ui";

const meta = {
  title: "Base/Inputs/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "search", "url", "tel"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const Email: Story = {
  args: { type: "email", placeholder: "user@example.com" },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password" },
};

export const Search: Story = {
  args: { type: "search", placeholder: "Search..." },
};

export const Disabled: Story = {
  args: { placeholder: "Cannot edit", disabled: true },
};

export const WithValue: Story = {
  name: "With Value",
  args: { defaultValue: "John Doe" },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "invalid-email",
    type: "email",
  },
};

export const WithLabel: Story = {
  name: "With Label",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter your username" />
    </div>
  ),
};

export const File: Story = {
  args: { type: "file" },
};
