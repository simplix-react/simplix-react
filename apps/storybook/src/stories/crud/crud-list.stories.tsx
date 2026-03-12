import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CrudList } from "@simplix-react/ui";

const meta = {
  title: "CRUD/List/CrudList",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

interface Pet {
  id: number;
  name: string;
  status: string;
  category: string;
}

const mockPets: Pet[] = [
  { id: 1, name: "Buddy", status: "available", category: "Dog" },
  { id: 2, name: "Whiskers", status: "pending", category: "Cat" },
  { id: 3, name: "Nemo", status: "sold", category: "Fish" },
  { id: 4, name: "Rex", status: "available", category: "Dog" },
  { id: 5, name: "Luna", status: "available", category: "Cat" },
  { id: 6, name: "Charlie", status: "pending", category: "Dog" },
  { id: 7, name: "Milo", status: "sold", category: "Cat" },
  { id: 8, name: "Bella", status: "available", category: "Dog" },
];

export const Default: StoryObj = {
  render: () => {
    const [search, setSearch] = useState("");

    const filtered = mockPets.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
      <CrudList>
        <CrudList.Toolbar>
          <CrudList.Search value={search} onChange={setSearch} />
        </CrudList.Toolbar>
        <CrudList.Table<Pet> data={filtered}>
          <CrudList.Column<Pet> field="id" header="ID" width={60} />
          <CrudList.Column<Pet> field="name" header="Name" sortable />
          <CrudList.Column<Pet> field="status" header="Status" display="badge" variants={{ available: "default", pending: "secondary", sold: "outline" }} />
          <CrudList.Column<Pet> field="category" header="Category" />
        </CrudList.Table>
      </CrudList>
    );
  },
};

export const WithPagination: StoryObj = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 3;
    const totalPages = Math.ceil(mockPets.length / pageSize);
    const pageData = mockPets.slice((page - 1) * pageSize, page * pageSize);

    return (
      <CrudList>
        <CrudList.Table<Pet> data={pageData}>
          <CrudList.Column<Pet> field="id" header="ID" width={60} />
          <CrudList.Column<Pet> field="name" header="Name" />
          <CrudList.Column<Pet> field="status" header="Status" />
          <CrudList.Column<Pet> field="category" header="Category" />
        </CrudList.Table>
        <CrudList.Pagination
          page={page}
          pageSize={pageSize}
          total={mockPets.length}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CrudList>
    );
  },
};

export const WithActions: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<Pet>
        data={mockPets.slice(0, 5)}
        actions={[
          { type: "view", onClick: (row) => alert(`View: ${row.name}`) },
          { type: "edit", onClick: (row) => alert(`Edit: ${row.name}`) },
          { type: "delete", onClick: (row) => alert(`Delete: ${row.name}`) },
        ]}
        actionVariant="icon"
      >
        <CrudList.Column<Pet> field="name" header="Name" />
        <CrudList.Column<Pet> field="status" header="Status" />
        <CrudList.Column<Pet> field="category" header="Category" />
      </CrudList.Table>
    </CrudList>
  ),
};

export const WithRowClick: StoryObj = {
  render: () => {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
      <CrudList>
        <CrudList.Table<Pet>
          data={mockPets.slice(0, 5)}
          onRowClick={(row) => setActiveId(String(row.id))}
          activeRowId={activeId}
          rowId={(row) => String(row.id)}
        >
          <CrudList.Column<Pet> field="id" header="ID" width={60} />
          <CrudList.Column<Pet> field="name" header="Name" />
          <CrudList.Column<Pet> field="status" header="Status" />
        </CrudList.Table>
      </CrudList>
    );
  },
};

export const WithBulkActions: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState<Set<number>>(new Set());

    return (
      <CrudList>
        {selected.size > 0 && (
          <CrudList.BulkActions
            selectedCount={selected.size}
            onClear={() => setSelected(new Set())}
          >
            <CrudList.BulkAction
              label="Delete selected"
              variant="destructive"
              onClick={() => alert(`Delete ${selected.size} items`)}
            />
          </CrudList.BulkActions>
        )}
        <CrudList.Table<Pet>
          data={mockPets.slice(0, 5)}
          selectable
          selectedIndices={selected}
          onSelectionChange={(index) => {
            setSelected((prev) => {
              const next = new Set(prev);
              if (next.has(index)) next.delete(index);
              else next.add(index);
              return next;
            });
          }}
          onSelectAll={() => {
            if (selected.size === 5) setSelected(new Set());
            else setSelected(new Set([0, 1, 2, 3, 4]));
          }}
        >
          <CrudList.Column<Pet> field="name" header="Name" />
          <CrudList.Column<Pet> field="status" header="Status" />
        </CrudList.Table>
      </CrudList>
    );
  },
};

export const EmptyState: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<Pet>
        data={[]}
        emptyState={{
          title: "No pets found",
          description: "Create a new pet to get started.",
          action: (
            <button
              type="button"
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Add pet
            </button>
          ),
        }}
      >
        <CrudList.Column<Pet> field="name" header="Name" />
        <CrudList.Column<Pet> field="status" header="Status" />
      </CrudList.Table>
    </CrudList>
  ),
};

export const Loading: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<Pet> data={[]} isLoading>
        <CrudList.Column<Pet> field="id" header="ID" width={60} />
        <CrudList.Column<Pet> field="name" header="Name" />
        <CrudList.Column<Pet> field="status" header="Status" />
        <CrudList.Column<Pet> field="category" header="Category" />
      </CrudList.Table>
    </CrudList>
  ),
};

export const CustomCellRenderer: StoryObj = {
  render: () => (
    <CrudList>
      <CrudList.Table<Pet> data={mockPets.slice(0, 5)}>
        <CrudList.Column<Pet> field="name" header="Name">
          {({ value, row }) => (
            <span style={{ fontWeight: 600 }}>
              {String(value)} <span style={{ color: "#6b7280", fontWeight: 400 }}>({row.category})</span>
            </span>
          )}
        </CrudList.Column>
        <CrudList.Column<Pet> field="status" header="Status" display="badge" />
      </CrudList.Table>
    </CrudList>
  ),
};
