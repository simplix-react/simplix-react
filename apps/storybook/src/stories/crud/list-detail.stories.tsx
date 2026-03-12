import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ListDetail, CrudDetail, CrudList } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Patterns/ListDetail",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

interface Item {
  id: number;
  name: string;
  email: string;
  status: string;
}

const mockItems: Item[] = [
  { id: 1, name: "Alice", email: "alice@example.com", status: "Active" },
  { id: 2, name: "Bob", email: "bob@example.com", status: "Pending" },
  { id: 3, name: "Charlie", email: "charlie@example.com", status: "Active" },
  { id: 4, name: "Diana", email: "diana@example.com", status: "Inactive" },
  { id: 5, name: "Eve", email: "eve@example.com", status: "Active" },
];

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export const PanelMode: StoryObj = {
  render: () => {
    const [activePanel, setActivePanel] = useState<"list" | "detail">("list");
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    return (
      <div style={{ height: 500, padding: 16 }}>
        <ListDetail
          variant="panel"
          activePanel={activePanel}
          detailWidth={400}
        >
          <ListDetail.List>
            <CrudList>
              <CrudList.Table<Item>
                data={mockItems}
                onRowClick={(row) => {
                  setSelectedItem(row);
                  setActivePanel("detail");
                }}
                activeRowId={selectedItem ? String(selectedItem.id) : null}
                rowId={(row) => String(row.id)}
              >
                <CrudList.Column<Item> field="name" header="Name" />
                <CrudList.Column<Item> field="email" header="Email" />
                <CrudList.Column<Item> field="status" header="Status" />
              </CrudList.Table>
            </CrudList>
          </ListDetail.List>
          <ListDetail.Detail>
            {selectedItem && (
              <CrudDetail
                header={<span style={{ fontSize: 14, fontWeight: 600 }}>{selectedItem.name}</span>}
                onClose={() => setActivePanel("list")}
                footer={
                  <CrudDetail.DefaultActions
                    onClose={() => setActivePanel("list")}
                    onEdit={() => alert(`Edit: ${selectedItem.name}`)}
                  />
                }
              >
                <CrudDetail.Section title="User Info">
                  <FieldRow label="Name" value={selectedItem.name} />
                  <FieldRow label="Email" value={selectedItem.email} />
                  <FieldRow label="Status" value={selectedItem.status} />
                </CrudDetail.Section>
              </CrudDetail>
            )}
          </ListDetail.Detail>
        </ListDetail>
      </div>
    );
  },
};

export const DialogMode: StoryObj = {
  render: () => {
    const [activePanel, setActivePanel] = useState<"list" | "detail">("list");
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    return (
      <div style={{ height: 500, padding: 16 }}>
        <ListDetail
          variant="dialog"
          activePanel={activePanel}
          onClose={() => setActivePanel("list")}
          dialogHeight="400px"
        >
          <ListDetail.List>
            <CrudList>
              <CrudList.Table<Item>
                data={mockItems}
                onRowClick={(row) => {
                  setSelectedItem(row);
                  setActivePanel("detail");
                }}
                rowId={(row) => String(row.id)}
              >
                <CrudList.Column<Item> field="name" header="Name" />
                <CrudList.Column<Item> field="email" header="Email" />
                <CrudList.Column<Item> field="status" header="Status" />
              </CrudList.Table>
            </CrudList>
          </ListDetail.List>
          <ListDetail.Detail>
            {selectedItem && (
              <CrudDetail
                variant="dialog"
                header={<span style={{ fontSize: 14, fontWeight: 600 }}>{selectedItem.name}</span>}
                onClose={() => setActivePanel("list")}
                footer={
                  <CrudDetail.DefaultActions
                    onClose={() => setActivePanel("list")}
                  />
                }
              >
                <CrudDetail.Section title="Details">
                  <FieldRow label="Name" value={selectedItem.name} />
                  <FieldRow label="Email" value={selectedItem.email} />
                  <FieldRow label="Status" value={selectedItem.status} />
                </CrudDetail.Section>
              </CrudDetail>
            )}
          </ListDetail.Detail>
        </ListDetail>
      </div>
    );
  },
};
