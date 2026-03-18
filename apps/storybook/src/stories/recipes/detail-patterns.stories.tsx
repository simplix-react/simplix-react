import type { Meta, StoryObj } from "@storybook/react";
import {
  AssignmentPanel,
  CrudDetail,
  DetailFields,
  Grid,
  Heading,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@simplix-react/ui";

const meta = {
  title: "Recipes/Detail Patterns",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 520, height: 640, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

// ── Mock data ──

interface AccessLevel {
  id: string;
  name: string;
  type: string;
}

const MOCK_ACCESS_LEVELS: AccessLevel[] = [
  { id: "1", name: "View Dashboard", type: "Read" },
  { id: "2", name: "Manage Users", type: "Write" },
  { id: "3", name: "System Config", type: "Admin" },
];

// ── Stories ──

export const BasicDetail: StoryObj = {
  render: () => (
    <CrudDetail
      header={<Heading level={5}>John Doe</Heading>}
      footer={
        <CrudDetail.DefaultActions
          onBack={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      }
    >
      <CrudDetail.Section title="General" variant="flat">
        <Grid columns={2} gap="md">
          <DetailFields.DetailTextField label="Name" value="John Doe" layout="inline" />
          <DetailFields.DetailTextField label="Email" value="john@example.com" layout="inline" />
          <DetailFields.DetailBadgeField<string>
            label="Status"
            value="ACTIVE"
            displayValue="Active"
            variants={{ ACTIVE: "default", SUSPENDED: "destructive", INACTIVE: "secondary" }}
            layout="inline"
          />
          <DetailFields.DetailDateField label="Created" value={new Date().toISOString()} layout="inline" />
        </Grid>
      </CrudDetail.Section>
    </CrudDetail>
  ),
};

export const DetailWithTabs: StoryObj = {
  render: () => (
    <CrudDetail
      header={<Heading level={5}>Alice Kim</Heading>}
      onClose={() => {}}
      footer={
        <CrudDetail.DefaultActions
          onBack={() => {}}
          onEdit={() => {}}
        />
      }
    >
      <Tabs defaultValue="profile">
        <TabsList variant="full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" padded>
          <CrudDetail.Section title="Personal Info" variant="card">
            <Grid columns={2} gap="md">
              <DetailFields.DetailTextField label="First Name" value="Alice" layout="inline" />
              <DetailFields.DetailTextField label="Last Name" value="Kim" layout="inline" />
              <DetailFields.DetailTextField label="Email" value="alice@acme.com" layout="inline" />
              <DetailFields.DetailTextField label="Phone" value="+82-10-1234-5678" layout="inline" />
            </Grid>
          </CrudDetail.Section>
          <CrudDetail.Section title="Company" variant="card">
            <Grid columns={2} gap="md">
              <DetailFields.DetailTextField label="Company" value="Acme Corp" layout="inline" />
              <DetailFields.DetailTextField label="Department" value="Engineering" layout="inline" />
              <DetailFields.DetailTextField label="Role" value="Lead Engineer" layout="inline" />
              <DetailFields.DetailBadgeField<string>
                label="Status"
                value="ACTIVE"
                displayValue="Active"
                variants={{ ACTIVE: "default", SUSPENDED: "destructive" }}
                layout="inline"
              />
            </Grid>
          </CrudDetail.Section>
        </TabsContent>
        <TabsContent value="access" padded>
          <AssignmentPanel title="Access Levels" count={MOCK_ACCESS_LEVELS.length}>
            <AssignmentPanel.Table<AccessLevel>
              data={MOCK_ACCESS_LEVELS}
              rowId={(r) => r.id}
            >
              <AssignmentPanel.Column<AccessLevel> field="name" header="Permission" />
              <AssignmentPanel.Column<AccessLevel> field="type" header="Type" />
            </AssignmentPanel.Table>
          </AssignmentPanel>
        </TabsContent>
      </Tabs>
    </CrudDetail>
  ),
};

export const DetailFieldShowcase: StoryObj = {
  render: () => (
    <CrudDetail
      header={<Heading level={5}>Field Types</Heading>}
      onClose={() => {}}
    >
      <CrudDetail.Section title="Text Fields" variant="card">
        <DetailFields.DetailTextField label="Name" value="Jane Smith" layout="inline" />
        <DetailFields.DetailTextField label="Email" value="jane@example.com" layout="inline" copyable />
        <DetailFields.DetailTextField label="Empty Field" value={null} layout="inline" />
      </CrudDetail.Section>

      <CrudDetail.Section title="Status & Numbers" variant="card">
        <DetailFields.DetailBadgeField<string>
          label="Status"
          value="ACTIVE"
          displayValue="Active"
          variants={{ ACTIVE: "default", INACTIVE: "secondary", BANNED: "destructive" }}
          layout="inline"
        />
        <DetailFields.DetailBooleanField label="Verified" value={true} layout="inline" />
        <DetailFields.DetailBooleanField label="Admin" value={false} mode="icon" layout="inline" />
        <DetailFields.DetailNumberField label="Balance" value={12500} format="currency" currency="USD" layout="inline" />
        <DetailFields.DetailNumberField label="Completion" value={0.85} format="percent" layout="inline" />
      </CrudDetail.Section>

      <CrudDetail.Section title="Dates & Links" variant="card">
        <DetailFields.DetailDateField label="Created" value="2024-06-15T09:30:00Z" format="date" layout="inline" />
        <DetailFields.DetailDateField label="Last Login" value="2026-03-17T14:22:00Z" format="datetime" layout="inline" />
        <DetailFields.DetailDateField label="Last Active" value="2026-03-18T08:00:00Z" format="relative" layout="inline" />
        <DetailFields.DetailLinkField label="Website" value="example.com" href="https://example.com" external layout="inline" />
      </CrudDetail.Section>

      <CrudDetail.Section title="Lists & Notes" variant="card">
        <DetailFields.DetailListField label="Tags" value={["React", "TypeScript", "Node.js"]} mode="badges" layout="inline" />
        <DetailFields.DetailListField label="Skills" value={["Frontend", "Backend", "DevOps"]} mode="comma" layout="inline" />
      </CrudDetail.Section>

      <DetailFields.DetailNoteField value="This user has been with the company for over 3 years and has consistently demonstrated excellent performance across multiple projects." />

      <CrudDetail.Section title="Geo & Locale" variant="card">
        <DetailFields.DetailCountryField label="Country" value="KR" layout="inline" />
        <DetailFields.DetailTimezoneField label="Timezone" value="Asia/Seoul" layout="inline" />
      </CrudDetail.Section>

      <CrudDetail.Section title="Media" variant="card">
        <DetailFields.DetailImageField
          label="Avatar"
          value="https://api.dicebear.com/7.x/initials/svg?seed=JS"
          alt="User avatar"
          width={64}
          height={64}
        />
      </CrudDetail.Section>
    </CrudDetail>
  ),
};

export const DetailWithAuditFooter: StoryObj = {
  render: () => (
    <CrudDetail
      header={<Heading level={5}>Product Detail</Heading>}
      onClose={() => {}}
      auditData={{
        id: "550e8400-e29b-41d4-a716-446655440000",
        createdAt: "2024-01-15T09:30:00Z",
        updatedAt: "2026-03-17T14:22:00Z",
      }}
      footer={
        <CrudDetail.DefaultActions
          onBack={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      }
    >
      <CrudDetail.Section title="Product Info" variant="flat">
        <Grid columns={2} gap="md">
          <DetailFields.DetailTextField label="Name" value="Widget Pro" layout="inline" />
          <DetailFields.DetailTextField label="SKU" value="WP-2024-001" layout="inline" copyable />
          <DetailFields.DetailNumberField label="Price" value={49.99} format="currency" currency="USD" layout="inline" />
          <DetailFields.DetailBadgeField<string>
            label="Status"
            value="AVAILABLE"
            displayValue="Available"
            variants={{ AVAILABLE: "default", OUT_OF_STOCK: "destructive", DISCONTINUED: "secondary" }}
            layout="inline"
          />
        </Grid>
      </CrudDetail.Section>
      <CrudDetail.Section title="Inventory" variant="flat">
        <Grid columns={2} gap="md">
          <DetailFields.DetailNumberField label="In Stock" value={142} layout="inline" />
          <DetailFields.DetailTextField label="Warehouse" value="Seoul-3" layout="inline" />
          <DetailFields.DetailBooleanField label="Reorder Alert" value={false} layout="inline" />
          <DetailFields.DetailTextField label="Supplier" value="Acme Parts Co." layout="inline" />
        </Grid>
      </CrudDetail.Section>
    </CrudDetail>
  ),
};

export const DetailWithAssignments: StoryObj = {
  render: () => {
    interface Role {
      id: string;
      name: string;
      scope: string;
    }

    interface Group {
      id: string;
      name: string;
      memberCount: number;
    }

    const roles: Role[] = [
      { id: "r1", name: "System Administrator", scope: "Global" },
      { id: "r2", name: "Content Manager", scope: "Content" },
      { id: "r3", name: "Report Viewer", scope: "Analytics" },
    ];

    const groups: Group[] = [
      { id: "g1", name: "Engineering Team", memberCount: 12 },
      { id: "g2", name: "Project Alpha", memberCount: 5 },
    ];

    return (
      <CrudDetail
        header={<Heading level={5}>Bob Park</Heading>}
        onClose={() => {}}
        footer={
          <CrudDetail.DefaultActions
            onBack={() => {}}
            onEdit={() => {}}
          />
        }
      >
        <CrudDetail.Section title="Overview" variant="flat">
          <Grid columns={2} gap="md">
            <DetailFields.DetailTextField label="Email" value="bob@globex.io" layout="inline" />
            <DetailFields.DetailBadgeField<string>
              label="Status"
              value="ACTIVE"
              displayValue="Active"
              variants={{ ACTIVE: "default", INACTIVE: "secondary" }}
              layout="inline"
            />
          </Grid>
        </CrudDetail.Section>

        <Stack gap="sm">
          <AssignmentPanel title="Roles" count={roles.length}>
            <AssignmentPanel.Table<Role>
              data={roles}
              rowId={(r) => r.id}
            >
              <AssignmentPanel.Column<Role> field="name" header="Role" />
              <AssignmentPanel.Column<Role> field="scope" header="Scope" />
            </AssignmentPanel.Table>
          </AssignmentPanel>

          <AssignmentPanel title="Groups" count={groups.length}>
            <AssignmentPanel.Table<Group>
              data={groups}
              rowId={(g) => g.id}
            >
              <AssignmentPanel.Column<Group> field="name" header="Group" />
              <AssignmentPanel.Column<Group> field="memberCount" header="Members">
                {({ row }) => <Text size="sm">{row.memberCount}</Text>}
              </AssignmentPanel.Column>
            </AssignmentPanel.Table>
          </AssignmentPanel>
        </Stack>
      </CrudDetail>
    );
  },
};
