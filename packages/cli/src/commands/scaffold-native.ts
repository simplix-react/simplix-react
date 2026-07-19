import ora from "ora";
import { join, resolve } from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { findCrudConfigForEntity } from "../config/crud-config-loader.js";
import { toKebabCase, toPascalCase } from "../utils/case.js";
import {
  findProjectRoot,
  pathExists,
  readJsonFile,
  writeFileWithDir,
} from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { renderTemplate } from "../utils/template.js";
import {
  entityFieldsToFieldInfo,
  findEntityFromSnapshot,
  findModuleDirs,
  findMutationPathParam,
  findSchemaFile,
  orderAndCategorizeFields,
  parseEntityOperations,
  parseFilterParams,
  parseSchemaFields,
  resolveModuleNamespace,
  type FieldInfo,
  type FilterFieldInfo,
} from "./scaffold-crud.js";
import {
  nativeDetailScreenTemplate,
  nativeFormScreenTemplate,
  nativeListScreenTemplate,
  nativeRouteDetailTemplate,
  nativeRouteEditTemplate,
  nativeRouteListTemplate,
  nativeRouteNewTemplate,
  nativeScreensIndexTemplate,
} from "../templates/native/index.js";

/** Options for {@link runNativeScaffold}. */
export interface NativeScaffoldOptions {
  module?: string;
  /** Target Expo app under apps/ receiving the expo-router route files. */
  app?: string;
}

interface NativeFilterDef {
  field: string;
  key?: string;
  fromKey?: string;
  toKey?: string;
  options?: string[];
  isFaceted?: boolean;
  isToggle?: boolean;
  isText?: boolean;
  isDateRange?: boolean;
}

interface NativeFieldView extends FieldInfo {
  isFormTextarea?: boolean;
  isFormNumber?: boolean;
  isFormSelect?: boolean;
  isFormSwitch?: boolean;
  isFormDate?: boolean;
  isDetailBoolean?: boolean;
  isDetailNumber?: boolean;
  isDetailDate?: boolean;
  isDetailDateTime?: boolean;
  isDetailBadge?: boolean;
}

/** "visitorCompany" → "Visitor Company" */
function humanize(name: string): string {
  return toPascalCase(name).replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function tagFormField(field: FieldInfo): NativeFieldView {
  const view: NativeFieldView = { ...field };
  switch (field.formComponent) {
    case "TextareaField":
      view.isFormTextarea = true;
      break;
    case "NumberField":
      view.isFormNumber = true;
      break;
    case "SelectField":
      view.isFormSelect = true;
      break;
    case "SwitchField":
      view.isFormSwitch = true;
      break;
    case "DateField":
      view.isFormDate = true;
      break;
    default:
      break;
  }
  return view;
}

function tagDetailField(field: FieldInfo): NativeFieldView {
  const view: NativeFieldView = { ...field };
  switch (field.component) {
    case "Boolean":
      view.isDetailBoolean = true;
      break;
    case "Number":
      view.isDetailNumber = true;
      break;
    case "Date":
      view.isDetailDate = true;
      view.isDetailDateTime = field.isSystemField;
      break;
    case "Select":
      view.isDetailBadge = true;
      break;
    default:
      break;
  }
  return view;
}

function buildNativeFilters(
  filterFields: FilterFieldInfo[],
  searchField: string | null,
): NativeFilterDef[] {
  const defs: NativeFilterDef[] = [];
  for (const filter of filterFields) {
    switch (filter.component) {
      case "TextFilter":
        if (filter.field === searchField) break; // covered by the search bar
        defs.push({ field: filter.field, key: filter.filterKey, isText: true });
        break;
      case "NumberFilter":
      case "CountryFilter":
      case "TimezoneFilter":
        defs.push({ field: filter.field, key: filter.filterKey, isText: true });
        break;
      case "FacetedFilter":
        defs.push({
          field: filter.field,
          key: filter.filterKey,
          options: filter.options ?? [],
          isFaceted: true,
        });
        break;
      case "ToggleFilter":
        defs.push({ field: filter.field, key: filter.filterKey, isToggle: true });
        break;
      case "DateRangeFilter":
        if (filter.pairedKey) {
          defs.push({
            field: filter.field,
            fromKey: filter.filterKey,
            toKey: filter.pairedKey,
            isDateRange: true,
          });
        } else {
          defs.push({ field: filter.field, key: filter.filterKey, isText: true });
        }
        break;
      default:
        break;
    }
  }
  return defs;
}

async function findExpoApps(rootDir: string): Promise<string[]> {
  const appsDir = join(rootDir, "apps");
  if (!(await pathExists(appsDir))) return [];
  const entries = await readdir(appsDir, { withFileTypes: true });
  const expoApps: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const appJsonPath = join(appsDir, entry.name, "app.json");
    if (!(await pathExists(appJsonPath))) continue;
    try {
      const appJson = JSON.parse(await readFile(appJsonPath, "utf-8")) as Record<
        string,
        unknown
      >;
      if (appJson.expo) expoApps.push(entry.name);
    } catch {
      // Unparseable app.json → not an Expo app we can target.
    }
  }
  return expoApps;
}

async function ensureLineInFile(
  filePath: string,
  line: string,
  initialContent: string,
): Promise<void> {
  let content = initialContent;
  if (await pathExists(filePath)) {
    content = await readFile(filePath, "utf-8");
    if (content.includes(line)) return;
    content = `${content.trimEnd()}\n${line}\n`;
  }
  await writeFileWithDir(filePath, content);
}

async function mergeLocaleJson(
  filePath: string,
  entityKey: string,
  entityBlock: Record<string, unknown>,
): Promise<void> {
  let data: Record<string, unknown> = {};
  if (await pathExists(filePath)) {
    try {
      data = JSON.parse(await readFile(filePath, "utf-8")) as Record<string, unknown>;
    } catch {
      data = {};
    }
  }
  if (data[entityKey]) return; // never clobber hand-edited keys
  data[entityKey] = entityBlock;
  await writeFileWithDir(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

/**
 * `scaffold <entity> --native`: generate the mobile entity screen set —
 * EntityList screen, push detail, full-screen form, expo-router routes, and
 * locale skeletons — from the OpenAPI-generated domain package. Output is
 * mobile grammar only (no CrudList on native).
 */
export async function runNativeScaffold(
  entity: string,
  options: NativeScaffoldOptions,
): Promise<void> {
  const rootDir = await findProjectRoot(process.cwd());
  const entityKebab = toKebabCase(entity);
  const EntityPascal = toPascalCase(entity);

  // ── Resolve target module ──
  let moduleName: string;
  if (options.module) {
    moduleName = options.module;
  } else {
    const moduleDirs = await findModuleDirs(rootDir);
    if (moduleDirs.length === 1) {
      moduleName = moduleDirs[0];
      log.info(`Auto-detected module: ${moduleName}`);
    } else if (moduleDirs.length > 1) {
      log.error("Multiple modules found. Specify --module <dir>:");
      for (const dir of moduleDirs) log.step(dir);
      process.exit(1);
      return;
    } else {
      log.error(
        "No modules/ directory found. Create a module first:\n  simplix add-module <name>",
      );
      process.exit(1);
      return;
    }
  }
  const moduleDir = resolve(rootDir, "modules", moduleName);
  if (!(await pathExists(moduleDir))) {
    log.error(`Module "${moduleName}" not found under modules/.`);
    process.exit(1);
    return;
  }

  // ── Resolve target Expo app for route files ──
  let appName: string | null = options.app ?? null;
  if (!appName) {
    const expoApps = await findExpoApps(rootDir);
    if (expoApps.length === 1) {
      appName = expoApps[0];
      log.info(`Auto-detected Expo app: ${appName}`);
    } else if (expoApps.length > 1) {
      log.error("Multiple Expo apps found. Specify --app <dir>:");
      for (const dir of expoApps) log.step(dir);
      process.exit(1);
      return;
    }
    // Zero apps → generate module screens only; routes are skipped with a notice.
  }
  const appDir = appName ? resolve(rootDir, "apps", appName) : null;
  if (appName && appDir && !(await pathExists(appDir))) {
    log.error(`App "${appName}" not found under apps/.`);
    process.exit(1);
    return;
  }

  const spinner = ora(`Searching for ${entity} schema...`).start();

  try {
    // ── Field discovery (same pipeline as the web scaffold) ──
    const schemaResult = await findSchemaFile(rootDir, entity);
    const extractedEntity = await findEntityFromSnapshot(rootDir, entity);

    let fields: FieldInfo[] = [];
    let packageName: string | null = null;
    if (schemaResult) {
      spinner.text = `Found schema at ${schemaResult.path}`;
      fields = parseSchemaFields(schemaResult.content, entity);
      packageName = schemaResult.packageName;
    }
    if (fields.length === 0 && extractedEntity?.fields.length) {
      fields = entityFieldsToFieldInfo(extractedEntity.fields);
    }
    if (fields.length === 0) {
      spinner.fail(`No schema or snapshot found for entity "${entity}".`);
      log.error(
        "Generate the domain package first (simplix openapi <spec> -d <domain>).",
      );
      process.exit(1);
      return;
    }
    fields = orderAndCategorizeFields(fields);

    // The native kit has no i18n-record field editors — surface the gap
    // instead of silently emitting a broken form.
    const i18nFields = fields.filter((f) => f.formComponent.startsWith("I18n"));
    if (i18nFields.length > 0) {
      log.warn(
        `Skipping i18n record fields (customize manually): ${i18nFields
          .map((f) => f.name)
          .join(", ")}`,
      );
    }
    const plainFields = fields.filter((f) => !f.formComponent.startsWith("I18n"));

    const ops = await parseEntityOperations(rootDir, entity);
    const crudConfig = await findCrudConfigForEntity(rootDir, entity);
    const toHookName = (opId: string) =>
      `use${opId.charAt(0).toUpperCase()}${opId.slice(1)}`;
    const hookList = crudConfig?.list ? toHookName(crudConfig.list) : null;
    const hookGet = crudConfig?.get ? toHookName(crudConfig.get) : null;
    const hookGetForEdit = crudConfig?.getForEdit
      ? toHookName(crudConfig.getForEdit)
      : null;
    const hookCreate = crudConfig?.create ? toHookName(crudConfig.create) : null;
    const hookUpdate = crudConfig?.update ? toHookName(crudConfig.update) : null;
    const hookDelete = crudConfig?.delete ? toHookName(crudConfig.delete) : null;

    if (!hookList && !ops.hasList) {
      log.warn("Entity has no list operation — list screen will be skipped.");
    }

    const updatePathParam = crudConfig?.update
      ? await findMutationPathParam(rootDir, crudConfig.update)
      : null;
    const deletePathParam = crudConfig?.delete
      ? ((await findMutationPathParam(rootDir, crudConfig.delete)) ?? `${entity}Id`)
      : `${entity}Id`;

    const getOp = extractedEntity?.operations.find((o) => o.role === "get");
    const pathParamMatch = getOp?.path.match(/:(\w+)(?:\/|$)/);
    const rowIdField = pathParamMatch?.[1] ?? "id";
    const updateMutationKey = updatePathParam ?? rowIdField;

    const filterFields = extractedEntity
      ? parseFilterParams(extractedEntity.queryParams, extractedEntity.fields)
      : [];

    // ── List card mapping ──
    const commonNameFields = ["name", "title", "label", "displayName"];
    const displayNameField =
      plainFields.find(
        (f) => commonNameFields.includes(f.name) && f.tsType === "string",
      )?.name ??
      plainFields.find((f) => f.tsType === "string" && f.name !== rowIdField)?.name ??
      null;
    const listTitleField = displayNameField ?? rowIdField;
    const listSubtitleField =
      plainFields.find(
        (f) =>
          f.tsType === "string" &&
          !f.hideInList &&
          f.name !== listTitleField &&
          f.name !== rowIdField,
      )?.name ?? null;

    const searchField =
      displayNameField &&
      filterFields.some(
        (f) => f.field === displayNameField && f.component === "TextFilter",
      )
        ? displayNameField
        : null;
    const nativeFilters = buildNativeFilters(filterFields, searchField);

    // ── Row DTO ──
    const listOp =
      extractedEntity?.operations?.find((o) => o.role === "list") ??
      extractedEntity?.operations?.find((o) => o.role === "search");
    const listRowType =
      packageName && listOp?.responseEntityType ? listOp.responseEntityType : null;

    const moduleNamespace = await resolveModuleNamespace(moduleDir);
    const modulePkg = await readJsonFile<{ name: string }>(
      join(moduleDir, "package.json"),
    );

    const formFields = plainFields
      .filter((f) => !f.isSystemField && f.name !== rowIdField)
      .map(tagFormField);
    const detailFields = plainFields.map(tagDetailField);
    const hasForm = !!(hookCreate || hookUpdate);
    const editHook = hookUpdate ? (hookGetForEdit ?? hookGet) : null;

    const ctx = {
      entity,
      entityKebab,
      EntityPascal,
      packageName,
      moduleNamespace,
      modulePkgName: modulePkg.name,
      fields: plainFields,
      formFields,
      detailFields,
      nativeFilters,
      hasNativeFilters: nativeFilters.length > 0,
      hasDateFields: formFields.some((f) => f.isFormDate),
      hasDetailActions: !!(hookUpdate || hookDelete),
      hasForm,
      searchField,
      listTitleField,
      listSubtitleField,
      listRowType,
      rowIdField,
      hookList,
      hookGet,
      hookGetForEdit,
      hookCreate,
      hookUpdate,
      hookDelete,
      editHook,
      updateMutationKey,
      deletePathParam,
    };

    // ── Module screen files ──
    const screensDir = join(moduleDir, "src", "screens", entityKebab);
    const files: Record<string, string> = {};
    if (hookList) {
      files[join(screensDir, "list-screen.tsx")] = renderTemplate(
        nativeListScreenTemplate,
        ctx,
      );
    }
    if (hookGet) {
      files[join(screensDir, "detail-screen.tsx")] = renderTemplate(
        nativeDetailScreenTemplate,
        ctx,
      );
    }
    if (hasForm) {
      files[join(screensDir, "form-screen.tsx")] = renderTemplate(
        nativeFormScreenTemplate,
        ctx,
      );
    }
    files[join(screensDir, "index.ts")] = renderTemplate(
      nativeScreensIndexTemplate,
      ctx,
    );

    // ── expo-router route files ──
    if (appDir) {
      const routesDir = join(appDir, "app", entityKebab);
      if (hookList) {
        files[join(routesDir, "index.tsx")] = renderTemplate(
          nativeRouteListTemplate,
          ctx,
        );
      }
      if (hookGet) {
        files[join(routesDir, "[id]", "index.tsx")] = renderTemplate(
          nativeRouteDetailTemplate,
          ctx,
        );
      }
      if (hookCreate) {
        files[join(routesDir, "new.tsx")] = renderTemplate(
          nativeRouteNewTemplate,
          ctx,
        );
      }
      if (hookUpdate) {
        files[join(routesDir, "[id]", "edit.tsx")] = renderTemplate(
          nativeRouteEditTemplate,
          ctx,
        );
      }
    }

    for (const [filePath, content] of Object.entries(files)) {
      await writeFileWithDir(filePath, content);
    }

    // ── Barrel wiring ──
    await ensureLineInFile(
      join(moduleDir, "src", "screens", "index.ts"),
      `export * from "./${entityKebab}";`,
      `export * from "./${entityKebab}";\n`,
    );
    await ensureLineInFile(
      join(moduleDir, "src", "index.ts"),
      `export * from "./screens";`,
      `export * from "./screens";\n`,
    );

    // ── Locale skeletons ──
    const entityBlock: Record<string, unknown> = {
      title: humanize(entity),
      fields: Object.fromEntries(plainFields.map((f) => [f.name, f.label])),
      filters: Object.fromEntries(
        nativeFilters.map((f) => [f.field, humanize(f.field)]),
      ),
      actions: {
        create: "Create",
        edit: "Edit",
        delete: "Delete",
        deleteConfirm: `Delete this ${humanize(entity).toLowerCase()}?`,
        save: "Save",
      },
    };
    const localesDir = join(moduleDir, "src", "locales", "widgets");
    if (await pathExists(join(moduleDir, "src", "locales"))) {
      const localeFiles = (await pathExists(localesDir))
        ? (await readdir(localesDir)).filter((f) => f.endsWith(".json"))
        : ["en.json", "ko.json", "ja.json"];
      for (const localeFile of localeFiles) {
        await mergeLocaleJson(join(localesDir, localeFile), entity, entityBlock);
      }
    }

    spinner.succeed(`Native screen set generated for ${entity}`);
    log.info("");
    log.info("Generated:");
    log.info(`  modules/${moduleName}/src/screens/${entityKebab}/`);
    if (appDir) {
      log.info(`  apps/${appName}/app/${entityKebab}/`);
    } else {
      log.info("  (no Expo app found — route files skipped; pass --app <dir>)");
    }
  } catch (error) {
    spinner.fail("Failed to generate native screen set");
    log.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
