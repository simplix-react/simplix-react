import type { Meta, StoryObj } from "@storybook/react";
import { Section, Text, Card } from "@simplix-react/ui";

const meta = {
  title: "Primitives/Section",
  component: Section,
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Section heading rendered as an h3 element",
    },
    description: {
      control: "text",
      description: "Descriptive text rendered below the title",
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

// -- Playground --

export const Playground: Story = {
  args: {
    title: "Section Title",
    description: "A brief description of this section.",
    children: (
      <Card>
        <Text>Section content goes here.</Text>
      </Card>
    ),
  },
};

// -- Title only --

export const TitleOnly: Story = {
  args: {
    title: "Account Settings",
    children: <Text size="sm">Content without a description.</Text>,
  },
};

// -- Title + description --

export const TitleAndDescription: Story = {
  args: {
    title: "Notification Preferences",
    description: "Choose how and when you receive notifications.",
    children: <Text size="sm">Notification controls would go here.</Text>,
  },
};

// -- No header --

export const NoHeader: Story = {
  name: "No Title or Description",
  args: {
    children: <Text size="sm">A section with no title or description, just content.</Text>,
  },
};

// -- Realistic usage --

export const SettingsPage: Story = {
  name: "Example: Settings Page",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640 }}>
      <Section title="Profile" description="Your public profile information.">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["Display Name", "Bio", "Website"].map((label) => (
            <div key={label}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>
                {label}
              </div>
              <div
                style={{
                  height: 36,
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  background: "#fff",
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Security" description="Manage your password and authentication settings.">
        <Card padding="sm">
          <Text size="sm">Two-factor authentication is enabled.</Text>
        </Card>
      </Section>

      <Section title="Danger Zone">
        <Card padding="sm">
          <Text size="sm" tone="destructive">
            Deleting your account is irreversible.
          </Text>
        </Card>
      </Section>
    </div>
  ),
};

export const WithReactNodeTitle: Story = {
  name: "Title as ReactNode",
  args: {
    title: (
      <span>
        Custom Title with <span style={{ color: "#3b82f6" }}>styled text</span>
      </span>
    ),
    description: "The title prop accepts ReactNode, not just strings.",
    children: <Text size="sm">Section content.</Text>,
  },
};
