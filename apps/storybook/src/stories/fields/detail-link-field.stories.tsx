import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/LinkField",
  component: DetailFields.DetailLinkField,
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
} satisfies Meta<typeof DetailFields.DetailLinkField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Website",
    value: "example.com",
    href: "https://example.com",
  },
};

export const ExternalLink: Story = {
  args: {
    label: "Documentation",
    value: "View Docs",
    href: "https://docs.example.com",
    external: true,
  },
};

export const NullValue: Story = {
  args: {
    label: "Website",
    value: null,
    href: null,
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Homepage",
    value: null,
    href: null,
    fallback: "Not provided",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Profile",
    value: "View Profile",
    href: "https://example.com/profile",
    layout: "inline",
  },
};

export const LayoutLeft: Story = {
  name: "Layout: left",
  args: {
    label: "Source Code",
    value: "GitHub Repository",
    href: "https://github.com/example",
    external: true,
    layout: "left",
  },
};
