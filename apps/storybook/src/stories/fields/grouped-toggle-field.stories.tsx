import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FormFields } from "@simplix-react/ui";
import type { GroupedToggleGroup } from "@simplix-react/ui";

const meta = {
  title: "Fields/Form/GroupedToggleField",
  component: FormFields.GroupedToggleField,
  tags: ["autodocs"],
  args: {
    value: {},
    onChange: () => {},
    groups: [],
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["top", "left", "inline", "hidden"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    columns: {
      control: { type: "number", min: 1, max: 6 },
    },
  },
} satisfies Meta<typeof FormFields.GroupedToggleField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Allowed file types (mirrors the design request — globally-unique MIME values) ──
const fileTypeGroups: GroupedToggleGroup[] = [
  {
    id: "image",
    label: "이미지",
    icon: "image",
    options: [
      { value: "image/jpeg", label: "JPG" },
      { value: "image/png", label: "PNG" },
      { value: "image/webp", label: "WebP" },
      { value: "image/svg+xml", label: "SVG" },
    ],
  },
  {
    id: "doc",
    label: "문서",
    icon: "file-text",
    options: [
      { value: "application/pdf", label: "PDF" },
      { value: "application/msword", label: "DOCX" },
      { value: "application/vnd.ms-excel", label: "XLSX" },
      { value: "application/x-hwp", label: "HWP" },
    ],
  },
  {
    id: "archive",
    label: "압축",
    icon: "archive",
    options: [
      { value: "application/zip", label: "ZIP" },
      { value: "application/x-7z-compressed", label: "7Z" },
    ],
  },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Record<string, string[]>>(
      args.value ?? {},
    );
    return (
      <div className="max-w-3xl">
        <FormFields.GroupedToggleField
          {...args}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  args: {
    label: "허용 파일 형식",
    description: "업로드를 허용할 파일 형식을 그룹별로 선택하세요.",
    selectAllLabel: "전체",
    value: {
      image: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      doc: ["application/pdf", "application/msword"],
      archive: [],
    },
    groups: fileTypeGroups,
  },
};

export const WithOtherNote: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Record<string, string[]>>(
      args.value ?? {},
    );
    return (
      <div className="max-w-3xl">
        <FormFields.GroupedToggleField
          {...args}
          value={value}
          onChange={setValue}
          renderOtherNote={(info) => (
            <>
              이 외에 추가로 등록된 파일 형식이{" "}
              <strong className="text-foreground">{info.count}개</strong> 있습니다.
            </>
          )}
        />
      </div>
    );
  },
  args: {
    label: "허용 파일 형식",
    selectAllLabel: "전체",
    // image/heic and font/woff2 are not in any catalog → surfaced by renderOtherNote.
    value: {
      image: ["image/jpeg", "image/png", "image/heic"],
      doc: ["application/pdf"],
      archive: ["font/woff2"],
    },
    groups: fileTypeGroups,
  },
};

export const WithDisabledChip: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Record<string, string[]>>(
      args.value ?? {},
    );
    return (
      <div className="max-w-3xl">
        <FormFields.GroupedToggleField
          {...args}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  args: {
    label: "허용 파일 형식",
    description: "SVG는 보안 정책상 고정 비활성입니다.",
    selectAllLabel: "전체",
    value: { image: ["image/jpeg"] },
    groups: [
      {
        id: "image",
        label: "이미지",
        icon: "image",
        options: [
          { value: "image/jpeg", label: "JPG" },
          { value: "image/png", label: "PNG" },
          { value: "image/svg+xml", label: "SVG", disabled: true },
        ],
      },
    ],
  },
};

// ── Permission scopes — reused action values across subject groups (packages/access shape) ──
const permissionGroups: GroupedToggleGroup[] = [
  {
    id: "Pet",
    label: "Pet",
    icon: "paw-print",
    options: [
      { value: "list", label: "조회" },
      { value: "view", label: "상세" },
      { value: "create", label: "생성" },
      { value: "delete", label: "삭제" },
    ],
  },
  {
    id: "Order",
    label: "Order",
    icon: "shopping-cart",
    options: [
      { value: "list", label: "조회" },
      { value: "view", label: "상세" },
      { value: "create", label: "생성" },
      { value: "delete", label: "삭제" },
    ],
  },
];

export const PermissionScopes: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Record<string, string[]>>(
      args.value ?? {},
    );
    return (
      <div className="max-w-2xl">
        <FormFields.GroupedToggleField
          {...args}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  args: {
    label: "역할 권한",
    description:
      "동일한 action(list/view/...)이 subject마다 독립적으로 토글됩니다.",
    selectAllLabel: "전체",
    columns: 2,
    value: { Pet: ["list", "view"], Order: ["list"] },
    groups: permissionGroups,
  },
};

export const Required: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Record<string, string[]>>(
      args.value ?? {},
    );
    return (
      <div className="max-w-3xl">
        <FormFields.GroupedToggleField
          {...args}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  args: {
    label: "허용 파일 형식",
    required: true,
    selectAllLabel: "전체",
    error: "최소 한 가지 형식을 선택하세요.",
    value: {},
    groups: fileTypeGroups,
  },
};
