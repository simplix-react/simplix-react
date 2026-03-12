import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/CountryField",
  component: FormFields.CountryField,
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
} satisfies Meta<typeof FormFields.CountryField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.CountryField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Country",
    value: "",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "KR");
    return <FormFields.CountryField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Country",
    value: "KR",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.CountryField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Country",
    value: "",
    error: "Please select a country",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.CountryField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Country of Residence",
    value: "",
    description: "Select the country where you currently reside",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.CountryField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Country",
    value: "",
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "US");
    return <FormFields.CountryField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Country",
    value: "US",
    disabled: true,
  },
};
