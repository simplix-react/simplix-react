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
