import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  Button,
  Dialog,
  type DialogContentProps,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  type SelectTriggerProps,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableRowProps,
  type UIComponents,
  UIProvider,
} from "@simplix-react/ui";

const meta: Meta = {
  title: "Customization/Override Compound",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Compound components (Dialog, Table, Select, etc.) support partial sub-component overrides. " +
          "Override only the parts you need; the rest keep their defaults.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ── Custom sub-components ──

/** Dialog content with a colored left border and wider max-width. */
const StyledDialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>((props, ref) => (
  <DialogContent
    ref={ref}
    {...props}
    className={`border-l-4 border-l-blue-500 sm:max-w-lg ${props.className ?? ""}`}
  />
));
StyledDialogContent.displayName = "StyledDialogContent";

export const CustomDialogContent: Story = {
  name: "Custom Dialog.Content",
  parameters: {
    docs: {
      description: {
        story:
          "Overrides only `Dialog.Content` with a blue left border accent. " +
          "All other Dialog sub-components (Header, Footer, Title, etc.) remain default.",
      },
    },
  },
  render: () => (
    <UIProvider
      overrides={{ Dialog: { Content: StyledDialogContent } as Partial<UIComponents["Dialog"]> as UIComponents["Dialog"] }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Styled Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Content Style</DialogTitle>
            <DialogDescription>
              The dialog content has a blue left border accent applied via override.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Label htmlFor="dialog-name">Name</Label>
              <Input id="dialog-name" placeholder="Enter name" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UIProvider>
  ),
};

// ── Custom table row ──

const invoices = [
  { id: "INV-001", status: "Paid", method: "Credit Card", amount: 250.0 },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: 150.0 },
  { id: "INV-003", status: "Unpaid", method: "Bank Transfer", amount: 350.0 },
  { id: "INV-004", status: "Paid", method: "Credit Card", amount: 450.0 },
  { id: "INV-005", status: "Paid", method: "PayPal", amount: 550.0 },
];

/** Table row with alternating background colors. */
const StripedTableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>((props, ref) => (
  <TableRow
    ref={ref}
    {...props}
    className={`even:bg-muted/50 ${props.className ?? ""}`}
  />
));
StripedTableRow.displayName = "StripedTableRow";

export const CustomTableRow: Story = {
  name: "Custom Table.Row",
  parameters: {
    docs: {
      description: {
        story:
          "Overrides `Table.Row` to add alternating row backgrounds (`even:bg-muted/50`). " +
          "Table, TableHeader, TableHead, and TableCell remain default.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <UIProvider
      overrides={{ Table: { Row: StripedTableRow } as Partial<UIComponents["Table"]> as UIComponents["Table"] }}
    >
      <Table>
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
              <TableCell style={{ textAlign: "right" }}>
                ${inv.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </UIProvider>
  ),
};

// ── Custom select trigger ──

/** Select trigger with a thicker border and accent color. */
const AccentSelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>((props, ref) => (
  <SelectTrigger
    ref={ref}
    {...props}
    className={`border-2 border-indigo-400 focus:ring-indigo-500 ${props.className ?? ""}`}
  />
));
AccentSelectTrigger.displayName = "AccentSelectTrigger";

export const CustomSelectTrigger: Story = {
  name: "Custom Select.Trigger",
  parameters: {
    docs: {
      description: {
        story:
          "Overrides `Select.Trigger` with an indigo border accent. " +
          "SelectContent, SelectItem, and SelectValue remain default.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <UIProvider
      overrides={{ Select: { Trigger: AccentSelectTrigger } as Partial<UIComponents["Select"]> as UIComponents["Select"] }}
    >
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    </UIProvider>
  ),
};

export const PartialOverride: Story = {
  name: "Partial Override (Defaults Preserved)",
  parameters: {
    docs: {
      description: {
        story:
          "Overrides only `Dialog.Content` while leaving all other compound sub-components " +
          "and simple components at their defaults. This verifies the deep-merge behavior.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <UIProvider
      overrides={{ Dialog: { Content: StyledDialogContent } as Partial<UIComponents["Dialog"]> as UIComponents["Dialog"] }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 13, color: "#6b7280" }}>
          Dialog.Content is overridden (blue left border). Table and Select are untouched.
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Overridden Content</DialogTitle>
              <DialogDescription>Blue left border from override.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>OK</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column A</TableHead>
              <TableHead>Column B</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Default row</TableCell>
              <TableCell>No override</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div style={{ width: 200 }}>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Default trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Option A</SelectItem>
              <SelectItem value="b">Option B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </UIProvider>
  ),
};
