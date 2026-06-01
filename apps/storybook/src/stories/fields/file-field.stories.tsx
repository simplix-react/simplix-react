import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";

// ── B8 Mock API ───────────────────────────────────────────────────────────────
// FileFieldApi mock with all 6 methods.
// - upload: simulates progress (0->50->100) then returns a fake AttachmentRecord
// - list: returns []
// - delete, reorder, updateDescription, setRepresentative: resolve immediately

type AttachmentRecord = NonNullable<
  Parameters<(typeof FormFields.FileField)>[0]["value"]
>[number]

type FileFieldApi = NonNullable<Parameters<(typeof FormFields.FileField)>[0]["api"]>

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

let mockIdCounter = 100

function createMockApi(): FileFieldApi {
  return {
    async upload(file, onProgress) {
      onProgress?.(0)
      await sleep(300)
      onProgress?.(50)
      await sleep(300)
      onProgress?.(100)
      const id = String(++mockIdCounter)
      const record: AttachmentRecord = {
        attachmentId: id,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url: URL.createObjectURL(file),
        thumbnailUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        representative: false,
        sortOrder: mockIdCounter,
      }
      return record
    },

    async list() {
      return []
    },

    async delete(_attachmentId) {
      await sleep(100)
    },

    async reorder(_orders) {
      await sleep(100)
    },

    async updateDescription(_attachmentId, dto) {
      await sleep(100)
      return { descriptionI18n: dto.descriptionI18n }
    },

    async setRepresentative(_attachmentId) {
      await sleep(100)
    },
  }
}

const mockApi = createMockApi()

// ── FileFieldDemo ─────────────────────────────────────────────────────────────

function FileFieldDemo() {
  const [value, setValue] = React.useState<AttachmentRecord[]>([])

  return (
    <div className="max-w-xl p-4">
      <FormFields.FileField
        label="Attachments"
        value={value}
        onChange={setValue}
        api={mockApi}
        config={{
          maxAttachments: 10,
          maxFileSize: 5 * 1024 * 1024,
        }}
        languages={[
          { code: "en", name: "English", englishName: "English" },
          { code: "ko", name: "한국어", englishName: "Korean" },
        ]}
        required
      />
      <pre className="mt-4 rounded bg-muted p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

// ── Storybook meta ────────────────────────────────────────────────────────────

const meta = {
  title: "Fields/Form/FileField",
  component: FormFields.FileField,
  tags: ["autodocs"],
  args: {
    value: [],
    onChange: () => {},
    api: mockApi,
  },
} satisfies Meta<typeof FormFields.FileField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <FileFieldDemo />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="max-w-xl p-4">
      <FormFields.FileField
        label="Documents"
        value={[]}
        onChange={() => {}}
        api={mockApi}
        config={{ maxAttachments: 5 }}
      />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="max-w-xl p-4">
      <FormFields.FileField
        label="Required files"
        value={[]}
        onChange={() => {}}
        api={mockApi}
        error="At least one file is required"
        required
      />
    </div>
  ),
};
