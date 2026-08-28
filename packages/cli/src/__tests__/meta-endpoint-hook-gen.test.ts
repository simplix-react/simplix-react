import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, it, expect } from "vitest";
import type { DtoMeta } from "../meta/ir-types.js";
import type {
  OpenApiNamingStrategy,
  OperationContext,
} from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { resolveMeta } from "../meta/resolve.js";
import type { ResolvedDomain } from "../meta/resolve.js";
import { generateEndpointFiles, resolveEndpoints } from "../meta/generation/endpoint-gen.js";
import { generateHookFiles } from "../meta/generation/hook-gen.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";

const fixturePath = fileURLToPath(
  new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url),
);
const meta: DtoMeta = JSON.parse(readFileSync(fixturePath, "utf-8"));

/** What the simplix-boot profile contributes: the containers each become in TypeScript. */
const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

/**
 * The other half of what the profile contributes, loaded from the extension it lives in.
 *
 * The names are the point of the assertions below — module code imports hooks by name and
 * `crud.config.ts` resolves a role to one — so a strategy written for the test would prove only
 * that the generator can spell whatever it is handed. The CLI cannot depend on the extension,
 * which depends on it, and a static import would put the extension's source inside the CLI's
 * program; the specifier is therefore built rather than written, which keeps it out of the
 * program and leaves the runtime import to resolve it.
 */
const namingModule = fileURLToPath(
  new URL(
    "../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts",
    import.meta.url,
  ),
);
const { simplixBootNaming } = (await import(namingModule)) as {
  simplixBootNaming: OpenApiNamingStrategy;
};

const resolved = resolveMeta(meta, { domains: smartSafetyDomains, containerTypes });

function domainOf(name: string): ResolvedDomain {
  const domain = resolved.domains.get(name);
  if (!domain) throw new Error(`the fixture has no domain named ${name}`);
  return domain;
}

const org = domainOf("org");
const orgEndpoints = generateEndpointFiles(org, { naming: simplixBootNaming });
const orgHooks = generateHookFiles(org, { naming: simplixBootNaming });

function endpointFile(entity: string): string {
  const content = orgEndpoints.files.get(`endpoints/${entity}.ts`);
  if (content === undefined) throw new Error(`no endpoint module was emitted for ${entity}`);
  return content;
}

function hookFile(entity: string): string {
  const content = orgHooks.files.get(`hooks/${entity}.ts`);
  if (content === undefined) throw new Error(`no hook module was emitted for ${entity}`);
  return content;
}

/** The declaration of one hook, from its `export` to the line the next declaration opens on. */
function declaration(content: string, name: string): string {
  const at = content.search(new RegExp(`^export (?:function|const) ${name}\\b`, "m"));
  if (at < 0) throw new Error(`${name} is not declared`);
  const next = content.slice(at + 1).search(/^(?:\/\*\*|export )/m);
  return next < 0 ? content.slice(at) : content.slice(at, at + 1 + next);
}

describe("generateHookFiles names every hook the CRUD map records", () => {
  it("emits the twelve organization hooks under the names crud.config.ts stores", () => {
    // Measured from the app's own `crud.config.ts`, which keeps each role's hook name without its
    // `use` prefix. A renamed hook breaks the scaffolder rather than the domain package, so the
    // failure surfaces nowhere near the generator.
    const organization = orgHooks.entities.find((entry) => entry.entity === "organization");
    expect(organization?.roles).toEqual({
      list: "listOrganizations",
      get: "getOrganization",
      getForEdit: "getOrganizationForEdit",
      tree: "getOrganizationTree",
      subtree: "getOrganizationSubtree",
      create: "createOrganization",
      update: "updateOrganization",
      delete: "deleteOrganization",
      batchUpdate: "batchUpdateOrganizations",
      batchDelete: "batchDeleteOrganizations",
      order: "orderOrganization",
      org: "orgOrganization",
    });
    expect(orgHooks.entities.find((entry) => entry.entity === "orgType")?.roles).toEqual({
      getAll: "getAllOrgTypes",
    });
  });

  it("declares a query as a function and a mutation as a const", () => {
    const organization = hookFile("organization");
    for (const name of [
      "useListOrganizations",
      "useGetOrganization",
      "useGetOrganizationForEdit",
      "useGetOrganizationTree",
      "useGetOrganizationSubtree",
    ]) {
      expect(organization, name).toContain(`export function ${name}<`);
    }
    for (const name of [
      "useCreateOrganization",
      "useUpdateOrganization",
      "useDeleteOrganization",
      "useBatchUpdateOrganizations",
      "useBatchDeleteOrganizations",
      "useOrderOrganization",
      "useOrgOrganization",
    ]) {
      expect(organization, name).toContain(`export const ${name} = <`);
    }
  });

  it("names an entity from its tag alone, which is what the profile reads", () => {
    expect(resolveEndpoints(domainOf("site"), simplixBootNaming).map((one) => one.entity)).toEqual([
      "areaZone",
      "equipmentInspection",
      "equipmentJudgement",
      "linearAsset",
      "safetyZonePolicy",
      "siteOnboarding",
      "workPoint",
    ]);
  });
});

describe("generateHookFiles and the positions its callers rely on", () => {
  it("takes a query's path parameters first, then the options, then the client", () => {
    // `form.hbs` writes `useGetXForEdit(id, { query: { gcTime: 0 } })`, so options in any other
    // position are ignored without a word and the edit form serves the cached record.
    expect(declaration(hookFile("organization"), "useGetOrganizationForEdit")).toContain(
      [
        "  orgId: string,",
        "  options?: {",
        "    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getOrganizationForEdit>>, TError, TData>>;",
        "    request?: Parameters<typeof customFetch>[1];",
        "  },",
        "  queryClient?: QueryClient,",
      ].join("\n"),
    );
  });

  it("gives a list hook two positional arguments, the parameters and the options", () => {
    // `adaptOrvalList` calls `useApiHook(apiParams, { query: queryOpts })` and types both as
    // `any`, so an arity of anything else compiles and renders an empty list.
    const list = declaration(hookFile("organization"), "useListOrganizations");
    expect(list).toContain(
      [
        "  params?: ListOrganizationsParams,",
        "  options?: {",
        "    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listOrganizations>>, TError, TData>>;",
        "    request?: Parameters<typeof customFetch>[1];",
        "  },",
        "  queryClient?: QueryClient,",
      ].join("\n"),
    );
  });

  it("returns what React Query returned, so an unreachable server is not an empty table", () => {
    // `useCrudList` reads `isPaused` and `failureCount` off the result to tell the two apart;
    // a reshaped subset carries neither and reports "no data" while the network is down.
    const list = declaration(hookFile("organization"), "useListOrganizations");
    expect(list).toContain("): UseQueryResult<TData, TError> {");
    expect(list).toContain("  return useQuery(");
    expect(list).toContain("  ) as UseQueryResult<TData, TError>;");
    expect(list).not.toContain("data:");
    expect(list).not.toContain("isLoading:");
  });

  it("waits for a path parameter rather than reading a record called undefined", () => {
    expect(declaration(hookFile("organization"), "useGetOrganization")).toContain(
      "      enabled: orgId !== null && orgId !== undefined,",
    );
    // The caller's own `enabled` is spread after this one and still wins.
    expect(declaration(hookFile("organization"), "useGetOrganization")).toContain(
      "      ...queryOptions,",
    );
  });

  it("carries a mutation's path parameter beside its data, never inside it", () => {
    // `adaptOrvalUpdate(m, "orgId")` sends `{ orgId: id, data: { …dto, orgId: id } }`, and
    // `adaptOrvalDelete` sends `{ orgId: id }` alone.
    const organization = hookFile("organization");
    expect(organization).toContain(
      ["export type UpdateOrganizationVariables = {", "  orgId: string;", "  data: BodyType<OrganizationUpdateDTO>;", "};"].join(
        "\n",
      ),
    );
    expect(organization).toContain(
      ["export type CreateOrganizationVariables = {", "  data: BodyType<OrganizationCreateDTO>;", "};"].join("\n"),
    );
    expect(organization).toContain(
      ["export type DeleteOrganizationVariables = {", "  orgId: string;", "};"].join("\n"),
    );
    expect(declaration(organization, "useUpdateOrganization")).toContain(
      "= ({ orgId, data }) =>\n    updateOrganization(orgId, data, requestOptions);",
    );
  });

  it("types a container body as the array it is", () => {
    // 49 of the fixture's 231 bodies are containers; a multi-update takes the list, not one DTO.
    expect(hookFile("organization")).toContain(
      "  data: BodyType<OrganizationOrderUpdateDTO[]>;",
    );
    expect(endpointFile("organization")).toContain(
      "  organizationOrderUpdateDTO: OrganizationOrderUpdateDTO[],",
    );
  });
});

describe("generateEndpointFiles writes the request half", () => {
  it("sends a read through the mutator, with the URL its own builder made", () => {
    expect(endpointFile("organization")).toContain(
      [
        "export const getOrganization = async (",
        "  orgId: string,",
        "  options?: Parameters<typeof customFetch>[1],",
        "): Promise<GetOrganizationResponse> =>",
        "  customFetch<GetOrganizationResponse>(getGetOrganizationUrl(orgId), {",
        "    ...options,",
        "    method: 'GET',",
        "  });",
      ].join("\n"),
    );
  });

  it("sends a body as JSON, and says so in the headers", () => {
    expect(endpointFile("organization")).toContain(
      [
        "    method: 'PUT',",
        "    headers: { 'Content-Type': 'application/json', ...options?.headers },",
        "    body: JSON.stringify(organizationUpdateDTO),",
      ].join("\n"),
    );
  });

  it("interpolates a path parameter the IR already spells in braces", () => {
    // All 311 path parameters arrive as `{name}`, which is also the form the naming strategy
    // reads, so nothing here converts a path.
    const paths: string[] = [];
    const spy: OpenApiNamingStrategy = {
      resolveEntityName: (context) => simplixBootNaming.resolveEntityName(context),
      resolveOperation: (context: OperationContext) => {
        paths.push(context.path);
        expect(context.extensions).toEqual({});
        expect(context.description).toBeUndefined();
        return simplixBootNaming.resolveOperation(context);
      },
    };
    resolveEndpoints(org, spy);
    expect(paths).toContain("/api/v1/admin/org/{orgId}/edit");
    expect(paths.every((path) => !path.includes(":"))).toBe(true);

    expect(endpointFile("organization")).toContain(
      "export const getGetOrganizationUrl = (orgId: string): string => `/api/v1/admin/org/${orgId}`;",
    );
    // A parameter inside a segment is interpolated where it stands, not only after a slash.
    const user = generateEndpointFiles(domainOf("user"), { naming: simplixBootNaming });
    expect(user.files.get("endpoints/avatar.ts")).toContain(
      "`/api/v1/public/user/${userId}-avatar-${size}.${ext}`",
    );
  });

  it("emits a query key per query, and none for a mutation", () => {
    const organization = endpointFile("organization");
    expect(organization).toContain(
      [
        "export const getGetOrganizationQueryKey = (orgId: string) =>",
        "  [getGetOrganizationUrl(orgId)] as const;",
      ].join("\n"),
    );
    // The key carries the route without its query string, so one invalidation reaches every
    // page of the same list.
    expect(organization).toContain(
      [
        "export const getListOrganizationsQueryKey = (params?: ListOrganizationsParams) =>",
        "  [listOrganizationsPath(), ...(params ? [params] : [])] as const;",
      ].join("\n"),
    );
    expect(organization).not.toContain("getUpdateOrganizationQueryKey");
    expect(organization).not.toContain("getDeleteOrganizationQueryKey");
  });

  it("resolves a request to what the envelope held, and to nothing when it held nothing", () => {
    const organization = endpointFile("organization");
    expect(organization).toContain("export type GetOrganizationResponse = OrganizationDetailDTO;");
    expect(organization).toContain(
      "export type ListOrganizationsResponse = SpringPage<OrganizationListDTO>;",
    );
    expect(organization).toContain(
      "export type GetOrganizationTreeResponse = OrganizationListDTO[];",
    );
    // 109 of the 648 envelopes carry no body at all.
    expect(organization).toContain("export type DeleteOrganizationResponse = void;");
    // The envelope reaches no client type: the mutator has already stripped it.
    for (const [path, content] of orgEndpoints.files) {
      expect(content, path).not.toContain("SimpliXApiResponse");
    }
    expect(organization).toContain(
      "import type { SpringPage } from '@simplix-react-ext/simplix-boot-auth';",
    );
  });

  it("imports a searchable route's parameters rather than declaring them", () => {
    // The filters are the search DTO's, not the route's: the IR states no query parameter for
    // them, and the search generator writes the type into the model directory beside the DTOs.
    const organization = endpointFile("organization");
    expect(organization).toContain(
      "import type { ListOrganizationsParams } from '../model/listOrganizationsParams';",
    );
    expect(organization).not.toContain("export type ListOrganizationsParams");
    expect(organization).toContain(
      "export const listOrganizations = async (\n  params?: ListOrganizationsParams,",
    );
    // The URL builder hands the whole object to the query string, so a member added there — a
    // filter, or the page window the IR does not carry — is sent without this generator knowing.
    expect(organization).toContain("  const query = toQueryString(params);");
    expect(hookFile("organization")).toContain(
      "import type { ListOrganizationsParams } from '../model/listOrganizationsParams';",
    );
  });

  it("keeps a params type it declared in the module that declares it", () => {
    const organization = endpointFile("organization");
    expect(organization).toContain("export type GetOrganizationTreeParams = {");
    expect(hookFile("organization")).toContain("import type {\n  BatchDeleteOrganizationsParams,");
  });

  it("requires the params argument when a searchable route declares one of its own", () => {
    // Eight of the 86 searchable routes carry ordinary query parameters beside their filters;
    // seven of those are required, so the argument they ride in is too.
    const audit = generateEndpointFiles(domainOf("audit"), { naming: simplixBootNaming });
    expect(audit.files.get("endpoints/auditLog.ts")).toContain(
      "export const getAuditLogCounts = async (\n  params: GetAuditLogCountsParams,",
    );
    expect(audit.files.get("endpoints/auditLog.ts")).not.toContain(
      "export type GetAuditLogCountsParams",
    );
  });

  it("declares a query parameter as required exactly when the IR says it is", () => {
    const organization = endpointFile("organization");
    expect(organization).toContain(
      ["export type GetOrganizationTreeParams = {", "  fullTree: boolean;", "};"].join("\n"),
    );
    expect(organization).toContain(
      ["export type BatchDeleteOrganizationsParams = {", "  orgIds: string[];", "};"].join("\n"),
    );
    expect(organization).toContain(
      ["export type OrderOrganizationParams = {", "  parentId?: string;", "};"].join("\n"),
    );
  });

  it("joins a multi-value filter and repeats only sort, which is how the binder reads each", () => {
    const helpers = orgEndpoints.files.get("endpoints/_request.ts") ?? "";
    expect(helpers).toContain("const EXPLODED_PARAMS = new Set(['sort']);");
    expect(helpers).toContain("if (Array.isArray(value) && EXPLODED_PARAMS.has(name))");
    expect(endpointFile("organization")).toContain(
      "import { toQueryString } from './_request';",
    );
  });

  it("serialises the two shapes the way the orval builder does", () => {
    // searchable-jpa reads a multi-value filter as one comma-separated field — the parameter's own
    // documentation says "Enter multiple values separated by comma" — and orval explodes only
    // `sort`. Repeating `orgId.in` instead sends a shape the server does not read, so the filter
    // comes back unapplied rather than failing.
    const helpers = orgEndpoints.files.get("endpoints/_request.ts") ?? "";
    const body = helpers
      .slice(helpers.indexOf("const EXPLODED_PARAMS"), helpers.indexOf("/** The form body"))
      .replace(/^export /gm, "")
      .replace(/: [^=)]+\)/g, ")")
      .replace(/\): string \{/g, ") {");
    const toQueryString = new Function(`${body}; return toQueryString;`)() as (
      params: Record<string, unknown> | undefined,
    ) => string;

    expect(toQueryString({ "orgId.in": ["A", "B"] })).toBe("orgId.in=A%2CB");
    expect(toQueryString({ sort: ["orgName.asc", "orgCode.desc"] })).toBe(
      "sort=orgName.asc&sort=orgCode.desc",
    );
    expect(toQueryString({ page: 0, size: 20 })).toBe("page=0&size=20");
    expect(toQueryString(undefined)).toBe("");
  });

  it("declares a name once where two operations resolve to it, and reports both", () => {
    // `user.Avatar` serves the same read at `/{userId}-avatar-{size}.{ext}` and
    // `/{userId}-avatar.{ext}`, and the strategy names both `getAllAvatars`. Emitting each
    // declares the constant twice and the package stops compiling, so the later one is dropped
    // and the report names every operation that wanted it.
    const user = resolved.domains.get("user");
    const avatars = generateEndpointFiles(user!, { naming: simplixBootNaming });
    const module = avatars.files.get("endpoints/avatar.ts") ?? "";

    const declared = [...module.matchAll(/^export const (\w+)/gm)].map((one) => one[1]);
    expect(declared.length).toBe(new Set(declared).size);
    expect(ts.transpileModule(module, { reportDiagnostics: true }).diagnostics ?? []).toEqual([]);

    const clash = avatars.duplicateExports.find((one) => one.name === "getAllAvatars");
    expect(clash?.operations.length).toBeGreaterThan(1);
  });

  it("exports every entity module from the barrel", () => {
    expect(orgEndpoints.files.get("endpoints/index.ts")).toBe(
      [
        "/**",
        " * Generated from the DTO meta IR. Do not edit manually.",
        " */",
        "",
        "export * from './orgType';",
        "export * from './organization';",
        "",
      ].join("\n"),
    );
    expect(orgHooks.files.get("hooks/index.ts")).toContain("export * from './organization';");
  });
});

describe("generateEndpointFiles says what it could not name once", () => {
  it("reports a name two operations of one domain both take", () => {
    // `public.user.Avatar` serves the image and its thumbnail from paths whose parameters sit
    // inside a segment, and the strategy reads no action out of either: both resolve to
    // `getAllAvatars`, which declares the same const twice.
    const user = generateEndpointFiles(domainOf("user"), { naming: simplixBootNaming });
    expect(user.duplicateExports).toEqual([
      {
        name: "getAllAvatars",
        operations: [
          "PublicUserAvatarRest_getAvatarThumbnail",
          "PublicUserAvatarRest_getAvatar",
        ],
      },
    ]);
  });

  it("sends a file as a form body rather than as text in the query string", () => {
    // The IR carries a multipart part as a query parameter, and `String(blob)` is `[object Blob]`.
    const user = generateEndpointFiles(domainOf("user"), { naming: simplixBootNaming });
    expect(user.multipartOperations).toEqual(["AdminUserAvatarRest_upload"]);
    const avatar = user.files.get("endpoints/userAvatar.ts") ?? "";
    expect(avatar).toContain("    body: toFormData(params),");
    expect(avatar).toContain("  file: Blob;");
    expect(avatar).not.toContain("toQueryString(params)");
  });

  it("refuses to write one entity's module over another's", () => {
    const collided = resolveMeta(meta, {
      domains: { two: ["org.Organization", "party.roster.Organization"] },
      containerTypes,
    });
    const domain = collided.domains.get("two");
    if (!domain) throw new Error("the hand-built domain is missing");
    // The fixture has one of the two tags; the second entity is added to make the collision the
    // configuration would produce.
    domain.entities.push({ ...domain.entities[0], tag: "party.roster.Organization" });
    expect(() => resolveEndpoints(domain, simplixBootNaming)).toThrow(
      /both name the endpoint module 'organization'/,
    );
  });
});

describe("both generators produce well-formed TypeScript", () => {
  it("transpiles every emitted file of all 13 domains without a syntax diagnostic", () => {
    let emitted = 0;
    for (const domain of resolved.domains.values()) {
      const endpoints = generateEndpointFiles(domain, { naming: simplixBootNaming });
      const hooks = generateHookFiles(domain, { naming: simplixBootNaming });
      for (const [path, content] of [...endpoints.files, ...hooks.files]) {
        emitted += 1;
        const transpiled = ts.transpileModule(content, { reportDiagnostics: true });
        expect(transpiled.diagnostics ?? [], `${domain.name}/${path}`).toEqual([]);
      }
    }
    expect(emitted).toBe(291);
  });

  it("imports every helper it calls, in every domain", () => {
    // A searchable route states no query parameter and still sends a query string, so a module
    // that reaches for the helper on that ground alone would name it without importing it —
    // which transpiles, and fails when the domain package is built.
    for (const domain of resolved.domains.values()) {
      const endpoints = generateEndpointFiles(domain, { naming: simplixBootNaming });
      for (const [path, content] of endpoints.files) {
        if (path.endsWith("_request.ts")) continue;
        for (const helper of ["toQueryString", "toFormData"]) {
          if (!content.includes(`${helper}(params)`)) continue;
          expect(content, `${domain.name}/${path}`).toContain(`${helper}`);
          expect(content, `${domain.name}/${path}`).toMatch(
            new RegExp(`import \\{[^}]*\\b${helper}\\b[^}]*\\} from './_request';`),
          );
        }
      }
    }
  });

  it("imports a type through an import type, so erasure leaves nothing dangling", () => {
    // A type in a value import survives to the emitted module, which then asks its dependency for
    // an export that was never a value — a failure at load rather than at build.
    const organization = hookFile("organization");
    expect(organization).toContain("import type {\n  BatchDeleteOrganizationsParams,");
    expect(organization).toContain("import type { BodyType, ErrorType, customFetch } from '../../mutator';");
    // An entity that writes nothing never names a body type.
    expect(orgHooks.files.get("hooks/orgType.ts")).toContain(
      "import type { ErrorType, customFetch } from '../../mutator';",
    );
    expect(organization).toContain("import {\n  useMutation,\n  useQuery,\n} from '@tanstack/react-query';");
  });
});
