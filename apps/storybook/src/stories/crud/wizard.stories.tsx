import type { Meta, StoryObj } from "@storybook/react";
import { Wizard } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Form/Wizard",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
} satisfies Meta;

export default meta;

function MockInput({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>{label}</label>
      <input
        placeholder={placeholder ?? label}
        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 14 }}
      />
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <Wizard onComplete={() => alert("Wizard completed!")}>
      <Wizard.Step title="Account" description="Set up your account">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MockInput label="Username" />
          <MockInput label="Email" placeholder="you@example.com" />
        </div>
      </Wizard.Step>
      <Wizard.Step title="Profile" description="Tell us about yourself">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MockInput label="Full Name" />
          <MockInput label="Company" />
        </div>
      </Wizard.Step>
      <Wizard.Step title="Review">
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Review your information</p>
          <p style={{ color: "#6b7280" }}>Please confirm that all details are correct before completing the wizard.</p>
        </div>
      </Wizard.Step>
    </Wizard>
  ),
};

export const TwoSteps: StoryObj = {
  render: () => (
    <Wizard onComplete={() => alert("Done!")}>
      <Wizard.Step title="Details">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MockInput label="Name" />
          <MockInput label="Description" />
        </div>
      </Wizard.Step>
      <Wizard.Step title="Confirm">
        <p style={{ fontSize: 14, color: "#6b7280" }}>Click Complete to finish.</p>
      </Wizard.Step>
    </Wizard>
  ),
};

export const WithValidation: StoryObj = {
  render: () => (
    <Wizard onComplete={() => alert("All validated and complete!")}>
      <Wizard.Step
        title="Required"
        description="Must pass validation"
        validate={() => {
          const ok = window.confirm("Simulate validation: pass?");
          return ok;
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MockInput label="Required Field" />
        </div>
      </Wizard.Step>
      <Wizard.Step title="Optional">
        <MockInput label="Optional Field" />
      </Wizard.Step>
    </Wizard>
  ),
};
