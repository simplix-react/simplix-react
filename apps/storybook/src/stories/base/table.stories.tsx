import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplix-react/ui";

const meta = {
  title: "Base/Display/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "striped", "bordered"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    density: {
      control: "select",
      options: ["compact", "default", "comfortable"],
    },
    rounded: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const invoices = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: 250.00 },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: 150.00 },
  { id: "INV-003", status: "Unpaid", method: "Bank Transfer", amount: 350.00 },
  { id: "INV-004", status: "Paid", method: "Credit Card", amount: 450.00 },
  { id: "INV-005", status: "Paid", method: "PayPal", amount: 550.00 },
];

const renderTable = (props: Record<string, unknown> = {}) => (
  <Table {...props}>
    <TableCaption>Recent invoices for your account.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Method</TableHead>
        <TableHead style={{ textAlign: "right" }}>Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {invoices.map((inv) => (
        <TableRow key={inv.id}>
          <TableCell style={{ fontWeight: 500 }}>{inv.id}</TableCell>
          <TableCell>{inv.status}</TableCell>
          <TableCell>{inv.method}</TableCell>
          <TableCell style={{ textAlign: "right" }}>${inv.amount.toFixed(2)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={3}>Total</TableCell>
        <TableCell style={{ textAlign: "right" }}>
          ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
        </TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);

export const Default: Story = {
  render: () => renderTable(),
};

export const Striped: Story = {
  render: () => renderTable({ variant: "striped" }),
};

export const Bordered: Story = {
  render: () => renderTable({ variant: "bordered", rounded: "md" }),
};

export const SizeSmall: Story = {
  name: "Size: sm",
  render: () => renderTable({ size: "sm" }),
};

export const SizeMedium: Story = {
  name: "Size: md",
  render: () => renderTable({ size: "md" }),
};

export const SizeLarge: Story = {
  name: "Size: lg",
  render: () => renderTable({ size: "lg" }),
};

export const DensityCompact: Story = {
  name: "Density: compact",
  render: () => renderTable({ density: "compact" }),
};

export const DensityDefault: Story = {
  name: "Density: default",
  render: () => renderTable({ density: "default" }),
};

export const DensityComfortable: Story = {
  name: "Density: comfortable",
  render: () => renderTable({ density: "comfortable" }),
};

export const RoundedLg: Story = {
  name: "Rounded: lg",
  render: () => renderTable({ variant: "bordered", rounded: "lg" }),
};

export const StripedCompact: Story = {
  name: "Striped + Compact",
  render: () => renderTable({ variant: "striped", density: "compact", size: "sm" }),
};
