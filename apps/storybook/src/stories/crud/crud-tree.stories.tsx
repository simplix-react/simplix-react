import type { Meta, StoryObj } from "@storybook/react";
import { CrudTree } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Tree/CrudTree",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

interface Category {
  id: string;
  name: string;
  status: string;
  children?: Category[];
}

const mockTree: Category[] = [
  {
    id: "1",
    name: "Electronics",
    status: "Active",
    children: [
      { id: "1-1", name: "Smartphones", status: "Active", children: [] },
      { id: "1-2", name: "Laptops", status: "Active", children: [
        { id: "1-2-1", name: "Gaming", status: "Active", children: [] },
        { id: "1-2-2", name: "Business", status: "Draft", children: [] },
      ] },
      { id: "1-3", name: "Accessories", status: "Draft", children: [] },
    ],
  },
  {
    id: "2",
    name: "Clothing",
    status: "Active",
    children: [
      { id: "2-1", name: "Men", status: "Active", children: [] },
      { id: "2-2", name: "Women", status: "Active", children: [] },
    ],
  },
  {
    id: "3",
    name: "Home & Garden",
    status: "Draft",
    children: [],
  },
];

export const Default: StoryObj = {
  render: () => (
    <CrudTree>
      <CrudTree.Table<Category>
        data={mockTree}
        tree={{ idField: "id", childrenField: "children", initialExpandedDepth: 1 }}
        searchFields={["name"]}
      >
        <CrudTree.Column<Category> field="name" header="Name" />
        <CrudTree.Column<Category> field="status" header="Status" />
      </CrudTree.Table>
    </CrudTree>
  ),
};

export const WithToolbar: StoryObj = {
  render: () => (
    <CrudTree>
      <CrudTree.Toolbar>
        <CrudTree.Search placeholder="Search categories..." />
        <CrudTree.ExpandToggle />
      </CrudTree.Toolbar>
      <CrudTree.Table<Category>
        data={mockTree}
        tree={{ idField: "id", childrenField: "children", initialExpandedDepth: 1 }}
        searchFields={["name"]}
      >
        <CrudTree.Column<Category> field="name" header="Name" />
        <CrudTree.Column<Category> field="status" header="Status" />
      </CrudTree.Table>
    </CrudTree>
  ),
};

export const WithActions: StoryObj = {
  render: () => (
    <CrudTree>
      <CrudTree.Table<Category>
        data={mockTree}
        tree={{ idField: "id", childrenField: "children", initialExpandedDepth: 2 }}
        actions={[
          { type: "edit", onClick: (row) => alert(`Edit: ${row.name}`) },
          { type: "delete", onClick: (row) => alert(`Delete: ${row.name}`) },
        ]}
        actionVariant="icon"
      >
        <CrudTree.Column<Category> field="name" header="Name" />
        <CrudTree.Column<Category> field="status" header="Status" />
      </CrudTree.Table>
    </CrudTree>
  ),
};

export const WithRowClick: StoryObj = {
  render: () => (
    <CrudTree>
      <CrudTree.Table<Category>
        data={mockTree}
        tree={{ idField: "id", childrenField: "children", initialExpandedDepth: 1 }}
        onRowClick={(row) => alert(`Clicked: ${row.name}`)}
      >
        <CrudTree.Column<Category> field="name" header="Name" />
        <CrudTree.Column<Category> field="status" header="Status" />
      </CrudTree.Table>
    </CrudTree>
  ),
};
