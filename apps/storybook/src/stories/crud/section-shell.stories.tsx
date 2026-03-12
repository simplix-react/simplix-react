import type { Meta, StoryObj } from "@storybook/react";
import { SectionShell } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Shared/SectionShell",
  component: SectionShell,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 520 }}><Story /></div>],
} satisfies Meta<typeof SectionShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleContent = (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#6b7280" }}>Name</span>
      <span>John Doe</span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#6b7280" }}>Email</span>
      <span>john@example.com</span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#6b7280" }}>Role</span>
      <span>Admin</span>
    </div>
  </div>
);

export const Card: Story = {
  args: {
    title: "Basic Information",
    variant: "card",
    children: sampleContent,
  },
};

export const Flat: Story = {
  args: {
    title: "Basic Information",
    variant: "flat",
    children: sampleContent,
  },
};

export const Lined: Story = {
  args: {
    title: "Basic Information",
    variant: "lined",
    children: sampleContent,
  },
};

export const WithDescription: Story = {
  args: {
    title: "Contact Details",
    description: "Primary contact information for this account.",
    variant: "card",
    children: sampleContent,
  },
};

export const WithSectionTitle: Story = {
  args: {
    sectionTitle: "Account Settings",
    title: "Security",
    description: "Configure authentication and access control.",
    variant: "card",
    children: sampleContent,
  },
};

export const WithTrailing: Story = {
  args: {
    title: "Preferences",
    variant: "card",
    trailing: (
      <button
        type="button"
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          border: "1px solid #e5e7eb",
          fontSize: 12,
          cursor: "pointer",
          background: "transparent",
        }}
      >
        Edit
      </button>
    ),
    children: sampleContent,
  },
};

export const Collapsible: Story = {
  args: {
    title: "Advanced Settings",
    description: "Click the toggle to expand or collapse this section.",
    variant: "card",
    collapsible: true,
    defaultOpen: true,
    children: sampleContent,
  },
};

export const CollapsibleClosed: Story = {
  name: "Collapsible (Closed)",
  args: {
    title: "Advanced Settings",
    variant: "card",
    collapsible: true,
    defaultOpen: false,
    children: sampleContent,
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionShell title="Card Variant" variant="card">
        {sampleContent}
      </SectionShell>
      <SectionShell title="Flat Variant" variant="flat">
        {sampleContent}
      </SectionShell>
      <SectionShell title="Lined Variant" variant="lined">
        {sampleContent}
      </SectionShell>
    </div>
  ),
};
