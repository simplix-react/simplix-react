import type { Meta, StoryObj } from "@storybook/react";
import { CrudDetail } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Detail/CrudDetail",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 480, height: 600, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <CrudDetail
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>User Detail</span>}
      onClose={() => {}}
    >
      <CrudDetail.Section title="Basic Info">
        <FieldRow label="Name" value="John Doe" />
        <FieldRow label="Email" value="john@example.com" />
        <FieldRow label="Role" value="Administrator" />
      </CrudDetail.Section>
      <CrudDetail.Section title="Address">
        <FieldRow label="Street" value="123 Main St" />
        <FieldRow label="City" value="Seoul" />
        <FieldRow label="Country" value="South Korea" />
      </CrudDetail.Section>
    </CrudDetail>
  ),
};

export const WithFooter: StoryObj = {
  render: () => (
    <CrudDetail
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>Pet Detail</span>}
      onClose={() => {}}
      footer={
        <CrudDetail.DefaultActions
          onBack={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      }
    >
      <CrudDetail.Section title="Pet Info" variant="flat">
        <FieldRow label="Name" value="Buddy" />
        <FieldRow label="Species" value="Dog" />
        <FieldRow label="Status" value="Available" />
      </CrudDetail.Section>
    </CrudDetail>
  ),
};

export const WithLoading: StoryObj = {
  render: () => (
    <CrudDetail
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>Loading...</span>}
      onClose={() => {}}
      isLoading
    >
      <CrudDetail.Section title="Details">
        <FieldRow label="Name" value="John Doe" />
        <FieldRow label="Email" value="john@example.com" />
      </CrudDetail.Section>
    </CrudDetail>
  ),
};

export const DialogVariant: StoryObj = {
  render: () => (
    <CrudDetail
      variant="dialog"
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>Dialog Layout</span>}
      onClose={() => {}}
      footer={
        <CrudDetail.DefaultActions
          onClose={() => {}}
          onEdit={() => {}}
        />
      }
    >
      <CrudDetail.Section title="Contact" variant="card">
        <FieldRow label="Name" value="Jane Smith" />
        <FieldRow label="Phone" value="+82-10-1234-5678" />
        <FieldRow label="Email" value="jane@example.com" />
      </CrudDetail.Section>
    </CrudDetail>
  ),
};

export const MultipleSections: StoryObj = {
  render: () => (
    <CrudDetail
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>Product Detail</span>}
      onClose={() => {}}
      footer={
        <CrudDetail.Actions>
          <button
            type="button"
            style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, cursor: "pointer", background: "transparent" }}
          >
            Close
          </button>
          <button
            type="button"
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, cursor: "pointer" }}
          >
            Edit
          </button>
        </CrudDetail.Actions>
      }
    >
      <CrudDetail.Section title="General" variant="card">
        <FieldRow label="Product" value="Widget Pro" />
        <FieldRow label="SKU" value="WP-001" />
        <FieldRow label="Price" value="$49.99" />
      </CrudDetail.Section>
      <CrudDetail.Section title="Inventory" variant="card" collapsible>
        <FieldRow label="Stock" value="142" />
        <FieldRow label="Warehouse" value="Seoul-3" />
      </CrudDetail.Section>
      <CrudDetail.Section title="Metadata" variant="flat">
        <FieldRow label="Created" value="2024-01-15" />
        <FieldRow label="Updated" value="2024-03-22" />
      </CrudDetail.Section>
    </CrudDetail>
  ),
};
