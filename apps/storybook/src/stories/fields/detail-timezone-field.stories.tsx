import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/TimezoneField",
  component: DetailFields.DetailTimezoneField,
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "select",
      options: ["top", "left", "inline", "hidden"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof DetailFields.DetailTimezoneField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Timezone",
    value: "Asia/Seoul",
  },
};

export const NewYork: Story = {
  args: {
    label: "Timezone",
    value: "America/New_York",
  },
};

export const London: Story = {
  args: {
    label: "Timezone",
    value: "Europe/London",
  },
};

export const NullValue: Story = {
  args: {
    label: "Timezone",
    value: null,
  },
};

export const UnknownTimezone: Story = {
  args: {
    label: "Timezone",
    value: "Unknown/Zone",
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Timezone",
    value: null,
    fallback: "Not configured",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Timezone",
    value: "Asia/Seoul",
    layout: "inline",
  },
};
