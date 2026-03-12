import type { Meta, StoryObj } from "@storybook/react";
import { CrudForm } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Form/CrudForm",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 520, height: 600, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

function MockInput({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder ?? label}
        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 14 }}
      />
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <CrudForm
      onSubmit={() => {}}
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>Create User</span>}
      onClose={() => {}}
      footer={
        <CrudForm.Actions>
          <button
            type="button"
            style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, cursor: "pointer", background: "transparent" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, cursor: "pointer" }}
          >
            Save
          </button>
        </CrudForm.Actions>
      }
    >
      <CrudForm.Section title="Basic Info">
        <MockInput label="Name" />
        <MockInput label="Email" type="email" />
      </CrudForm.Section>
      <CrudForm.Section title="Settings">
        <MockInput label="Timezone" placeholder="Asia/Seoul" />
      </CrudForm.Section>
    </CrudForm>
  ),
};

export const TwoColumnLayout: StoryObj = {
  render: () => (
    <CrudForm
      onSubmit={() => {}}
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>Edit Profile</span>}
      onClose={() => {}}
      footer={
        <CrudForm.Actions spread>
          <button
            type="button"
            style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, cursor: "pointer", background: "transparent" }}
          >
            Back
          </button>
          <button
            type="submit"
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, cursor: "pointer" }}
          >
            Update
          </button>
        </CrudForm.Actions>
      }
    >
      <CrudForm.Section title="Personal" layout="two-column">
        <MockInput label="First Name" />
        <MockInput label="Last Name" />
        <MockInput label="Email" type="email" />
        <MockInput label="Phone" type="tel" />
      </CrudForm.Section>
    </CrudForm>
  ),
};

export const FlatSections: StoryObj = {
  render: () => (
    <CrudForm
      onSubmit={() => {}}
      footer={
        <CrudForm.Actions>
          <button
            type="submit"
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, cursor: "pointer" }}
          >
            Save
          </button>
        </CrudForm.Actions>
      }
    >
      <CrudForm.Section title="Account" variant="flat">
        <MockInput label="Username" />
        <MockInput label="Password" type="password" />
      </CrudForm.Section>
      <CrudForm.Section title="Notifications" variant="flat">
        <MockInput label="Email for alerts" type="email" />
      </CrudForm.Section>
    </CrudForm>
  ),
};

export const CollapsibleSections: StoryObj = {
  render: () => (
    <CrudForm
      onSubmit={() => {}}
      header={<span style={{ fontSize: 14, fontWeight: 600 }}>Advanced Form</span>}
      onClose={() => {}}
    >
      <CrudForm.Section title="Required Fields" variant="card">
        <MockInput label="Name" />
        <MockInput label="Email" type="email" />
      </CrudForm.Section>
      <CrudForm.Section title="Optional Fields" variant="card" collapsible defaultOpen={false}>
        <MockInput label="Middle Name" />
        <MockInput label="Nickname" />
      </CrudForm.Section>
    </CrudForm>
  ),
};
