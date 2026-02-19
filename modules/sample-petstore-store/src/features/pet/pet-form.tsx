"use client";

import { type FormEvent, useCallback, useState } from "react";

import { CrudForm, FormFields } from "@simplix-react/ui";

export interface PetFormValues {
  id: string;
  name: string;
}

interface PetFormProps {
  defaultValues?: Partial<PetFormValues>;
  onSubmit: (values: PetFormValues) => void;
  onCancel?: () => void;
}

export function PetForm({ defaultValues, onSubmit, onCancel }: PetFormProps) {
  const [id, setId] = useState<string>(defaultValues?.id ?? "");
  const [name, setName] = useState<string>(defaultValues?.name ?? "");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      onSubmit({ id, name });
    },
    [onSubmit, id, name],
  );

  return (
    <CrudForm onSubmit={handleSubmit}>
      <CrudForm.Section title="Pet Information">
        <FormFields.TextField
          label="ID"
          value={id}
          onChange={setId}
        />
        <FormFields.TextField
          label="Name"
          value={name}
          onChange={setName}
        />
      </CrudForm.Section>

      <CrudForm.Actions>
        {onCancel && (
          <button type="button" onClick={onCancel} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Cancel
          </button>
        )}
        <button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save Pet
        </button>
      </CrudForm.Actions>
    </CrudForm>
  );
}
