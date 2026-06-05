import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@simplix-react/ui";

const meta = {
  title: "Base/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p style={{ fontSize: 14, marginTop: 12 }}>
          Manage your account settings and preferences.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p style={{ fontSize: 14, marginTop: 12 }}>
          Change your password and security settings.
        </p>
      </TabsContent>
      <TabsContent value="notifications">
        <p style={{ fontSize: 14, marginTop: 12 }}>
          Configure how you receive notifications.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const FullWidth: Story = {
  name: "Variant: full",
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList variant="full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p style={{ fontSize: 14, marginTop: 12 }}>
          Dashboard overview with key metrics and summaries.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p style={{ fontSize: 14, marginTop: 12 }}>
          Detailed analytics with charts and trends.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p style={{ fontSize: 14, marginTop: 12 }}>
          Generate and download reports.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const Bookmark: Story = {
  name: "Variant: bookmark",
  render: () => (
    // Wrap the whole Tabs in a rounded card so the folder tabs and the panel
    // share one enclosing frame (rounded top + bottom). The bookmark TabsList
    // contributes only the bottom divider line; content stays plain.
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Tabs defaultValue="jobs">
        <TabsList variant="bookmark">
          <TabsTrigger value="jobs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Scheduled Jobs
        </TabsTrigger>
        <TabsTrigger value="logs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Run Logs
        </TabsTrigger>
        <TabsTrigger value="history">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          History
        </TabsTrigger>
      </TabsList>
        {/* Plain panels — the enclosing card frame provides the border/rounding. */}
        <TabsContent value="jobs" className="p-4">
          <p style={{ fontSize: 14 }}>Scheduled jobs — registered task list.</p>
        </TabsContent>
        <TabsContent value="logs" className="p-4">
          <p style={{ fontSize: 14 }}>Run logs — execution records.</p>
        </TabsContent>
        <TabsContent value="history" className="p-4">
          <p style={{ fontSize: 14 }}>History — cumulative run statistics.</p>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const WithDisabledTab: Story = {
  name: "With Disabled Tab",
  render: () => (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="beta" disabled>Beta</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p style={{ fontSize: 14, marginTop: 12 }}>General settings.</p>
      </TabsContent>
      <TabsContent value="advanced">
        <p style={{ fontSize: 14, marginTop: 12 }}>Advanced settings.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const PaddedContent: Story = {
  name: "Padded Content",
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">First</TabsTrigger>
        <TabsTrigger value="tab2">Second</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" padded>
        <p style={{ fontSize: 14 }}>
          This content has extra vertical padding for scrollable layouts.
        </p>
      </TabsContent>
      <TabsContent value="tab2" padded>
        <p style={{ fontSize: 14 }}>Second tab content with padding.</p>
      </TabsContent>
    </Tabs>
  ),
};
