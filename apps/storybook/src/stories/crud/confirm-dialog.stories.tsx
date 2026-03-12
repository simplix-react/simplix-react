import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConfirmDialog } from "@simplix-react/ui";

const meta = {
  title: "CRUD/Shared/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

export const Default: StoryObj<typeof ConfirmDialog> = {
  args: {
    open: true,
    title: "Confirm action",
    description: "Are you sure you want to proceed? This action cannot be undone.",
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};

export const Destructive: StoryObj<typeof ConfirmDialog> = {
  args: {
    open: true,
    title: "Delete record",
    description: "This will permanently delete the record. This action cannot be undone.",
    variant: "destructive",
    confirmLabel: "Delete",
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};

export const Pending: StoryObj<typeof ConfirmDialog> = {
  args: {
    open: true,
    title: "Processing...",
    description: "Please wait while the operation completes.",
    variant: "destructive",
    isPending: true,
    pendingLabel: "Deleting...",
    confirmLabel: "Delete",
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};

export const Interactive: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState("");

    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          Open dialog
        </button>
        {result && <p style={{ marginTop: 8, fontSize: 14 }}>{result}</p>}
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Confirm action"
          description="Are you sure you want to proceed?"
          onConfirm={() => {
            setResult("Confirmed!");
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

export const CustomLabels: StoryObj<typeof ConfirmDialog> = {
  args: {
    open: true,
    title: "Publish article",
    description: "Make this article visible to all users?",
    confirmLabel: "Publish",
    cancelLabel: "Not yet",
    onOpenChange: () => {},
    onConfirm: () => {},
  },
};
