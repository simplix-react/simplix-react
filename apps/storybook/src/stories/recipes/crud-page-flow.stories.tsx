import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  CrudDetail,
  CrudForm,
  CrudList,
  DetailFields,
  FormFields,
  Heading,
  ListDetail,
} from "@simplix-react/ui";

const meta = {
  title: "Recipes/CRUD Page Flow",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

// ── Mock data ──

interface User {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "PENDING";
  role: string;
  createdAt: string;
}

const INITIAL_USERS: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", status: "ACTIVE", role: "Admin", createdAt: "2024-01-15" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", status: "ACTIVE", role: "Editor", createdAt: "2024-02-20" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", status: "SUSPENDED", role: "Viewer", createdAt: "2024-03-10" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", status: "EXPIRED", role: "Admin", createdAt: "2024-04-05" },
  { id: "5", name: "Eve Wilson", email: "eve@example.com", status: "PENDING", role: "Editor", createdAt: "2024-05-12" },
];

const STATUS_VARIANTS = {
  ACTIVE: "success",
  SUSPENDED: "destructive",
  EXPIRED: "secondary",
  PENDING: "outline",
} as const;

// ── 1. ListDetailPanel ──

function ListDetailPanelDemo() {
  const [view, setView] = useState<"list" | "detail" | "new" | "edit">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");

  const selectedUser = data.find((u) => u.id === selectedId);
  const filtered = data.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function openEdit(user: User) {
    setSelectedId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setView("edit");
  }

  function handleDelete(user: User) {
    setData((prev) => prev.filter((u) => u.id !== user.id));
    if (selectedId === user.id) {
      setSelectedId(null);
      setView("list");
    }
  }

  return (
    <div style={{ height: 600 }}>
      <ListDetail variant="panel" activePanel={view === "list" ? "list" : "detail"} detailWidth={420}>
        <ListDetail.List>
          <CrudList>
            <CrudList.Toolbar>
              <CrudList.Search value={search} onChange={setSearch} />
              <Button
                size="sm"
                onClick={() => {
                  setNewName("");
                  setNewEmail("");
                  setSelectedId(null);
                  setView("new");
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 5v14M5 12h14" /></svg>
                New
              </Button>
            </CrudList.Toolbar>
            <CrudList.Table<User>
              data={filtered}
              activeRowId={selectedId}
              rowId={(row) => row.id}
              onRowClick={(row) => {
                setSelectedId(row.id);
                setView("detail");
              }}
              actions={[
                { type: "view", onClick: (row) => { setSelectedId(row.id); setView("detail"); } },
                { type: "edit", onClick: (row) => openEdit(row) },
                { type: "delete", onClick: (row) => handleDelete(row) },
              ]}
              actionVariant="icon"
            >
              <CrudList.Column<User> field="name" header="Name" />
              <CrudList.Column<User> field="email" header="Email" />
              <CrudList.Column<User> field="status" header="Status" display="badge" variants={STATUS_VARIANTS} />
              <CrudList.Column<User> field="role" header="Role" />
            </CrudList.Table>
          </CrudList>
        </ListDetail.List>
        <ListDetail.Detail>
          {view === "detail" && selectedUser && (
            <CrudDetail
              header={<Heading level={5}>{selectedUser.name}</Heading>}
              onClose={() => setView("list")}
              footer={
                <CrudDetail.DefaultActions
                  onBack={() => setView("list")}
                  onEdit={() => openEdit(selectedUser)}
                  onDelete={() => handleDelete(selectedUser)}
                />
              }
            >
              <CrudDetail.Section title="User Info" variant="flat">
                <DetailFields.DetailTextField label="Name" value={selectedUser.name} layout="inline" />
                <DetailFields.DetailTextField label="Email" value={selectedUser.email} layout="inline" />
                <DetailFields.DetailBadgeField label="Status" value={selectedUser.status} variants={STATUS_VARIANTS} layout="inline" />
                <DetailFields.DetailTextField label="Role" value={selectedUser.role} layout="inline" />
                <DetailFields.DetailTextField label="Created" value={selectedUser.createdAt} layout="inline" />
              </CrudDetail.Section>
            </CrudDetail>
          )}
          {view === "edit" && selectedUser && (
            <CrudForm
              header={<Heading level={5}>Edit User</Heading>}
              onSubmit={() => {
                setData((prev) =>
                  prev.map((u) => u.id === selectedUser.id ? { ...u, name: editName, email: editEmail } : u),
                );
                setView("detail");
              }}
              onClose={() => setView("detail")}
              footer={
                <CrudForm.Actions>
                  <Button variant="outline" size="sm" type="button" onClick={() => setView("detail")}>Cancel</Button>
                  <Button size="sm" type="submit">Save</Button>
                </CrudForm.Actions>
              }
            >
              <CrudForm.Section title="Edit Info" variant="flat">
                <FormFields.TextField label="Name" value={editName} onChange={setEditName} />
                <FormFields.TextField label="Email" value={editEmail} onChange={setEditEmail} type="email" />
              </CrudForm.Section>
            </CrudForm>
          )}
          {view === "new" && (
            <CrudForm
              header={<Heading level={5}>New User</Heading>}
              onSubmit={() => {
                const newUser: User = {
                  id: String(Date.now()),
                  name: newName,
                  email: newEmail,
                  status: "PENDING",
                  role: "Viewer",
                  createdAt: new Date().toISOString().slice(0, 10),
                };
                setData((prev) => [...prev, newUser]);
                setView("list");
              }}
              onClose={() => setView("list")}
              footer={
                <CrudForm.Actions>
                  <Button variant="outline" size="sm" type="button" onClick={() => setView("list")}>Cancel</Button>
                  <Button size="sm" type="submit">Create</Button>
                </CrudForm.Actions>
              }
            >
              <CrudForm.Section title="User Info" variant="flat">
                <FormFields.TextField label="Name" value={newName} onChange={setNewName} />
                <FormFields.TextField label="Email" value={newEmail} onChange={setNewEmail} type="email" />
              </CrudForm.Section>
            </CrudForm>
          )}
        </ListDetail.Detail>
      </ListDetail>
    </div>
  );
}

export const ListDetailPanel: StoryObj = {
  render: () => <ListDetailPanelDemo />,
};

// ── 2. ListDetailDialog ──

function ListDetailDialogDemo() {
  const [activePanel, setActivePanel] = useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);

  const selectedUser = data.find((u) => u.id === selectedId);
  const filtered = data.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  function openDetail(user: User) {
    setSelectedId(user.id);
    setEditing(false);
    setActivePanel("detail");
  }

  function openEdit(user: User) {
    setSelectedId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditing(true);
    setActivePanel("detail");
  }

  function closeDialog() {
    setActivePanel("list");
    setEditing(false);
  }

  return (
    <div style={{ height: 600, padding: 16 }}>
      <ListDetail
        variant="dialog"
        activePanel={activePanel}
        onClose={closeDialog}
        dialogHeight="420px"
      >
        <ListDetail.List>
          <CrudList>
            <CrudList.Toolbar>
              <CrudList.Search value={search} onChange={setSearch} />
            </CrudList.Toolbar>
            <CrudList.Table<User>
              data={filtered}
              rowId={(row) => row.id}
              onRowClick={(row) => openDetail(row)}
              actions={[
                { type: "view", onClick: (row) => openDetail(row) },
                { type: "edit", onClick: (row) => openEdit(row) },
                {
                  type: "delete",
                  onClick: (row) => {
                    setData((prev) => prev.filter((u) => u.id !== row.id));
                  },
                },
              ]}
              actionVariant="icon"
            >
              <CrudList.Column<User> field="name" header="Name" />
              <CrudList.Column<User> field="email" header="Email" />
              <CrudList.Column<User> field="status" header="Status" display="badge" variants={STATUS_VARIANTS} />
              <CrudList.Column<User> field="role" header="Role" />
            </CrudList.Table>
          </CrudList>
        </ListDetail.List>
        <ListDetail.Detail>
          {selectedUser && !editing && (
            <CrudDetail
              variant="dialog"
              header={<Heading level={5}>{selectedUser.name}</Heading>}
              onClose={closeDialog}
              footer={
                <CrudDetail.DefaultActions
                  onClose={closeDialog}
                  onEdit={() => openEdit(selectedUser)}
                />
              }
            >
              <CrudDetail.Section title="User Info" variant="flat">
                <DetailFields.DetailTextField label="Name" value={selectedUser.name} layout="inline" />
                <DetailFields.DetailTextField label="Email" value={selectedUser.email} layout="inline" />
                <DetailFields.DetailBadgeField label="Status" value={selectedUser.status} variants={STATUS_VARIANTS} layout="inline" />
                <DetailFields.DetailTextField label="Role" value={selectedUser.role} layout="inline" />
              </CrudDetail.Section>
            </CrudDetail>
          )}
          {selectedUser && editing && (
            <CrudForm
              header={<Heading level={5}>Edit {selectedUser.name}</Heading>}
              onSubmit={() => {
                setData((prev) =>
                  prev.map((u) => u.id === selectedUser.id ? { ...u, name: editName, email: editEmail } : u),
                );
                setEditing(false);
              }}
              onClose={() => setEditing(false)}
              footer={
                <CrudForm.Actions>
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button size="sm" type="submit">Save</Button>
                </CrudForm.Actions>
              }
            >
              <CrudForm.Section title="Edit Info" variant="flat">
                <FormFields.TextField label="Name" value={editName} onChange={setEditName} />
                <FormFields.TextField label="Email" value={editEmail} onChange={setEditEmail} type="email" />
              </CrudForm.Section>
            </CrudForm>
          )}
        </ListDetail.Detail>
      </ListDetail>
    </div>
  );
}

export const ListDetailDialog: StoryObj = {
  render: () => <ListDetailDialogDemo />,
};

// ── 3. FullPageMode ──

function FullPageModeDemo() {
  const [page, setPage] = useState<"list" | "detail" | "edit" | "new">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");

  const selectedUser = data.find((u) => u.id === selectedId);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function openEdit(user: User) {
    setSelectedId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setPage("edit");
  }

  const filtered = data.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (page === "list") {
    return (
      <div style={{ height: 600, padding: 16 }}>
        <CrudList>
          <CrudList.Toolbar>
            <CrudList.Search value={search} onChange={setSearch} />
            <Button
              size="sm"
              onClick={() => {
                setNewName("");
                setNewEmail("");
                setPage("new");
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 5v14M5 12h14" /></svg>
              New User
            </Button>
          </CrudList.Toolbar>
          <CrudList.Table<User>
            data={filtered}
            rowId={(row) => row.id}
            onRowClick={(row) => {
              setSelectedId(row.id);
              setPage("detail");
            }}
            actions={[
              { type: "view", onClick: (row) => { setSelectedId(row.id); setPage("detail"); } },
              { type: "edit", onClick: (row) => openEdit(row) },
              { type: "delete", onClick: (row) => setData((prev) => prev.filter((u) => u.id !== row.id)) },
            ]}
            actionVariant="icon"
          >
            <CrudList.Column<User> field="name" header="Name" />
            <CrudList.Column<User> field="email" header="Email" />
            <CrudList.Column<User> field="status" header="Status" display="badge" variants={STATUS_VARIANTS} />
            <CrudList.Column<User> field="role" header="Role" />
            <CrudList.Column<User> field="createdAt" header="Created" />
          </CrudList.Table>
        </CrudList>
      </div>
    );
  }

  if (page === "detail" && selectedUser) {
    return (
      <div style={{ height: 600, padding: 16 }}>
        <CrudDetail
          header={<Heading level={4}>{selectedUser.name}</Heading>}
          onClose={() => setPage("list")}
          footer={
            <CrudDetail.DefaultActions
              onBack={() => setPage("list")}
              onEdit={() => openEdit(selectedUser)}
            />
          }
        >
          <CrudDetail.Section title="User Info">
            <DetailFields.DetailTextField label="Name" value={selectedUser.name} layout="inline" />
            <DetailFields.DetailTextField label="Email" value={selectedUser.email} layout="inline" copyable />
            <DetailFields.DetailBadgeField label="Status" value={selectedUser.status} variants={STATUS_VARIANTS} layout="inline" />
            <DetailFields.DetailTextField label="Role" value={selectedUser.role} layout="inline" />
            <DetailFields.DetailTextField label="Created" value={selectedUser.createdAt} layout="inline" />
          </CrudDetail.Section>
        </CrudDetail>
      </div>
    );
  }

  if (page === "edit" && selectedUser) {
    return (
      <div style={{ height: 600, padding: 16 }}>
        <CrudForm
          header={<Heading level={4}>Edit User</Heading>}
          onSubmit={() => {
            setData((prev) =>
              prev.map((u) => u.id === selectedUser.id ? { ...u, name: editName, email: editEmail } : u),
            );
            setPage("detail");
          }}
          onClose={() => setPage("detail")}
          footer={
            <CrudForm.Actions spread>
              <Button variant="outline" size="sm" type="button" onClick={() => setPage("detail")}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
                Back
              </Button>
              <Button size="sm" type="submit">Save</Button>
            </CrudForm.Actions>
          }
        >
          <CrudForm.Section title="Edit Info">
            <FormFields.TextField label="Name" value={editName} onChange={setEditName} />
            <FormFields.TextField label="Email" value={editEmail} onChange={setEditEmail} type="email" />
          </CrudForm.Section>
        </CrudForm>
      </div>
    );
  }

  if (page === "new") {
    return (
      <div style={{ height: 600, padding: 16 }}>
        <CrudForm
          header={<Heading level={4}>New User</Heading>}
          onSubmit={() => {
            const newUser: User = {
              id: String(Date.now()),
              name: newName,
              email: newEmail,
              status: "PENDING",
              role: "Viewer",
              createdAt: new Date().toISOString().slice(0, 10),
            };
            setData((prev) => [...prev, newUser]);
            setPage("list");
          }}
          onClose={() => setPage("list")}
          footer={
            <CrudForm.Actions spread>
              <Button variant="outline" size="sm" type="button" onClick={() => setPage("list")}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
                Back
              </Button>
              <Button size="sm" type="submit">Create</Button>
            </CrudForm.Actions>
          }
        >
          <CrudForm.Section title="User Info">
            <FormFields.TextField label="Name" value={newName} onChange={setNewName} required />
            <FormFields.TextField label="Email" value={newEmail} onChange={setNewEmail} type="email" required />
          </CrudForm.Section>
        </CrudForm>
      </div>
    );
  }

  return null;
}

export const FullPageMode: StoryObj = {
  render: () => <FullPageModeDemo />,
};

// ── 4. WithDeleteConfirmation ──

function WithDeleteConfirmationDemo() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [data, setData] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deletedName, setDeletedName] = useState<string | null>(null);

  const selectedUser = data.find((u) => u.id === selectedId);
  const filtered = data.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  function requestDelete(user: User) {
    setDeleteTarget(user);
    setConfirmOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setData((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeletedName(deleteTarget.name);
    if (selectedId === deleteTarget.id) {
      setSelectedId(null);
      setView("list");
    }
    setConfirmOpen(false);
    setDeleteTarget(null);
    setTimeout(() => setDeletedName(null), 3000);
  }

  return (
    <div style={{ height: 600 }}>
      {deletedName && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 50,
            padding: "8px 16px",
            borderRadius: 6,
            background: "#16a34a",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {deletedName} has been deleted.
        </div>
      )}
      <ListDetail variant="panel" activePanel={view} detailWidth={420}>
        <ListDetail.List>
          <CrudList>
            <CrudList.Toolbar>
              <CrudList.Search value={search} onChange={setSearch} />
            </CrudList.Toolbar>
            <CrudList.Table<User>
              data={filtered}
              activeRowId={selectedId}
              rowId={(row) => row.id}
              onRowClick={(row) => {
                setSelectedId(row.id);
                setView("detail");
              }}
              actions={[
                { type: "view", onClick: (row) => { setSelectedId(row.id); setView("detail"); } },
                { type: "delete", onClick: (row) => requestDelete(row) },
              ]}
              actionVariant="icon"
            >
              <CrudList.Column<User> field="name" header="Name" />
              <CrudList.Column<User> field="email" header="Email" />
              <CrudList.Column<User> field="status" header="Status" display="badge" variants={STATUS_VARIANTS} />
              <CrudList.Column<User> field="role" header="Role" />
            </CrudList.Table>
          </CrudList>
        </ListDetail.List>
        <ListDetail.Detail>
          {view === "detail" && selectedUser && (
            <CrudDetail
              header={<Heading level={5}>{selectedUser.name}</Heading>}
              onClose={() => setView("list")}
              footer={
                <CrudDetail.DefaultActions
                  onBack={() => setView("list")}
                  onDelete={() => requestDelete(selectedUser)}
                />
              }
            >
              <CrudDetail.Section title="User Info" variant="flat">
                <DetailFields.DetailTextField label="Name" value={selectedUser.name} layout="inline" />
                <DetailFields.DetailTextField label="Email" value={selectedUser.email} layout="inline" />
                <DetailFields.DetailBadgeField label="Status" value={selectedUser.status} variants={STATUS_VARIANTS} layout="inline" />
                <DetailFields.DetailTextField label="Role" value={selectedUser.role} layout="inline" />
              </CrudDetail.Section>
            </CrudDetail>
          )}
        </ListDetail.Detail>
      </ListDetail>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete user"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this user"}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export const WithDeleteConfirmation: StoryObj = {
  render: () => <WithDeleteConfirmationDemo />,
};
