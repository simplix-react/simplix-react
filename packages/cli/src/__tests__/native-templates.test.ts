import { describe, expect, it } from "vitest";

import { renderTemplate } from "../utils/template.js";
import {
  nativeAppBabelConfig,
  nativeAppBootTs,
  nativeAppGitignore,
  nativeAppI18nTs,
  nativeAppIndexScreen,
  nativeAppJson,
  nativeAppMetroConfig,
  nativeAppPackageJson,
  nativeAppReadme,
  nativeAppRootLayout,
  nativeAppTailwindConfig,
  nativeAppTsconfigJson,
} from "../templates/native-app/index.js";
import {
  nativeDetailScreenTemplate,
  nativeFormScreenTemplate,
  nativeListScreenTemplate,
  nativeRouteDetailTemplate,
  nativeRouteListTemplate,
  nativeScreensIndexTemplate,
} from "../templates/native/index.js";

function makeAppCtx(overrides: Record<string, unknown> = {}) {
  return {
    appName: "visitor-kiosk",
    scope: "@test",
    locales: ["en", "ko", "ja"],
    defaultLocale: "ko",
    nativeFw: "^0.3.0",
    projectName: "test",
    deps: {
      tanstackReactQuery: "^5.90.0",
      typescript: "^5.9.0",
      typesReact: "^19.2.0",
    },
    fw: {},
    fwExact: {},
    ...overrides,
  };
}

const FIELD_BASE = {
  capitalizedName: "X",
  label: "X",
  inputType: "text",
  options: [] as string[],
  defaultValue: '""',
  isForeignKey: false,
  fkEntityField: null,
  isSystemField: false,
  isI18nPair: false,
  baseFieldName: null,
};

function makeScaffoldCtx(overrides: Record<string, unknown> = {}) {
  const fields = [
    { ...FIELD_BASE, name: "id", tsType: "string", formComponent: "TextField", component: "Text" },
    { ...FIELD_BASE, name: "name", tsType: "string", formComponent: "TextField", component: "Text" },
    {
      ...FIELD_BASE,
      name: "status",
      tsType: "string",
      formComponent: "SelectField",
      component: "Select",
      options: ["ACTIVE", "INACTIVE"],
    },
    {
      ...FIELD_BASE,
      name: "active",
      tsType: "boolean",
      formComponent: "SwitchField",
      component: "Boolean",
    },
  ];
  return {
    entity: "visit",
    entityKebab: "visit",
    EntityPascal: "Visit",
    packageName: "@test/domain-visitor",
    moduleNamespace: "test-visitor",
    modulePkgName: "@test/test-visitor",
    fields,
    formFields: [
      { ...fields[1] },
      { ...fields[2], isFormSelect: true },
      { ...fields[3], isFormSwitch: true },
    ],
    detailFields: [
      { ...fields[1] },
      { ...fields[2], isDetailBadge: true },
      { ...fields[3], isDetailBoolean: true },
    ],
    nativeFilters: [
      { field: "status", key: "status.in", options: ["ACTIVE", "INACTIVE"], isFaceted: true },
      { field: "active", key: "active.equals", isToggle: true },
      {
        field: "visitDate",
        fromKey: "visitDate.greaterThanOrEqualTo",
        toKey: "visitDate.lessThanOrEqualTo",
        isDateRange: true,
      },
    ],
    hasNativeFilters: true,
    hasDateFields: false,
    hasDetailActions: true,
    hasForm: true,
    searchField: "name",
    listTitleField: "name",
    listSubtitleField: "status",
    listRowType: "VisitListDTO",
    rowIdField: "id",
    hookList: "useSearchVisits",
    hookGet: "useGetVisit",
    hookGetForEdit: null,
    hookCreate: "useCreateVisit",
    hookUpdate: "useUpdateVisit",
    hookDelete: "useDeleteVisit",
    editHook: "useGetVisit",
    updateMutationKey: "visitId",
    deletePathParam: "visitId",
    ...overrides,
  };
}

describe("native-app templates", () => {
  it("renders a valid app package.json with framework deps", () => {
    const result = renderTemplate(nativeAppPackageJson, makeAppCtx());
    const pkg = JSON.parse(result) as Record<string, unknown>;
    expect(pkg.name).toBe("@test/visitor-kiosk");
    expect(pkg.main).toBe("expo-router/entry");
    const deps = pkg.dependencies as Record<string, string>;
    expect(deps["simplix-react-native"]).toBe("^0.3.0");
    expect(deps["@simplix-react/headless"]).toBe("^0.3.0");
    expect(deps["expo-router"]).toBeDefined();
    expect(deps.nativewind).toBeDefined();
  });

  it("renders a valid app.json with expo-router plugin", () => {
    const result = renderTemplate(nativeAppJson, makeAppCtx());
    const appJson = JSON.parse(result) as { expo: Record<string, unknown> };
    expect(appJson.expo.slug).toBe("visitor-kiosk");
    expect(appJson.expo.plugins).toContain("expo-router");
  });

  it("renders NativeWind wiring in babel/metro/tailwind configs", () => {
    expect(renderTemplate(nativeAppBabelConfig, makeAppCtx())).toContain(
      "nativewind/babel",
    );
    expect(renderTemplate(nativeAppMetroConfig, makeAppCtx())).toContain(
      "withNativeWind",
    );
    const tailwind = renderTemplate(nativeAppTailwindConfig, makeAppCtx());
    expect(tailwind).toContain("@simplix-react-native/ui/tailwind-preset");
    expect(tailwind).toContain("nativewind/preset");
  });

  it("renders the root layout with the runtime provider and boot gates", () => {
    const layout = renderTemplate(nativeAppRootLayout, makeAppCtx());
    expect(layout).toContain("SimplixNativeProvider");
    expect(layout).toContain("bootReady");
    const boot = renderTemplate(nativeAppBootTs, makeAppCtx());
    expect(boot).toContain("configureNativeBootMutator");
    expect(boot).toContain("createSecureTokenStore");
    expect(boot).toContain("tokenStore.hydrate()");
  });

  it("renders static locale imports for every non-en locale", () => {
    const i18n = renderTemplate(nativeAppI18nTs, makeAppCtx());
    expect(i18n).toContain('import commonEn from "../locales/common/en.json"');
    expect(i18n).toContain('import commonKo from "../locales/common/ko.json"');
    expect(i18n).toContain('import commonJa from "../locales/common/ja.json"');
    expect(i18n).toContain('defaultLocale: "ko"');
    expect(i18n).toContain('"/locales/common/ja.json": commonJa');
  });

  it("renders the home screen with framework components", () => {
    const result = renderTemplate(nativeAppIndexScreen, makeAppCtx());
    expect(result).toContain('options={{ title: t("appName") }}');
    expect(result).toContain("<Screen>");
  });

  it("renders every remaining app file without a parse error", () => {
    expect(renderTemplate(nativeAppGitignore, makeAppCtx())).toContain(".expo/");
    expect(renderTemplate(nativeAppReadme, makeAppCtx())).toContain("visitor-kiosk");
  });

  it("keeps the tsconfig on the expo base", () => {
    const result = renderTemplate(nativeAppTsconfigJson, makeAppCtx());
    const tsconfig = JSON.parse(result) as { extends: string };
    expect(tsconfig.extends).toBe("expo/tsconfig.base");
  });
});

describe("native scaffold templates", () => {
  it("renders the EntityList screen with feed, filters, and card mapping", () => {
    const result = renderTemplate(nativeListScreenTemplate, makeScaffoldCtx());
    expect(result).toContain("type VisitRow = VisitListDTO;");
    expect(result).toContain("useEntityFeed<VisitRow>");
    expect(result).toContain('searchField: "name"');
    expect(result).toContain('key: "status.in"');
    expect(result).toContain('fromKey: "visitDate.greaterThanOrEqualTo"');
    expect(result).toContain("EntityList.Row");
    expect(result).toContain("title={String(row.name ?? \"\")}");
    expect(result).toContain("onCreate={onCreate}");
    expect(result).not.toContain("CrudList");
  });

  it("renders the detail screen with DetailFields and delete confirmation", () => {
    const result = renderTemplate(nativeDetailScreenTemplate, makeScaffoldCtx());
    expect(result).toContain("adaptOrvalGet<VisitDetail>");
    expect(result).toContain("DetailFields.BooleanField");
    expect(result).toContain("DetailFields.BadgeField");
    expect(result).toContain("AlertDialog");
    expect(result).toContain('adaptOrvalDelete(deleteMutation, "visitId")');
  });

  it("renders the form screen with FormFields and both mutations", () => {
    const result = renderTemplate(nativeFormScreenTemplate, makeScaffoldCtx());
    expect(result).toContain("FormFields.TextField");
    expect(result).toContain("FormFields.SelectField");
    expect(result).toContain("FormFields.SwitchField");
    expect(result).toContain("adaptOrvalCreate");
    expect(result).toContain('adaptOrvalUpdate(updateMutation, "visitId")');
    expect(result).toContain("keyboardAvoiding");
  });

  it("renders expo-router route wrappers wiring navigation", () => {
    const list = renderTemplate(nativeRouteListTemplate, makeScaffoldCtx());
    expect(list).toContain('router.push(`/visit/${id}`)');
    expect(list).toContain('router.push("/visit/new")');
    expect(list).toContain("Stack.Screen options={{ title:");

    const detail = renderTemplate(nativeRouteDetailTemplate, makeScaffoldCtx());
    expect(detail).toContain("useLocalSearchParams<{ id: string }>()");
    expect(detail).toContain("visitId={id}");
  });

  it("renders the screens barrel per available operation", () => {
    const result = renderTemplate(nativeScreensIndexTemplate, makeScaffoldCtx());
    expect(result).toContain("VisitListScreen");
    expect(result).toContain("VisitDetailScreen");
    expect(result).toContain("VisitFormScreen");

    const readOnly = renderTemplate(
      nativeScreensIndexTemplate,
      makeScaffoldCtx({ hasForm: false, hookCreate: null, hookUpdate: null }),
    );
    expect(readOnly).not.toContain("VisitFormScreen");
  });
});
