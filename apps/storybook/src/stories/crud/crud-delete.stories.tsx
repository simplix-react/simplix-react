import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CrudDelete } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Delete/CrudDelete",
  component: CrudDelete,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof CrudDelete>;

export default meta;

export const Default: StoryObj<typeof CrudDelete> = {
  args: {
    open: true,
    entityName: "user",
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};

export const CustomMessages: StoryObj<typeof CrudDelete> = {
  args: {
    open: true,
    title: "Remove this pet?",
    description: "The pet record will be permanently deleted from the system.",
    deleteLabel: "Remove",
    cancelLabel: "Keep it",
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};

export const Loading: StoryObj<typeof CrudDelete> = {
  args: {
    open: true,
    entityName: "order",
    loading: true,
    deletingLabel: "Removing order...",
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};

export const Interactive: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const handleConfirm = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
        setDeleted(true);
      }, 1500);
    };

    return (
      <div>
        <button
          type="button"
          onClick={() => { setOpen(true); setDeleted(false); }}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #ef4444",
            color: "#ef4444",
            cursor: "pointer",
            background: "transparent",
            fontSize: 14,
          }}
        >
          Delete user
        </button>
        {deleted && <p style={{ marginTop: 8, fontSize: 14, color: "#16a34a" }}>User deleted.</p>}
        <CrudDelete
          open={open}
          onOpenChange={setOpen}
          onConfirm={handleConfirm}
          entityName="user"
          loading={loading}
        />
      </div>
    );
  },
};
