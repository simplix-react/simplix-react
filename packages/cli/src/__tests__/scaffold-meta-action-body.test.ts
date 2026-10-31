import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import type { DtoMeta } from "../meta/types.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import { resolveMeta } from "../meta/resolve.js";
import { buildMetaScaffoldSource } from "../meta/scaffold-source.js";

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
    WalletDetailDTO: { javaClass: "x.WalletDetailDTO", typeParams: [], fields: [text("walletId"), text("ownerName"), count("balance"), count("held")] },
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
