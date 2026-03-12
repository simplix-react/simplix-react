import type { Meta, StoryObj } from "@storybook/react";
import { CardList } from "@simplix-react/ui";

const meta = {
  title: "CRUD/List/CardList",
  component: CardList,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof CardList>;

export default meta;

interface Item {
  id: number;
  name: string;
  description: string;
  status: string;
}

const mockItems: Item[] = [
  { id: 1, name: "Widget A", description: "A high-quality widget", status: "Active" },
  { id: 2, name: "Widget B", description: "A budget-friendly widget", status: "Draft" },
  { id: 3, name: "Widget C", description: "A premium widget", status: "Active" },
  { id: 4, name: "Widget D", description: "A compact widget", status: "Archived" },
  { id: 5, name: "Widget E", description: "An oversized widget", status: "Active" },
  { id: 6, name: "Widget F", description: "A wireless widget", status: "Draft" },
];

function ItemCard({ item }: { item: Item }) {
  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
        <span style={{ fontSize: 12, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>
          {item.status}
        </span>
      </div>
      <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{item.description}</p>
    </div>
  );
}

export const SingleColumn: StoryObj = {
  render: () => (
    <CardList
      data={mockItems}
      columns={1}
      renderCard={(item: Item) => <ItemCard key={item.id} item={item} />}
    />
  ),
};

export const TwoColumns: StoryObj = {
  render: () => (
    <CardList
      data={mockItems}
      columns={2}
      renderCard={(item: Item) => <ItemCard key={item.id} item={item} />}
    />
  ),
};

export const ThreeColumns: StoryObj = {
  render: () => (
    <CardList
      data={mockItems}
      columns={3}
      renderCard={(item: Item) => <ItemCard key={item.id} item={item} />}
    />
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <CardList data={[]} renderCard={() => null} />
  ),
};
