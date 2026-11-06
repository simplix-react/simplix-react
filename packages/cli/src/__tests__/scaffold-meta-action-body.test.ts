import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import type { DtoMeta } from "../meta/types.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import { resolveMeta } from "../meta/resolve.js";
import { buildMetaScaffoldSource, withFlatReferenceNames, withReferenceKeys } from "../meta/scaffold-source.js";
import { withContractKinds } from "../commands/scaffold-crud.js";

const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as { simplixBootNaming: OpenApiNamingStrategy };

const text = (name: string) => ({ name, type: { kind: "string" }, required: false, nullable: true });
const count = (name: string) => ({ name, type: { kind: "number", integral: true }, required: false, nullable: true });
const wrapped = (name: string) => ({ kind: "container", name: "SimpliXApiResponse", args: [{ kind: "ref", name }] });

/** An entity read by `get` and written only through a custom `adjust` action. */
const meta = {
  version: 1,
  enums: {},
  types: {
    WalletDetailDTO: { javaClass: "x.WalletDetailDTO", typeParams: [], fields: [text("walletId"), text("ownerName"), count("balance"), count("held"), { name: "active", type: { kind: "boolean" }, required: true, nullable: false, defaultValue: true }, { ...text("voiceCode"), reference: { entity: "CatalogVoice", idField: "voiceCode", many: false } }, text("catalogVoiceName"), { ...text("ownerId"), reference: { entity: "UserAccount", idField: "userId", many: false } }] },
    WalletAdjustDTO: { javaClass: "x.WalletAdjustDTO", typeParams: [], fields: [count("amount"), text("reason")] },
  },
  operations: [
    {
      id: "WalletRest_get",
      method: "GET",
      path: "/api/v1/wallet/{walletId}",
      tag: "admin.Wallet",
      request: { query: [], path: [{ name: "walletId", type: { kind: "string" }, required: true }] },
      response: wrapped("WalletDetailDTO"),
    },
    {
      id: "WalletRest_adjust",
      method: "POST",
      path: "/api/v1/wallet/{walletId}/adjust",
      tag: "admin.Wallet",
      request: { query: [], path: [{ name: "walletId", type: { kind: "string" }, required: true }], body: { kind: "ref", name: "WalletAdjustDTO" } },
      response: wrapped("WalletDetailDTO"),
    },
  ],
} as unknown as DtoMeta;

describe("the DTO a scaffold reads an entity from", () => {
  it("reads an entity written only through a custom action from the record it answers with", () => {
    const resolved = resolveMeta(meta, {
      domains: { wallet: ["admin.Wallet"] },
      containerTypes: { SimpliXApiResponse: { unwrap: true } },
    });
    const domain = resolved.domains.get("wallet");
    if (!domain) throw new Error("no wallet domain");
    const source = buildMetaScaffoldSource({ domain, tag: "admin.Wallet", naming: simplixBootNaming });
    expect(source.fieldSource).toEqual({ type: "WalletDetailDTO", origin: "response" });
    expect(source.fields.map((one) => one.name)).not.toContain("reason");
  });
});

describe("a field SimpliX Meta states a default for", () => {
  it("carries the default as a literal the form template writes", () => {
    const resolved = resolveMeta(meta, { domains: { wallet: ["admin.Wallet"] }, containerTypes: { SimpliXApiResponse: { unwrap: true } } });
    const domain = resolved.domains.get("wallet");
    if (!domain) throw new Error("no wallet domain");
    const source = buildMetaScaffoldSource({ domain, tag: "admin.Wallet", naming: simplixBootNaming });
    expect(source.fields.find((one) => one.name === "active")?.defaultLiteral).toBe("true");
    expect(source.fields.find((one) => one.name === "balance")?.defaultLiteral).toBeUndefined();
  });
});

describe("a key SimpliX Meta names as a reference", () => {
  it("is a reference column whatever its suffix, opening the referenced entity by the field it matches", () => {
    const resolved = resolveMeta(meta, { domains: { wallet: ["admin.Wallet"] }, containerTypes: { SimpliXApiResponse: { unwrap: true } } });
    const domain = resolved.domains.get("wallet");
    if (!domain) throw new Error("no wallet domain");
    const source = buildMetaScaffoldSource({ domain, tag: "admin.Wallet", naming: simplixBootNaming });
    const document = { ...meta, entities: { CatalogVoice: { idField: "catalogVoiceId" }, UserAccount: { idField: "userId" } } } as DtoMeta;
    withReferenceKeys(document, source);
    withFlatReferenceNames(document, "Wallet", source);
    const out = withContractKinds(source.fields, "walletId");
    expect(out.find((f) => f.name === "voiceCode")).toMatchObject({ contractKind: "reference", peekKind: "catalogVoice", nameField: "catalogVoiceName", peekBy: "voiceCode" });
    // Matched on the target's identifier, the reference needs no `peekBy`, and its stem still names its name field.
    expect(out.find((f) => f.name === "ownerId")).toMatchObject({ contractKind: "reference", peekKind: "userAccount", nameField: "ownerName" });
    expect(out.find((f) => f.name === "ownerId")?.peekBy).toBeUndefined();
  });
});

describe("a key SimpliX Meta names as a reference by kind", () => {
  it("opens the peek of each served kind and leaves a kind with no served entity without one", () => {
    const byKind = structuredClone(meta) as typeof meta;
    const detail = byKind.types.WalletDetailDTO.fields;
    const owner = detail.findIndex((one) => one.name === "ownerId");
    detail[owner] = { ...text("ownerId"), reference: { many: false, kindField: "ownerType", kinds: { TEAM: "Team", USER: "UserAccount" } } } as never;
    const resolved = resolveMeta(byKind as never, { domains: { wallet: ["admin.Wallet"] }, containerTypes: { SimpliXApiResponse: { unwrap: true } } });
    const domain = resolved.domains.get("wallet");
    if (!domain) throw new Error("no wallet domain");
    const source = buildMetaScaffoldSource({ domain, tag: "admin.Wallet", naming: simplixBootNaming });
    const document = { ...byKind, entities: { CatalogVoice: { idField: "catalogVoiceId" }, UserAccount: { idField: "userId" } } } as DtoMeta;
    withReferenceKeys(document, source);
    withFlatReferenceNames(document, "Wallet", source);
    const out = withContractKinds(source.fields, "walletId", { peeks: { owner: "userAccount" } });
    expect(out.find((f) => f.name === "ownerId")).toMatchObject({
      contractKind: "reference",
      nameField: "ownerName",
      peekKinds: { field: "ownerType", kinds: [{ value: "USER", peekKind: "userAccount" }] },
    });
    expect(out.find((f) => f.name === "ownerId")?.peekKind).toBeUndefined();
  });
});

describe("the order a scaffolded list opens in", () => {
  const listed = (defaultSort?: { field: string; direction: "asc" | "desc" }) =>
    ({
      ...meta,
      operations: [
        ...meta.operations,
        {
          id: "WalletRest_search",
          method: "GET",
          path: "/api/v1/wallet/search",
          tag: "admin.Wallet",
          request: { query: [], path: [] },
          response: { kind: "container", name: "SimpliXApiResponse", args: [{ kind: "container", name: "Page", args: [{ kind: "ref", name: "WalletDetailDTO" }] }] },
          ...(defaultSort ? { defaultSort } : {}),
        },
      ],
    }) as unknown as DtoMeta;
  const sourceOf = (document: DtoMeta) => {
    const domain = resolveMeta(document, { domains: { wallet: ["admin.Wallet"] }, containerTypes: { SimpliXApiResponse: { unwrap: true } } }).domains.get("wallet");
    if (!domain) throw new Error("no wallet domain");
    return buildMetaScaffoldSource({ domain, tag: "admin.Wallet", naming: simplixBootNaming });
  };

  it("takes the order the list's own operation declares", () => {
    expect(sourceOf(listed({ field: "balance", direction: "desc" })).defaultSort).toEqual({ field: "balance", direction: "desc" });
  });

  it("states none of its own where the operation declares none, leaving the entity's to apply", () => {
    expect(sourceOf(listed()).defaultSort).toBeUndefined();
  });
});
