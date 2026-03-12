import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/ImageField",
  component: DetailFields.DetailImageField,
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
} satisfies Meta<typeof DetailFields.DetailImageField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Avatar",
    value: "https://i.pravatar.cc/96?u=storybook",
    alt: "User avatar",
  },
};

export const CustomSize: Story = {
  args: {
    label: "Profile Photo",
    value: "https://i.pravatar.cc/150?u=storybook-lg",
    alt: "Profile photo",
    width: 150,
    height: 150,
  },
};

export const NullValue: Story = {
  args: {
    label: "Avatar",
    value: null,
    alt: "No avatar",
  },
};

export const BrokenImage: Story = {
  args: {
    label: "Avatar",
    value: "https://invalid-url.example.com/broken.jpg",
    alt: "Broken image",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Thumbnail",
    value: "https://i.pravatar.cc/64?u=storybook-inline",
    alt: "Thumbnail",
    width: 48,
    height: 48,
    layout: "inline",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Photo",
    value: "https://i.pravatar.cc/80?u=storybook-left",
    alt: "Photo",
    width: 80,
    height: 80,
    layout: "left",
  },
};
