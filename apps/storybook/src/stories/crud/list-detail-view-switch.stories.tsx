import type { Meta, StoryObj } from "@storybook/react";
import {
  ListDetailViewSwitch,
  useListDetailState,
  useFadeTransition,
} from "@simplix-react/ui";

const meta = {
  title: "CRUD/Patterns/ListDetailViewSwitch",
  component: ListDetailViewSwitch,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ListDetailViewSwitch>;

export default meta;

const mockItems: Record<string, { name: string; email: string }> = {
  "1": { name: "Alice", email: "alice@example.com" },
  "2": { name: "Bob", email: "bob@example.com" },
  "3": { name: "Charlie", email: "charlie@example.com" },
};

function DetailCard({ id }: { id: string }) {
  const item = mockItems[id];
  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Detail: {item?.name ?? id}</p>
      <p style={{ fontSize: 13, color: "#6b7280" }}>{item?.email ?? "unknown"}</p>
    </div>
  );
}

function NewForm() {
  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>New Item</p>
      <input placeholder="Name" style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 14, width: "100%" }} />
    </div>
  );
}

function EditForm({ id }: { id: string }) {
  const item = mockItems[id];
  return (
    <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Edit: {item?.name ?? id}</p>
      <input defaultValue={item?.name} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 14, width: "100%" }} />
    </div>
  );
}

function NavBar({
  onDetail,
  onNew,
  onEdit,
  onList,
}: {
  onDetail: (id: string) => void;
  onNew: () => void;
  onEdit: (id: string) => void;
  onList: () => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {Object.keys(mockItems).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onDetail(id)}
          style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "transparent", cursor: "pointer", fontSize: 13 }}
        >
          View {mockItems[id].name}
        </button>
      ))}
      <button
        type="button"
        onClick={onNew}
        style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13 }}
      >
        New
      </button>
      <button
        type="button"
        onClick={() => onEdit("1")}
        style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "transparent", cursor: "pointer", fontSize: 13 }}
      >
        Edit Alice
      </button>
      <button
        type="button"
        onClick={onList}
        style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "transparent", cursor: "pointer", fontSize: 13 }}
      >
        Clear
      </button>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => {
    const state = useListDetailState();
    const fade = useFadeTransition({
      active: state.view === "detail",
      targetId: state.selectedId,
    });
    return (
      <div>
        <NavBar
          onDetail={state.showDetail}
          onNew={state.showNew}
          onEdit={state.showEdit}
          onList={state.showList}
        />
        <ListDetailViewSwitch
          state={state}
          fade={fade}
          renderDetail={(id) => <DetailCard id={id} />}
          renderNew={() => <NewForm />}
          renderEdit={(id) => <EditForm id={id} />}
        />
        {state.view === "empty" && (
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Click a button above to show a view.</p>
        )}
      </div>
    );
  },
};

export const DetailOnly: StoryObj = {
  render: () => {
    const state = useListDetailState({ initialView: "detail" });
    const fade = useFadeTransition({
      active: state.view === "detail",
      targetId: state.selectedId ?? "1",
    });

    // Auto-select first item
    if (!state.selectedId && state.view === "detail") {
      state.showDetail("1");
    }

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {Object.keys(mockItems).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => state.showDetail(id)}
              style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "transparent", cursor: "pointer", fontSize: 13 }}
            >
              {mockItems[id].name}
            </button>
          ))}
        </div>
        <ListDetailViewSwitch
          state={state}
          fade={fade}
          renderDetail={(id) => <DetailCard id={id} />}
        />
      </div>
    );
  },
};
