import type { Meta, StoryObj } from "@storybook/react";
import { PageHeaderProvider, usePageHeader, usePageHeaderState } from "@simplix-react/ui";

const meta = {
  title: "Layout/PageHeader",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <PageHeaderProvider>
        <div style={{ width: 560 }}>
          <Story />
        </div>
      </PageHeaderProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function HeaderDisplay() {
  const header = usePageHeaderState();
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {header.title && <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{header.title}</h2>}
          {header.description && <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>{header.description}</p>}
          {header.metadata && <div style={{ marginTop: 8 }}>{header.metadata}</div>}
        </div>
        {header.actions && <div>{header.actions}</div>}
      </div>
      {header.center && <div style={{ marginTop: 12 }}>{header.center}</div>}
    </div>
  );
}

function PageWithHeader({ title, description }: { title: string; description?: string }) {
  usePageHeader({ title, description });
  return <HeaderDisplay />;
}

function PageWithMetadata() {
  usePageHeader({
    title: "Dashboard",
    description: "Overview of your account",
    metadata: <span style={{ fontSize: 12, color: "#3b82f6" }}>Last updated: 5 minutes ago</span>,
    metadataKey: "dashboard",
    actions: (
      <button
        type="button"
        style={{
          padding: "6px 16px",
          borderRadius: 6,
          border: "none",
          background: "#3b82f6",
          color: "#fff",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Refresh
      </button>
    ),
  });
  return <HeaderDisplay />;
}

export const Default: Story = {
  render: () => <PageWithHeader title="Users" description="Manage user accounts" />,
};

export const TitleOnly: Story = {
  render: () => <PageWithHeader title="Settings" />,
};

export const WithMetadataAndActions: Story = {
  render: () => <PageWithMetadata />,
};
