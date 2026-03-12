import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/LocationField",
  component: DetailFields.DetailLocationField,
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
} satisfies Meta<typeof DetailFields.DetailLocationField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Seoul: Story = {
  args: {
    label: "Location",
    latitude: 37.5665,
    longitude: 126.978,
    zoom: 13,
  },
};

export const NewYork: Story = {
  args: {
    label: "Office",
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 12,
  },
};

export const EmptyLocation: Story = {
  args: {
    label: "Location",
    latitude: 0,
    longitude: 0,
  },
};

export const HideWhenEmpty: Story = {
  args: {
    label: "Location",
    latitude: 0,
    longitude: 0,
    hideWhenEmpty: true,
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Location",
    latitude: 0,
    longitude: 0,
    fallback: "No location set",
  },
};

export const CustomZoom: Story = {
  args: {
    label: "Region",
    latitude: 35.6762,
    longitude: 139.6503,
    zoom: 8,
  },
};
