import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/ColorField",
  component: FormFields.ColorField,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: () => {},
  },
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
} satisfies Meta<typeof FormFields.ColorField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "#3b82f6");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Brand Color",
    value: "#3b82f6",
  },
};

export const Empty: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Pick a Color",
    value: "",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Theme Color",
    value: "",
    error: "Please select a color",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "#ef4444");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Accent Color",
    value: "#ef4444",
    description: "This color will be used for highlights and buttons",
  },
};

export const NotClearable: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "#22c55e");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Primary Color",
    value: "#22c55e",
    clearable: false,
  },
};

export const NoCustomPicker: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "#a855f7");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Category Color",
    value: "#a855f7",
    showCustomPicker: false,
    description: "Only preset colors available",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "#3b82f6");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Brand Color",
    value: "#3b82f6",
    disabled: true,
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.ColorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Required Color",
    value: "",
    required: true,
  },
};
