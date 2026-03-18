import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/SelectField",
  component: FormFields.SelectField,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: () => {},
    options: [],
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
} satisfies Meta<typeof FormFields.SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended", disabled: true },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.SelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Role",
    value: "",
    options: roleOptions,
    placeholder: "Select a role",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "editor");
    return <FormFields.SelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Role",
    value: "editor",
    options: roleOptions,
  },
};

export const WithDisabledOption: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "active");
    return <FormFields.SelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Status",
    value: "active",
    options: statusOptions,
    description: "'Suspended' option is disabled",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.SelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Role",
    value: "",
    options: roleOptions,
    error: "Please select a role",
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.SelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Role",
    value: "",
    options: roleOptions,
    description: "The role determines what actions the user can perform",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <FormFields.SelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Role",
    value: "",
    options: roleOptions,
    required: true,
    placeholder: "Select a role",
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "admin");
    return <FormFields.SelectField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: "Role",
    value: "admin",
    options: roleOptions,
    disabled: true,
  },
};

const scheduleOptions = [
  { label: "24/7", value: "always" },
  { label: "Business Hours", value: "business" },
  { label: "Night Shift", value: "night" },
];

export const Compact: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState("business");
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, color: "#6b7280" }}>Schedule:</span>
        <FormFields.SelectField
          compact
          value={value}
          onChange={setValue}
          options={scheduleOptions}
          placeholder="Select..."
        />
      </div>
    );
  },
};
