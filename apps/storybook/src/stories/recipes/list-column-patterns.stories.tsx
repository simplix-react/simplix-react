import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Badge,
  CrudList,
  DetailFieldWrapper,
  Flex,
  Stack,
  formatDateMedium,
  type SortState,
} from "@simplix-react/ui";

const meta = {
  title: "Recipes/List Column Patterns",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

// ── Mock data ──

interface User {
  id: number;
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "PENDING";
  role: string;
  company?: { name: string };
  department?: { name: string };
  isVip: boolean;
  isAdmin: boolean;
  createdAt: string;
  displayOrder: number;
}

const mockUsers: User[] = [
  { id: 1, name: "Alice Kim", email: "alice@acme.com", status: "ACTIVE", role: "Engineer", company: { name: "Acme Corp" }, department: { name: "Engineering" }, isVip: true, isAdmin: true, createdAt: "2024-01-15T09:30:00Z", displayOrder: 1 },
  { id: 2, name: "Bob Park", email: "bob@globex.io", status: "ACTIVE", role: "Designer", company: { name: "Globex Inc" }, department: { name: "Design" }, isVip: false, isAdmin: false, createdAt: "2024-02-20T14:00:00Z", displayOrder: 2 },
  { id: 3, name: "Carol Lee", email: "carol@initech.com", status: "SUSPENDED", role: "Manager", company: { name: "Initech" }, isVip: true, isAdmin: false, createdAt: "2023-11-05T08:15:00Z", displayOrder: 3 },
  { id: 4, name: "David Choi", email: "david@umbrella.co", status: "EXPIRED", role: "Analyst", isVip: false, isAdmin: false, createdAt: "2023-06-30T16:45:00Z", displayOrder: 4 },
  { id: 5, name: "Eva Jung", email: "eva@stark.tech", status: "PENDING", role: "Engineer", company: { name: "Stark Tech" }, department: { name: "R&D" }, isVip: false, isAdmin: true, createdAt: "2024-03-01T10:00:00Z", displayOrder: 5 },
  { id: 6, name: "Frank Oh", email: "frank@wayne.ent", status: "ACTIVE", role: "Lead", company: { name: "Wayne Enterprises" }, department: { name: "Operations" }, isVip: true, isAdmin: true, createdAt: "2023-09-12T11:30:00Z", displayOrder: 6 },
  { id: 7, name: "Grace Yoon", email: "grace@oscorp.com", status: "ACTIVE", role: "Designer", company: { name: "Oscorp" }, isVip: false, isAdmin: false, createdAt: "2024-04-18T13:20:00Z", displayOrder: 7 },
  { id: 8, name: "Henry Shin", email: "henry@lexcorp.io", status: "SUSPENDED", role: "Analyst", department: { name: "Finance" }, isVip: false, isAdmin: false, createdAt: "2023-12-25T07:00:00Z", displayOrder: 8 },
  { id: 9, name: "Irene Han", email: "irene@daily.com", status: "PENDING", role: "Manager", company: { name: "Daily Planet" }, department: { name: "Editorial" }, isVip: true, isAdmin: false, createdAt: "2024-05-10T15:45:00Z", displayOrder: 9 },
  { id: 10, name: "Jake Lim", email: "jake@capsule.co", status: "ACTIVE", role: "Engineer", company: { name: "Capsule Corp" }, department: { name: "Engineering" }, isVip: false, isAdmin: true, createdAt: "2024-06-01T09:00:00Z", displayOrder: 10 },
];

// ── Inline SVG icons ──

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Status color mapping ──

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  EXPIRED: "secondary",
  SUSPENDED: "destructive",
  PENDING: "outline",
};

// ── Stories ──

export const BadgeColumn: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<User> data={mockUsers.slice(0, 6)}>
        <CrudList.Column<User> field="name" header="Name" />
        <CrudList.Column<User> field="email" header="Email" />
        <CrudList.Column<User> field="status" header="Status" sortable>
          {({ value }) => (
            <Badge variant={STATUS_COLORS[value as string] ?? "outline"}>
              {String(value)}
            </Badge>
          )}
        </CrudList.Column>
      </CrudList.Table>
    </CrudList>
  ),
};

export const NestedObjectColumn: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<User> data={mockUsers.slice(0, 6)}>
        <CrudList.Column<User> field="name" header="Name" />
        <CrudList.Column<User> field="email" header="Email" />
        <CrudList.Column<User> field="id" header="Company">
          {({ row }) => row.company?.name ?? "\u2014"}
        </CrudList.Column>
        <CrudList.Column<User> field="id" header="Department">
          {({ row }) => row.department?.name ?? "\u2014"}
        </CrudList.Column>
      </CrudList.Table>
    </CrudList>
  ),
};

export const CompositeColumn: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<User> data={mockUsers.slice(0, 6)}>
        <CrudList.Column<User> field="name" header="Name">
          {({ row }) => (
            <Flex gap="xs" align="center">
              <UserIcon className="size-3.5 text-muted-foreground" />
              <span className="font-medium">{row.name}</span>
            </Flex>
          )}
        </CrudList.Column>
        <CrudList.Column<User> field="email" header="Email" />
        <CrudList.Column<User> field="role" header="Role" />
      </CrudList.Table>
    </CrudList>
  ),
};

export const FlagBadgesColumn: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<User> data={mockUsers.slice(0, 8)}>
        <CrudList.Column<User> field="name" header="Name" />
        <CrudList.Column<User> field="role" header="Role" />
        <CrudList.Column<User> field="id" header="Flags">
          {({ row }) => {
            const flags = [
              row.isVip && "VIP",
              row.isAdmin && "Admin",
            ].filter(Boolean) as string[];
            return flags.length > 0 ? (
              <Flex gap="xs" wrap>
                {flags.map((f) => (
                  <Badge key={f} variant="outline" className="text-xs px-1.5 py-0">
                    {f}
                  </Badge>
                ))}
              </Flex>
            ) : null;
          }}
        </CrudList.Column>
      </CrudList.Table>
    </CrudList>
  ),
};

export const DateColumn: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<User> data={mockUsers.slice(0, 6)}>
        <CrudList.Column<User> field="name" header="Name" />
        <CrudList.Column<User> field="email" header="Email" />
        <CrudList.Column<User> field="createdAt" header="Created" sortable>
          {({ value }) => formatDateMedium(new Date(String(value)))}
        </CrudList.Column>
      </CrudList.Table>
    </CrudList>
  ),
};

export const CardModeResponsive: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<User>
        data={mockUsers.slice(0, 6)}
        cardBreakpoint={480}
        cardTitle={({ row }) => (
          <Flex gap="xs" align="center">
            <Badge variant={STATUS_COLORS[row.status]}>{row.status}</Badge>
            <span className="font-semibold">{row.name}</span>
          </Flex>
        )}
        cardContent={({ row }) => (
          <Stack gap="xs">
            <DetailFieldWrapper label="Email" layout="inline" size="sm">
              {row.email}
            </DetailFieldWrapper>
            <DetailFieldWrapper label="Role" layout="inline" size="sm">
              {row.role}
            </DetailFieldWrapper>
            <DetailFieldWrapper label="Company" layout="inline" size="sm">
              {row.company?.name ?? "\u2014"}
            </DetailFieldWrapper>
          </Stack>
        )}
      >
        <CrudList.Column<User> field="name" header="Name" />
        <CrudList.Column<User> field="email" header="Email" />
        <CrudList.Column<User> field="status" header="Status" sortable>
          {({ value }) => (
            <Badge variant={STATUS_COLORS[value as string] ?? "outline"}>
              {String(value)}
            </Badge>
          )}
        </CrudList.Column>
        <CrudList.Column<User> field="role" header="Role" />
      </CrudList.Table>
    </CrudList>
  ),
};

export const WithRowActions: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<User>
        data={mockUsers.slice(0, 6)}
        actions={[
          { type: "view", onClick: (row) => alert(`View: ${row.name}`) },
          { type: "edit", onClick: (row) => alert(`Edit: ${row.name}`) },
          { type: "delete", onClick: (row) => alert(`Delete: ${row.name}`) },
        ]}
        actionVariant="icon"
      >
        <CrudList.Column<User> field="name" header="Name">
          {({ row }) => (
            <Flex gap="xs" align="center">
              <UserIcon className="size-3.5 text-muted-foreground" />
              <span className="font-medium">{row.name}</span>
            </Flex>
          )}
        </CrudList.Column>
        <CrudList.Column<User> field="email" header="Email" />
        <CrudList.Column<User> field="status" header="Status">
          {({ value }) => (
            <Badge variant={STATUS_COLORS[value as string] ?? "outline"}>
              {String(value)}
            </Badge>
          )}
        </CrudList.Column>
      </CrudList.Table>
    </CrudList>
  ),
};

export const WithReorder: StoryObj = {
  render: () => {
    const [users, setUsers] = useState(mockUsers.slice(0, 6));
    const [sort, setSort] = useState<SortState>({ field: "displayOrder", direction: "asc" });

    return (
      <CrudList>
        <CrudList.Table<User>
          data={users}
          sort={sort}
          onSortChange={setSort}
          reorder={{
            orderField: "displayOrder",
            idField: "id",
            onReorder: (items) => setUsers(items),
          }}
        >
          <CrudList.Column<User> field="name" header="Name" />
          <CrudList.Column<User> field="email" header="Email" />
          <CrudList.Column<User> field="displayOrder" header="Order" width={80} sortable />
        </CrudList.Table>
      </CrudList>
    );
  },
};

export const WithSortAndPagination: StoryObj = {
  render: () => {
    const [sort, setSort] = useState<SortState>({ field: "name", direction: "asc" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const sorted = [...mockUsers].sort((a, b) => {
      const aVal = a[sort.field as keyof User];
      const bVal = b[sort.field as keyof User];
      const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sort.direction === "asc" ? cmp : -cmp;
    });

    const totalPages = Math.ceil(sorted.length / pageSize);
    const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

    return (
      <CrudList>
        <CrudList.Table<User>
          data={pageData}
          sort={sort}
          onSortChange={(s) => { setSort(s); setPage(1); }}
        >
          <CrudList.Column<User> field="name" header="Name" sortable />
          <CrudList.Column<User> field="email" header="Email" />
          <CrudList.Column<User> field="status" header="Status" sortable>
            {({ value }) => (
              <Badge variant={STATUS_COLORS[value as string] ?? "outline"}>
                {String(value)}
              </Badge>
            )}
          </CrudList.Column>
          <CrudList.Column<User> field="createdAt" header="Created" sortable>
            {({ value }) => formatDateMedium(new Date(String(value)))}
          </CrudList.Column>
        </CrudList.Table>
        <CrudList.Pagination
          page={page}
          pageSize={pageSize}
          total={mockUsers.length}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </CrudList>
    );
  },
};
