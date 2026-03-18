import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  type FieldWrapperProps,
  FieldWrapper,
  Input,
  Label,
  SectionShell,
  type SectionShellProps,
  UIProvider,
  createOverrides,
  withOverride,
} from "@simplix-react/ui";

const meta: Meta = {
  title: "Customization/Override CRUD",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "CRUD building blocks like SectionShell and FieldWrapper can be overridden " +
          "to change layout and styling across all CRUD views at once.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// ── Custom SectionShell ──

/** SectionShell with gradient header and rounded corners. */
function GradientSectionShell({
  title,
  description,
  children,
  trailing,
  className,
}: SectionShellProps) {
  return (
    <div
      className={className}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {(title || trailing) && (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
              {title}
            </div>
            {description && (
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>
                {description}
              </div>
            )}
          </div>
          {trailing}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

const sampleFields = (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Label htmlFor="sec-name">Name</Label>
      <Input id="sec-name" placeholder="John Doe" />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Label htmlFor="sec-email">Email</Label>
      <Input id="sec-email" placeholder="john@example.com" />
    </div>
  </div>
);

export const CustomSectionShell: Story = {
  name: "Custom SectionShell",
  parameters: {
    docs: {
      description: {
        story:
          "Replaces the default SectionShell with a gradient-header card. " +
          "All CRUD views using SectionShell will adopt this styling.",
      },
    },
  },
  render: () => (
    <UIProvider overrides={{ SectionShell: GradientSectionShell }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionShell title="User Profile" description="Basic account information">
          {sampleFields}
        </SectionShell>
        <SectionShell
          title="Preferences"
          trailing={
            <Button
              size="sm"
              variant="secondary"
              style={{ fontSize: 12 }}
            >
              Reset
            </Button>
          }
        >
          <div style={{ fontSize: 14, color: "#6b7280" }}>
            Notification preferences go here.
          </div>
        </SectionShell>
      </div>
    </UIProvider>
  ),
};

// ── Custom FieldWrapper ──

/** FieldWrapper with left-aligned label on the same row as the input. */
function HorizontalFieldWrapper({
  label,
  error,
  description,
  required,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={className} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      {label && (
        <div
          style={{
            width: 100,
            flexShrink: 0,
            paddingTop: 8,
            fontSize: 14,
            fontWeight: 500,
            color: "#374151",
          }}
        >
          {label}
          {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
        {error && (
          <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{error}</p>
        )}
        {description && !error && (
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{description}</p>
        )}
      </div>
    </div>
  );
}

export const CustomFieldWrapper: Story = {
  name: "Custom FieldWrapper",
  parameters: {
    docs: {
      description: {
        story:
          "Replaces the default FieldWrapper with a horizontal layout where labels sit " +
          "left-aligned beside the input field. Error and description messages are preserved.",
      },
    },
  },
  render: () => (
    <UIProvider overrides={{ FieldWrapper: HorizontalFieldWrapper }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FieldWrapper label="Username" required>
          <Input placeholder="Enter username" />
        </FieldWrapper>
        <FieldWrapper label="Email" description="We will never share your email">
          <Input placeholder="user@example.com" />
        </FieldWrapper>
        <FieldWrapper label="Password" error="Password must be at least 8 characters">
          <Input type="password" placeholder="Enter password" />
        </FieldWrapper>
      </div>
    </UIProvider>
  ),
};

// ── createOverrides helper ──

export const CreateOverridesHelper: Story = {
  name: "createOverrides Helper",
  parameters: {
    docs: {
      description: {
        story:
          "The `createOverrides` utility provides type-safe access to default components. " +
          "Use it with `withOverride` to extend defaults without writing full component wrappers.",
      },
    },
  },
  render: () => {
    const overrides = createOverrides((defaults) => ({
      SectionShell: withOverride(defaults.SectionShell, {
        className: "shadow-lg rounded-xl border-2 border-indigo-200",
      }),
      Button: withOverride(defaults.Button, {
        className: "rounded-full",
      }),
      Input: withOverride(defaults.Input, {
        className: "border-2 border-indigo-300 focus-visible:ring-indigo-500",
      }),
    }));

    return (
      <UIProvider overrides={overrides}>
        <SectionShell title="Settings" description="Created with createOverrides helper">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Label htmlFor="helper-name">Display Name</Label>
              <Input id="helper-name" placeholder="Enter display name" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Label htmlFor="helper-bio">Bio</Label>
              <Input id="helper-bio" placeholder="Short bio" />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline">Cancel</Button>
              <Button>Update Profile</Button>
            </div>
          </div>
        </SectionShell>
      </UIProvider>
    );
  },
};
