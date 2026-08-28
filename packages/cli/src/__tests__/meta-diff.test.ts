import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { metaDiffCommand } from "../commands/meta-diff.js";
import { collectSurface, normalizeType } from "../meta/diff-surface.js";
import {
  compareSurfaces,
  emptyExpectations,
  type Expectations,
  type Finding,
} from "../meta/diff.js";
import { writeFileWithDir } from "../utils/fs.js";

/** Two output trees on disk, which is the only form either pipeline leaves behind. */
interface Trees {
  orval: string;
  meta: string;
}

let workspace: string;

beforeEach(async () => {
  workspace = await mkdtemp(join(tmpdir(), "meta-diff-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

/** Write one tree's files and return its root. */
async function writeTree(side: string, files: Record<string, string>): Promise<string> {
  const root = join(workspace, side);
  for (const [path, content] of Object.entries(files)) {
    await writeFileWithDir(join(root, path), content);
  }
  return root;
}

async function diff(
  orvalFiles: Record<string, string>,
  metaFiles: Record<string, string>,
  expectations: Expectations = emptyExpectations(),
): Promise<Finding[]> {
  const trees: Trees = {
    orval: await writeTree("generated", orvalFiles),
    meta: await writeTree("generated-meta", metaFiles),
  };
  return compareSurfaces(
    await collectSurface(trees.orval),
    await collectSurface(trees.meta),
    expectations,
  );
}

function errors(findings: Finding[]): Finding[] {
  return findings.filter((one) => one.level === "error");
}

function notes(findings: Finding[]): Finding[] {
  return findings.filter((one) => one.level === "info");
}

function subjects(findings: Finding[]): string[] {
  return findings.map((one) => one.subject);
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ORVAL_DTO = `export interface NoticeDetailDTO {
  noticeId?: string;
  title?: string;
  viewCount?: number;
}
`;

const META_DTO = `export interface NoticeDetailDTO {
  noticeId?: string;
  title?: string;
  viewCount?: number;
}
`;

const ORVAL_ENDPOINT = `export const getNotice = async (noticeId: string) => fetch(noticeId);

export const getGetNoticeQueryKey = (noticeId: string,) => {
    return [
    \`/api/v1/notice/\${noticeId}\`
    ] as const;
    }

export const useGetNotice = () => useQuery();
`;

const META_ENDPOINT = `export const getNotice = async (noticeId: string) => fetch(noticeId);

export const getGetNoticeQueryKey = (noticeId: string) =>
  [getGetNoticeUrl(noticeId)] as const;

export const useGetNotice = () => useQuery();
`;

const ORVAL_HANDLERS = `export function createNoticeHandlers(store) {
  return [];
}
`;

const META_HANDLERS = `export function createNoticeHandlers(store) {
  return [];
}
`;

const IDENTICAL_ORVAL = {
  "model/noticeDetailDTO.ts": ORVAL_DTO,
  "endpoints/notice/notice.ts": ORVAL_ENDPOINT,
  "mock/handlers.ts": ORVAL_HANDLERS,
};

const IDENTICAL_META = {
  "model/noticeDetailDTO.ts": META_DTO,
  "endpoints/notice.ts": META_ENDPOINT,
  "mock/notice.handlers.ts": META_HANDLERS,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("meta-diff", () => {
  it("reports nothing when the two outputs agree", async () => {
    expect(await diff(IDENTICAL_ORVAL, IDENTICAL_META)).toEqual([]);
  });

  it("reports a removed field as an error", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  noticeId?: string;
  viewCount?: number;
}
`,
    });

    expect(subjects(errors(findings))).toEqual(["NoticeDetailDTO.title"]);
    expect(errors(findings)[0].message).toContain("only in the orval output");
  });

  it("reports a field the meta output added as an error", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  noticeId?: string;
  title?: string;
  viewCount?: number;
  pinned?: boolean;
}
`,
    });

    expect(subjects(errors(findings))).toEqual(["NoticeDetailDTO.pinned"]);
    expect(errors(findings)[0].message).toContain("only in the meta output");
  });

  it("treats an enum field gaining its label as a note", async () => {
    const findings = await diff(
      {
        ...IDENTICAL_ORVAL,
        "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  status?: 'DRAFT' | 'PUBLISHED';
}
`,
      },
      {
        ...IDENTICAL_META,
        "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  status?: LabeledEnumValue<NoticeStatus>;
}
`,
      },
    );

    expect(errors(findings)).toEqual([]);
    expect(subjects(notes(findings))).toEqual(["NoticeDetailDTO.status"]);
    expect(notes(findings)[0].message).toContain("carries its label");
  });

  it("treats a named enum widened to the labeled shape as a note", async () => {
    const findings = await diff(
      {
        ...IDENTICAL_ORVAL,
        "model/noticeDetailDTO.ts": "export interface NoticeDetailDTO { status?: NoticeStatus; }",
      },
      {
        ...IDENTICAL_META,
        "model/noticeDetailDTO.ts":
          "export interface NoticeDetailDTO { status?: LabeledEnumValue<NoticeStatus>; }",
      },
    );

    expect(errors(findings)).toEqual([]);
    expect(subjects(notes(findings))).toEqual(["NoticeDetailDTO.status"]);
  });

  it("reports an unrelated field type change as an error", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  noticeId?: string;
  title?: string;
  viewCount?: string;
}
`,
    });

    expect(subjects(errors(findings))).toEqual(["NoticeDetailDTO.viewCount"]);
    expect(errors(findings)[0].message).toContain("number");
  });

  it("reports a hook-name difference as an error", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "endpoints/notice.ts": META_ENDPOINT.replace("useGetNotice", "useReadNotice"),
    });

    expect(subjects(errors(findings)).sort()).toEqual(["useGetNotice", "useReadNotice"]);
    expect(errors(findings).every((one) => one.message.includes("hook"))).toBe(true);
  });

  it("reports a renamed handler factory as an error", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "mock/notice.handlers.ts": META_HANDLERS.replace(
        "createNoticeHandlers",
        "createNoticeBoardHandlers",
      ),
    });

    // The breakage is the name that went missing: `src/mock/index.ts` imports the factory by name,
    // so losing `createNoticeHandlers` breaks every mocked screen of that entity while the domain
    // package still typechecks. The name that appeared is reported as a note — the meta pipeline
    // emits a factory for every entity and orval skips one whose model it could not read, so a
    // meta-only factory is extra coverage rather than drift.
    expect(subjects(errors(findings))).toEqual(["createNoticeHandlers"]);
    expect(errors(findings).every((one) => one.message.includes("handlers"))).toBe(true);
    expect(subjects(notes(findings))).toContain("createNoticeBoardHandlers");
  });

  it("reports a factory the meta output adds as a note, since orval skips an unreadable model", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "mock/orgType.handlers.ts": META_HANDLERS.replace(
        "createNoticeHandlers",
        "createOrgTypeHandlers",
      ),
    });

    expect(errors(findings)).toEqual([]);
    expect(subjects(notes(findings))).toContain("createOrgTypeHandlers");
  });

  it("reports a zod constant present in only one output as a note", async () => {
    const findings = await diff(
      {
        ...IDENTICAL_ORVAL,
        "endpoints/notice/notice.zod.ts": `export const NoticeRestGetResponse = zod.object({
  noticeId: zod.string(),
});
`,
      },
      {
        ...IDENTICAL_META,
        "schema/notice.schema.ts": `export const NoticeDetailDTOSchema = z.object({
  noticeId: z.string(),
});
`,
      },
    );

    expect(errors(findings)).toEqual([]);
    expect(subjects(notes(findings)).sort()).toEqual([
      "NoticeDetailDTOSchema",
      "NoticeRestGetResponse",
    ]);
  });

  it("reports a query key whose returned array changed arity as an error", async () => {
    const findings = await diff(
      {
        ...IDENTICAL_ORVAL,
        "endpoints/notice/notice.ts": ORVAL_ENDPOINT.replace(
          "`/api/v1/notice/${noticeId}`",
          "`/api/v1/notice/${noticeId}`, ...(params ? [params] : [])",
        ),
      },
      IDENTICAL_META,
    );

    expect(subjects(errors(findings))).toEqual(["getGetNoticeQueryKey"]);
    expect(errors(findings)[0].message).toContain("arity and element order are contract");
  });

  it("accepts a query key whose elements are written differently but keep their shape", async () => {
    const findings = await diff(
      {
        ...IDENTICAL_ORVAL,
        "endpoints/notice/notice.ts": ORVAL_ENDPOINT.replace(
          "`/api/v1/notice/${noticeId}`",
          "`/api/v1/notice/${noticeId}`, ...(params ? [params] : [])",
        ),
      },
      {
        ...IDENTICAL_META,
        "endpoints/notice.ts": META_ENDPOINT.replace(
          "[getGetNoticeUrl(noticeId)]",
          "[noticePath(noticeId), ...(params ? [params] : [])]",
        ),
      },
    );

    expect(findings).toEqual([]);
  });

  it("reports a required field with no primitive or declared ground as an error", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  noticeId?: string;
  title: string;
  viewCount?: number;
}
`,
    });

    expect(subjects(errors(findings))).toEqual(["NoticeDetailDTO.title"]);
    expect(errors(findings)[0].message).toContain("no primitive type or declared ground");
  });

  it("treats a required field of a primitive type as a note", async () => {
    const findings = await diff(IDENTICAL_ORVAL, {
      ...IDENTICAL_META,
      "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  noticeId?: string;
  title?: string;
  viewCount: number;
}
`,
    });

    expect(errors(findings)).toEqual([]);
    expect(subjects(notes(findings))).toEqual(["NoticeDetailDTO.viewCount"]);
    expect(notes(findings)[0].message).toContain("which OpenAPI lost");
  });

  it("treats a required field the project declared ground for as a note", async () => {
    const findings = await diff(
      IDENTICAL_ORVAL,
      {
        ...IDENTICAL_META,
        "model/noticeDetailDTO.ts": `export interface NoticeDetailDTO {
  noticeId?: string;
  title: string;
  viewCount?: number;
}
`,
      },
      { ...emptyExpectations(), requiredFields: ["NoticeDetailDTO.title"] },
    );

    expect(errors(findings)).toEqual([]);
    expect(subjects(notes(findings))).toEqual(["NoticeDetailDTO.title"]);
  });

  it("reports a requirement the meta output lost as an error", async () => {
    const findings = await diff(
      {
        ...IDENTICAL_ORVAL,
        "model/noticeDetailDTO.ts": "export interface NoticeDetailDTO { title: string; }",
      },
      {
        ...IDENTICAL_META,
        "model/noticeDetailDTO.ts": "export interface NoticeDetailDTO { title?: string; }",
      },
    );

    expect(subjects(errors(findings))).toEqual(["NoticeDetailDTO.title"]);
    expect(errors(findings)[0].message).toContain("optional in the meta output");
  });

  it("folds a declared rename into one note instead of two errors", async () => {
    const findings = await diff(
      IDENTICAL_ORVAL,
      {
        ...IDENTICAL_META,
        "endpoints/notice.ts": META_ENDPOINT.replace("useGetNotice", "useGetPublicUserAvatar"),
      },
      {
        ...emptyExpectations(),
        renames: [
          {
            orval: "useGetNotice",
            meta: "useGetPublicUserAvatar",
            reason: "the IR follows the @Tag annotation and orval does not",
          },
        ],
      },
    );

    expect(errors(findings)).toEqual([]);
    expect(notes(findings)).toHaveLength(1);
    expect(notes(findings)[0].message).toContain("@Tag annotation");
  });

  it("folds a declared tag split into one note", async () => {
    const findings = await diff(
      IDENTICAL_ORVAL,
      {
        ...IDENTICAL_META,
        "endpoints/notice.ts": `export const getNotice = async (noticeId: string) => fetch(noticeId);

export const getGetNoticeQueryKey = (noticeId: string) =>
  [getGetNoticeUrl(noticeId)] as const;

export const useGetAvatar = () => useQuery();
export const useGetAvatarThumbnail = () => useQuery();
`,
      },
      {
        ...emptyExpectations(),
        renames: [{ orval: "useGetNotice", meta: ["useGetAvatar", "useGetAvatarThumbnail"] }],
      },
    );

    expect(errors(findings)).toEqual([]);
    expect(notes(findings)).toHaveLength(1);
  });

  it("keeps a declared rename as errors when only half of it holds", async () => {
    const findings = await diff(IDENTICAL_ORVAL, IDENTICAL_META, {
      ...emptyExpectations(),
      renames: [{ orval: "useGetNotice", meta: "useGetPublicUserAvatar" }],
    });

    // `useGetNotice` is present on both sides, so the declared rename never happened and the
    // expectation must not silence anything.
    expect(findings).toEqual([]);
  });

  it("reports a declared one-sided name as a note", async () => {
    const findings = await diff(
      {
        ...IDENTICAL_ORVAL,
        "model/bodyObject.ts": "export type BodyObject = { [key: string]: unknown };",
      },
      IDENTICAL_META,
      { ...emptyExpectations(), ignore: ["BodyObject"] },
    );

    expect(errors(findings)).toEqual([]);
    expect(subjects(notes(findings))).toEqual(["BodyObject"]);
  });
});

describe("meta-diff surface collection", () => {
  it("excludes orval's per-operation plumbing rather than reporting it", async () => {
    const surface = await collectSurface(
      await writeTree("generated", {
        "model/noticeDetailDTO.ts": ORVAL_DTO,
        "model/getNotice401.ts": "export type GetNotice401 = { code?: string };",
        "model/listNotices200BodyPageable.ts":
          "export type ListNotices200BodyPageable = { page?: number };",
        "endpoints/notice/notice.ts": `export type getNoticeResponse200 = { data: string };
export type getNoticeResponseSuccess = { data: string };
export type GetNoticeQueryResult = string;
export type GetNoticeQueryError = string;
export const getGetNoticeQueryOptions = () => ({});
export const getUpdateNoticeMutationOptions = () => ({});
`,
      }),
    );

    expect([...surface.declarations.keys()]).toEqual(["NoticeDetailDTO"]);
    expect(surface.excluded).toBe(8);
  });

  it("keeps a params type and an as-const map in the comparison", async () => {
    const surface = await collectSurface(
      await writeTree("generated", {
        "model/listNoticesParams.ts": "export type ListNoticesParams = { page?: number };",
        "model/noticeStatus.ts": `export type NoticeStatus = typeof NoticeStatus[keyof typeof NoticeStatus];

export const NoticeStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
`,
      }),
    );

    expect(surface.declarations.get("ListNoticesParams")?.category).toBe("params");
    expect(surface.declarations.get("NoticeStatus")?.category).toBe("constMap");
  });

  it("reads the members of an intersection alias the way orval writes a composed schema", async () => {
    const surface = await collectSurface(
      await writeTree("generated", {
        "model/noticeEnvelope.ts":
          "export type NoticeEnvelope = ({ status?: string }) & { data?: NoticeDetailDTO };",
      }),
    );

    const members = surface.declarations.get("NoticeEnvelope")?.members;
    expect([...(members?.keys() ?? [])].sort()).toEqual(["data", "status"]);
  });

  it("reads a query key from both the block body and the concise body", async () => {
    const surface = await collectSurface(
      await writeTree("generated", {
        "a.ts": `export const getGetOneQueryKey = (id: string,) => {
    return [
    \`/api/one/\${id}\`, ...(params ? [params] : [])
    ] as const;
    }
`,
        "b.ts":
          "export const getGetTwoQueryKey = (id: string) => [getGetTwoUrl(id), ...(params ? [params] : [])] as const;",
      }),
    );

    expect(surface.declarations.get("getGetOneQueryKey")?.queryKeyShape).toEqual([
      "value",
      "spread",
    ]);
    expect(surface.declarations.get("getGetTwoQueryKey")?.queryKeyShape).toEqual([
      "value",
      "spread",
    ]);
  });

  it("does not mistake an optional marker or a generic argument for part of a type", async () => {
    const surface = await collectSurface(
      await writeTree("generated", {
        "model/thing.ts": `export interface Thing {
  tags?: Array<string | null>;
  owner: LabeledEnumValue<Role>;
}
`,
      }),
    );

    const members = surface.declarations.get("Thing")?.members;
    expect(members?.get("tags")).toEqual({
      name: "tags",
      type: "Array<string | null>",
      optional: true,
    });
    expect(members?.get("owner")).toEqual({
      name: "owner",
      type: "LabeledEnumValue<Role>",
      optional: false,
    });
  });
});

describe("normalizeType", () => {
  it("settles quoting and whitespace", () => {
    expect(normalizeType("  'A'  ")).toBe('"A"');
  });

  it("removes union order without splitting an inner union", () => {
    expect(normalizeType("'B' | 'A'")).toBe('"A" | "B"');
    expect(normalizeType("Array<'B' | 'A'>")).toBe('Array<"B" | "A">');
  });
});

describe("metaDiffCommand", () => {
  it("is registered as `meta-diff` and takes the domain as its argument", () => {
    expect(metaDiffCommand.name()).toBe("meta-diff");
    expect(metaDiffCommand.usage()).toContain("<domain>");
  });

  it("says in its description that both trees must come from one run", () => {
    expect(metaDiffCommand.description()).toContain("same `simplix openapi` run");
  });
});
