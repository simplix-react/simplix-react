import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/CountryField",
  component: DetailFields.DetailCountryField,
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
} satisfies Meta<typeof DetailFields.DetailCountryField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Country",
    value: "KR",
  },
};

export const UnitedStates: Story = {
  args: {
    label: "Country",
    value: "US",
  },
};

export const Japan: Story = {
  args: {
    label: "Country",
    value: "JP",
  },
};

export const NullValue: Story = {
  args: {
    label: "Country",
    value: null,
  },
};

export const UnknownCode: Story = {
  args: {
    label: "Country",
    value: "XX",
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Country",
    value: null,
    fallback: "Not specified",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Country",
    value: "KR",
    layout: "inline",
  },
};
