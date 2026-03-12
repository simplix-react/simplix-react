import type { Meta, StoryObj } from "@storybook/react";
import { DetailFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Detail/NumberField",
  component: DetailFields.DetailNumberField,
  tags: ["autodocs"],
  argTypes: {
    format: {
      control: "select",
      options: ["decimal", "currency", "percent"],
    },
    layout: {
      control: "select",
      options: ["top", "left", "inline", "hidden"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof DetailFields.DetailNumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Quantity",
    value: 1234,
  },
};

export const Decimal: Story = {
  args: {
    label: "Score",
    value: 98.5,
    format: "decimal",
  },
};

export const Currency: Story = {
  args: {
    label: "Price",
    value: 29.99,
    format: "currency",
    currency: "USD",
  },
};

export const CurrencyKRW: Story = {
  name: "Currency: KRW",
  args: {
    label: "Price",
    value: 35000,
    format: "currency",
    currency: "KRW",
    locale: "ko-KR",
  },
};

export const Percent: Story = {
  args: {
    label: "Completion Rate",
    value: 0.85,
    format: "percent",
  },
};

export const NullValue: Story = {
  args: {
    label: "Score",
    value: null,
  },
};

export const CustomFallback: Story = {
  args: {
    label: "Rating",
    value: null,
    fallback: "Not rated",
  },
};

export const LayoutInline: Story = {
  name: "Layout: inline",
  args: {
    label: "Total",
    value: 42,
    layout: "inline",
  },
};
