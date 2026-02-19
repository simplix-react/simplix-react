"use client";

import { CrudDetail, DetailFields } from "@simplix-react/ui";

interface Order {
  id: string;
  name: string;
}

interface OrderDetailProps {
  data: Order;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function OrderDetail({ data, onEdit, onDelete }: OrderDetailProps) {
  return (
    <CrudDetail>
      <CrudDetail.Section title="Order Information">
        <DetailFields.TextField
          label="ID"
          value={String(data.id ?? "")}
        />
        <DetailFields.TextField
          label="Name"
          value={String(data.name ?? "")}
        />
      </CrudDetail.Section>

      <CrudDetail.Actions>
        <button type="button" onClick={onEdit} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Edit
        </button>
        <button type="button" onClick={onDelete} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
          Delete
        </button>
      </CrudDetail.Actions>
    </CrudDetail>
  );
}
