import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TreeSelectField } from "@simplix-react/ui";

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

const sampleTree: TreeNode[] = [
  {
    id: "1",
    name: "Engineering",
    children: [
      {
        id: "1-1",
        name: "Frontend",
        children: [
          { id: "1-1-1", name: "React Team" },
          { id: "1-1-2", name: "Vue Team" },
        ],
      },
      {
        id: "1-2",
        name: "Backend",
        children: [
          { id: "1-2-1", name: "API Team" },
          { id: "1-2-2", name: "Infrastructure" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Design",
    children: [
      { id: "2-1", name: "UX Research" },
      { id: "2-2", name: "Visual Design" },
    ],
  },
  {
    id: "3",
    name: "Marketing",
    children: [
      { id: "3-1", name: "Content" },
      { id: "3-2", name: "Growth" },
    ],
  },
];

const meta = {
  title: "Fields/Form/TreeSelectField",
  component: TreeSelectField,
  tags: ["autodocs"],
  args: {
    value: null,
    onChange: () => {},
    treeData: [],
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
} satisfies Meta<typeof TreeSelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? null);
    return (
      <TreeSelectField<TreeNode>
        {...args}
        treeData={sampleTree}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: "Department",
    value: null,
    placeholder: "Select a department",
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>("1-1-1");
    return (
      <TreeSelectField<TreeNode>
        {...args}
        treeData={sampleTree}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: "Department",
  },
};

export const WithDisabledItem: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <TreeSelectField<TreeNode>
        {...args}
        treeData={sampleTree}
        value={value}
        onChange={setValue}
        disabledItemId="1-2"
      />
    );
  },
  args: {
    label: "Department",
    description: "Backend and its children are disabled",
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <TreeSelectField<TreeNode>
        {...args}
        treeData={sampleTree}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: "Department",
    error: "Please select a department",
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <TreeSelectField<TreeNode>
        {...args}
        treeData={sampleTree}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: "Department",
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>("2-1");
    return (
      <TreeSelectField<TreeNode>
        {...args}
        treeData={sampleTree}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: "Department",
    disabled: true,
  },
};

export const Loading: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <TreeSelectField<TreeNode>
        {...args}
        treeData={[]}
        isLoading={true}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: "Department",
  },
};
