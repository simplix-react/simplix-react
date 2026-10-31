import { readFile, readdir } from "node:fs/promises";
import { findModulePaths, moduleDirOf, modulePathOf, ModulePathError, parseModulePath, type ModulePath } from "../utils/module-path.js";
import { basename, dirname, join, relative, resolve } from "node:path";

import { Command } from "commander";
import ora from "ora";

import { findCrudConfigForEntity } from "../config/crud-config-loader.js";
import { loadConfig } from "../config/config-loader.js";
import { assertOutputDirs, reportOutputDirError } from "../config/output-dirs.js";
import {
  crudPageTemplate,
  hubPageTemplate,
  pageIndexTemplate,
  treeCrudPageTemplate,
} from "../templates/ui/index.js";
import type { EntityField, ExtractedEntity, OpenAPISnapshot, QueryParam } from "../openapi/types.js";
import { toEntityName, toKebabCase, toPascalCase } from "../utils/case.js";
import { noteKeptRender, pathExists, readJsonFile, writeFileWithDir, findProjectRoot } from "../utils/fs.js";
import {
  GENERATED_PAGE_MARKER,
  resolveKitPackageDir,
  stampFingerprint,
  writeGenerated,
  loadProjectTemplates,
  PAGE_BLOCKS_TEMPLATE,
  STORY_TEMPLATE,
  templateFor,
  type ProjectTemplates,
} from "../utils/project-templates.js";
import { log } from "../utils/logger.js";
import { writeStampedGenerated } from "../utils/generated-merge.js";
import { fixtureRows } from "../utils/story-fixtures.js";
import { renderWidgetBlocks, renderWidgetFiles } from "./scaffold-widgets.js";
import { renderTemplate } from "../utils/template.js";
import { depVersion } from "../versions.js";

// ── Zod type to component mapping ──

export interface FieldInfo {
  name: string;
  capitalizedName: string;
  label: string;
  tsType: string;
  formComponent: string;
  inputType: string;
  component: string;
  options: string[];
  defaultValue: string;
  isForeignKey: boolean;
  fkEntityField: string | null;
  isSystemField: boolean;
  isI18nPair: boolean;
  baseFieldName: string | null;
  /** Mandated list-column category, assigned by orderAndCategorizeFields. */
  category?: ColumnCategory;
  /** Whether the field should be hidden by default in scaffolded lists/trees. */
  hideInList?: boolean;
  /**
   * Enum the field's values belong to, taken from the list row type's declared type. Present
   * only on enum fields the row type declares; a badge without it shows the raw constant.
   */
  enumTypeName?: string;
  /**
   * Whether the backend can order a list by this field, as `@SearchableField(sortable)` states.
   *
   * Absent means nothing states it — an OpenAPI document carries no such flag — and the column
   * goes on offering the sort it has always offered. `false` is a statement: the column offers
   * none, because a sort the backend does not implement moves the arrow and leaves the rows.
   */
  sortable?: boolean;
  /**
   * Locale → the field the backend orders this one by in that language (`searchable.sortAlias`):
   * a translated name the server cannot sort directly is sorted through its per-language key.
   */
  sortAlias?: Record<string, string>;
  /** `CrudList.Column`'s `format`, for a field SimpliX Meta types as a moment, a day or a time. */
  columnFormat?: "date" | "datetime" | "time";
  /** `CrudList.Column`'s `display`, for a field whose rendering SimpliX Meta settles. */
  columnDisplay?: "boolean";
  /**
   * What the contract says the field is, for a template that draws and edits by kind: `enum`,
   * `boolean`, `date`, `instant`, `time`, `number`, `reference`, `longText`, `email` or `text`.
   * Set by {@link withContractKinds} from the fields above.
   */
  contractKind?: string;
  /** For a `reference`: the peek kind it opens, the referenced entity's name. */
  peekKind?: string;
  /** For a `reference`: the field beside it that carries the referenced record's name. */
  nameField?: string;
  /** The field is a reference's name, drawn by that reference rather than on its own. */
  isReferenceName?: boolean;
  /** One of the audit stamps or the soft-delete flag, which a generated screen never draws (they are the record's metadata). */
  isAuditField?: boolean;
  /** For a key whose record arrives nested beside it: the path to that record's name (`position.name`). */
  referenceNamePath?: string;
  /** For such a key: the peek kind the nested record's type names. */
  referencePeekKind?: string;
  /** The record's own identifier, which a list leaves out and a detail draws with a copy control. */
  isIdentifier?: boolean;
  /** A code the reader types or compares (SimpliX Meta's `format: "code"`), drawn in the monospaced face. */
  isCode?: boolean;
  /** A key that is not a reference with a name, which no generated screen draws. */
  isOpaqueId?: boolean;
}

/** The stamps and the soft-delete flag every record carries and no generated field draws. */
export const AUDIT_FIELDS = ["createdBy", "createdAt", "updatedBy", "updatedAt", "deleted", "deletedAt", "deletedTimestamp"];

/** A filter a generated list offers, in the kit's terms, from a searchable field SimpliX Meta declares. */
export interface ContractFilterInfo {
  kind: "choice" | "toggle" | "dateRange" | "number";
  field: string;
  enumTypeName?: string;
  options?: string[];
  /** For a period: whether the field is a calendar day rather than a moment. */
  dateOnly?: boolean;
}

const FILTER_KIND: Record<string, ContractFilterInfo["kind"]> = {
  FacetedFilter: "choice",
  ToggleFilter: "toggle",
  DateRangeFilter: "dateRange",
  NumberFilter: "number",
};

/**
 * The searchable fields as the kit's list filters: an enum as a choice, a boolean as a toggle, a
 * moment or a day as a period, a number as a number. One per field, in the order they arrive.
 */
export function contractFiltersOf(filters: readonly FilterFieldInfo[], fields: readonly FieldInfo[]): ContractFilterInfo[] {
  const seen = new Set<string>();
  const out: ContractFilterInfo[] = [];
  for (const filter of filters) {
    const kind = FILTER_KIND[filter.component];
    // The audit stamps and the soft-delete flag are not what an operator searches by.
    if (!kind || seen.has(filter.field) || AUDIT_FIELDS.includes(filter.field)) continue;
    if (kind === "choice" && !(filter.options && filter.options.length > 0)) continue;
    seen.add(filter.field);
    const one: ContractFilterInfo = { kind, field: filter.field };
    const enumTypeName = fields.find((f) => f.name === filter.field)?.enumTypeName;
    if (enumTypeName) one.enumTypeName = enumTypeName;
    if (kind === "choice") one.options = [...(filter.options ?? [])];
    if (kind === "dateRange") one.dateOnly = fields.find((f) => f.name === filter.field)?.columnFormat === "date";
    out.push(one);
  }
  return out;
}

/** The contract kind one field is drawn and edited by, read from what codegen already settled. */
export function contractKindOf(field: FieldInfo): string {
  if (field.isForeignKey) return "reference";
  // The map half of an i18n pair: one text per content language, beside the plain field it fills.
  if (field.baseFieldName && field.tsType === "Record<string, string>") return "i18nText";
  if (field.component === "Select" && field.options.length > 0) return "enum";
  if (field.columnDisplay === "boolean" || field.tsType === "boolean") return "boolean";
  if (field.columnFormat === "datetime") return "instant";
  if (field.columnFormat === "date") return "date";
  if (field.columnFormat === "time") return "time";
  if (field.tsType === "number") return "number";
  if (field.formComponent === "TextareaField" || field.component === "Textarea") return "longText";
  if (field.inputType === "email") return "email";
  return "text";
}

/**
 * Stamps every field with its contract kind, and a reference with the peek it opens and the
 * sibling field that names its record (`<entity>Name`, or `<entity>DisplayName`), where one exists.
 */
export function withContractKinds(input: readonly FieldInfo[], rowIdField?: string): FieldInfo[] {
  // The record's own key ends in `Id` like a foreign key, but it names this record, never another:
  // read as a reference it would draw a peek at itself and swallow `<entity>Name` as its label.
  const fields = input.map((f) => (f.name === rowIdField && f.isForeignKey ? { ...f, isForeignKey: false, fkEntityField: null } : f));
  const names = new Set(fields.map((f) => f.name));
  const referenceNames = new Set(
    fields.flatMap((f) =>
      f.isForeignKey && f.fkEntityField ? [`${f.fkEntityField}Name`, `${f.fkEntityField}DisplayName`, f.fkEntityField] : [],
    ),
  );
  return fields.map((f) => {
    const stamped = stampContractKind(f, names, referenceNames, fields);
    const isIdentifier = f.name === rowIdField;
    // A key nobody reads (an attachment id, a list of role ids, an external key) says nothing on a
    // screen; the record's own identifier is drawn once, in its detail, with a copy control.
    const isOpaqueId = !isIdentifier && stamped.contractKind !== "reference" && /[a-z](Id|Ids)$/.test(f.name);
    return { ...stamped, isIdentifier, isOpaqueId };
  });
}

function stampContractKind(
  f: FieldInfo,
  names: ReadonlySet<string>,
  referenceNames: ReadonlySet<string>,
  fields: readonly FieldInfo[],
): FieldInfo {
  {
    const contractKind = contractKindOf(f);
    // A reference's name is drawn by the reference itself, so it is not a field of its own.
    const isReferenceName = referenceNames.has(f.name);
    const isAuditField = AUDIT_FIELDS.includes(f.name);
    if (contractKind !== "reference" || !f.fkEntityField) return { ...f, contractKind, isReferenceName, isAuditField };
    // SimpliX Meta names no reference target, so an `…Id` is a reference only where the record also
    // carries the referenced record's name; any other `…Id` (an external key, the row's own id) is text.
    const nameField =
      f.referenceNamePath ??
      [`${f.fkEntityField}Name`, `${f.fkEntityField}DisplayName`, f.fkEntityField].find(
        (n) => names.has(n) && fields.find((one) => one.name === n)?.tsType === "string",
      );
    if (!nameField) return { ...f, contractKind: "text", isReferenceName, isAuditField };
    return { ...f, contractKind, peekKind: f.referencePeekKind ?? f.fkEntityField, nameField, isReferenceName, isAuditField };
  }
}

/** Fields that exist in the data model but should not be displayed or edited by users. */
export const SYSTEM_FIELDS = ["id", "displayOrder", "sortOrder"];

// ── Mandated list-column ordering (INV#18) ──

/**
 * Field-column categories in their mandated display order. Template chrome
 * (drag/select/actions columns) is not represented here; this spans the
 * identifier→audit field range only.
 */
const COLUMN_CATEGORY_ORDER = [
  "identifier",
  "relation",
  "type",
  "text",
  "description",
  "attribute",
  "metric",
  "schedule",
  "audit",
] as const;
type ColumnCategory = (typeof COLUMN_CATEGORY_ORDER)[number];

/** Categories hidden by default in scaffolded lists/trees. */
const HIDDEN_CATEGORIES = new Set<ColumnCategory>(["identifier", "relation", "audit"]);

// Audit timestamp/user field name patterns (e.g. createdAt, updatedBy, deletedOn).
const AUDIT_NAME_RE = /^(created|updated|deleted|modified)(At|By|Date|Time|On)$/i;
const AUDIT_USER_RE = /^(createdBy|updatedBy|deletedBy|modifiedBy|owner|author)$/i;
// Generic schedule/timestamp field name pattern.
const SCHEDULE_NAME_RE = /(At|Date|Time)$/;
// Long-form free-text field name pattern.
const DESCRIPTION_RE = /^(description|notes?|remark|comment|memo|summary|content)$/i;

/**
 * Classify a field into a single mandated column category. First match wins,
 * so the ordering of the checks below is significant (e.g. audit/identifier
 * rules must precede the generic date/string rules).
 */
export function categorizeField(f: FieldInfo): ColumnCategory {
  const base = f.baseFieldName ?? f.name;
  if (f.isSystemField || f.name === "id") return "identifier";
  if (f.isForeignKey || f.fkEntityField) return "relation";
  if (AUDIT_NAME_RE.test(base) || AUDIT_USER_RE.test(base)) return "audit";
  if (f.component === "Select" || f.options.length > 0) return "type";
  if (f.component === "Boolean" || f.tsType === "boolean") return "attribute";
  if (f.component === "Number" || f.tsType === "number") return "metric";
  if (f.component === "Date" || f.tsType === "Date" || SCHEDULE_NAME_RE.test(base)) return "schedule";
  if (DESCRIPTION_RE.test(base)) return "description";
  return "text";
}

/**
 * Tag each field with its column category and default visibility, then return
 * a stable sort by the mandated category order. The original field order is the
 * tiebreaker within a category.
 */
export function orderAndCategorizeFields(fields: FieldInfo[]): FieldInfo[] {
  return fields
    .map((f, index) => {
      const category = categorizeField(f);
      return {
        field: { ...f, category, hideInList: HIDDEN_CATEGORIES.has(category) },
        category,
        index,
      };
    })
    .sort((a, b) => {
      const rankDiff =
        COLUMN_CATEGORY_ORDER.indexOf(a.category) - COLUMN_CATEGORY_ORDER.indexOf(b.category);
      return rankDiff !== 0 ? rankDiff : a.index - b.index;
    })
    .map((entry) => entry.field);
}

export function parseZodType(zodExpr: string): Omit<FieldInfo, "name" | "label" | "capitalizedName" | "defaultValue" | "isForeignKey" | "fkEntityField" | "isSystemField" | "isI18nPair" | "baseFieldName"> {
  const trimmed = zodExpr.trim();

  // z.enum([...]) / zod.enum([...])
  const enumMatch = trimmed.match(/(?:z|zod)\.enum\(\[([^\]]+)\]\)/);
  if (enumMatch) {
    const options = enumMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/["']/g, ""));
    return {
      tsType: options.map((o) => `"${o}"`).join(" | "),
      formComponent: "SelectField",
      inputType: "text",
      component: "Select",
      options,
    };
  }

  // z.boolean() / zod.boolean()
  if (/(?:z|zod)\.boolean\(\)/.test(trimmed)) {
    return {
      tsType: "boolean",
      formComponent: "SwitchField",
      inputType: "checkbox",
      component: "Boolean",
      options: [],
    };
  }

  // z.date() / zod.date() or z.coerce.date() / zod.coerce.date() or zod.iso.datetime({})
  if (/(?:z|zod)\.(?:coerce\.)?date\(\)/.test(trimmed) || /(?:z|zod)\.iso\.datetime\(/.test(trimmed)) {
    return {
      tsType: "Date",
      formComponent: "DateField",
      inputType: "date",
      component: "Date",
      options: [],
    };
  }

  // z.number() / zod.number() or z.coerce.number() / zod.coerce.number()
  if (/(?:z|zod)\.(?:coerce\.)?number\(\)/.test(trimmed)) {
    return {
      tsType: "number",
      formComponent: "NumberField",
      inputType: "number",
      component: "Number",
      options: [],
    };
  }

  // z.string() / zod.string() variants
  if (/(?:z|zod)\.string\(\)/.test(trimmed)) {
    if (trimmed.includes(".email()")) {
      return {
        tsType: "string",
        formComponent: "TextField",
        inputType: "email",
        component: "Text",
        options: [],
      };
    }
    if (trimmed.includes(".url()")) {
      return {
        tsType: "string",
        formComponent: "TextField",
        inputType: "url",
        component: "Text",
        options: [],
      };
    }
    const minMatch = trimmed.match(/\.min\((\d+)\)/);
    if (minMatch && Number(minMatch[1]) >= 100) {
      return {
        tsType: "string",
        formComponent: "TextareaField",
        inputType: "text",
        component: "Text",
        options: [],
      };
    }
    return {
      tsType: "string",
      formComponent: "TextField",
      inputType: "text",
      component: "Text",
      options: [],
    };
  }

  // z.array(z.string()) / zod.array(zod.string()) - string array treated as text
  if (/(?:z|zod)\.array\(\s*(?:z|zod)\.string\(\)\s*\)/.test(trimmed)) {
    return {
      tsType: "string",
      formComponent: "TextField",
      inputType: "text",
      component: "Text",
      options: [],
    };
  }

  // z.record(z.string(), z.string()) - i18n map field
  if (/(?:z|zod)\.record\(\s*(?:z|zod)\.string\(\)\s*,\s*(?:z|zod)\.string\(\)\s*\)/.test(trimmed)) {
    return {
      tsType: "Record<string, string>",
      formComponent: "I18nTextField",
      inputType: "text",
      component: "I18nText",
      options: [],
    };
  }

  // Default fallback
  return {
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Text",
    options: [],
  };
}

export function getDefaultValue(tsType: string): string {
  if (tsType === "number") return "0";
  if (tsType === "boolean") return "false";
  if (tsType === "Date") return "new Date()";
  if (tsType === "Record<string, string>") return "{}";
  return '""';
}

/**
 * Detect i18n field pairs in a list of FieldInfo entries.
 * Mutates fields in place: marks plain fields with isI18nPair=true,
 * sets baseFieldName on i18n fields, and inherits textarea component.
 */
export function detectI18nFieldPairs(fields: FieldInfo[]): void {
  for (const field of fields) {
    if (field.name.endsWith("I18n") && field.tsType === "Record<string, string>") {
      const baseName = field.name.slice(0, -4);
      const plainField = fields.find((f) => f.name === baseName);
      if (plainField) {
        plainField.isI18nPair = true;
        field.baseFieldName = baseName;
        if (plainField.formComponent === "TextareaField") {
          field.formComponent = "I18nTextareaField";
          field.component = "I18nTextarea";
        }
      }
    }
  }
}

/**
 * Convert snapshot EntityField[] to FieldInfo[] as a fallback when
 * Zod schema parsing fails (e.g., read-only entities with no Body schema).
 */
export function entityFieldsToFieldInfo(fields: EntityField[]): FieldInfo[] {
  const result = fields
    .filter((f) => (f.type !== "object" && f.type !== "array") || (f.type === "object" && f.name.endsWith("I18n")))
    .map((f) => {
      // i18n map fields: object type with I18n suffix
      if (f.type === "object" && f.name.endsWith("I18n")) {
        const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
        return {
          name: f.name,
          capitalizedName,
          label: capitalizedName.replace(/([A-Z])/g, " $1").trim(),
          tsType: "Record<string, string>",
          formComponent: "I18nTextField",
          inputType: "text",
          component: "I18nText",
          options: [],
          defaultValue: getDefaultValue("Record<string, string>"),
          isForeignKey: false,
          fkEntityField: null,
          isSystemField: false,
          isI18nPair: false,
          baseFieldName: fields.some((pf) => pf.name === f.name.slice(0, -4)) ? f.name.slice(0, -4) : null,
        };
      }

      let tsType = "string";
      let formComponent = "TextField";
      let inputType = "text";
      let component = "Text";
      let options: string[] = [];

      if (f.type === "number" || f.type === "integer") {
        tsType = "number";
        formComponent = "NumberField";
        inputType = "number";
        component = "Number";
      } else if (f.type === "boolean") {
        tsType = "boolean";
        formComponent = "SwitchField";
        inputType = "checkbox";
        component = "Boolean";
      } else if (f.format === "date-time" || f.format === "date") {
        tsType = "string";
        formComponent = "DateField";
        inputType = "date";
        component = "Date";
      }

      if (f.enum && f.enum.length > 0) {
        formComponent = "SelectField";
        inputType = "select";
        component = "Select";
        options = f.enum;
      }

      const capitalizedName = f.name.charAt(0).toUpperCase() + f.name.slice(1);
      const isForeignKey = tsType === "string" && f.name.endsWith("Id") && f.name !== "id";
      const fkEntityField = isForeignKey ? f.name.slice(0, -2) : null;
      return {
        name: f.name,
        capitalizedName,
        label: capitalizedName.replace(/([A-Z])/g, " $1").trim(),
        tsType,
        formComponent,
        inputType,
        component,
        options,
        defaultValue: getDefaultValue(tsType),
        isForeignKey,
        fkEntityField,
        isSystemField: SYSTEM_FIELDS.includes(f.name),
        isI18nPair: false,
        baseFieldName: null,
      };
    });

  detectI18nFieldPairs(result);

  return result;
}

export function parseSchemaFields(content: string, entityName: string): FieldInfo[] {
  const EntityPascal = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  // Build multiple patterns: simplix-react style + Orval style.
  // Patterns use \w* infixes to support both standard Orval (UpdatePetBody)
  // and Boot-style naming (AdminUserAccountRestUpdateBody).
  const schemaPatterns = [
    // simplix-react: petSchema = z.object(
    new RegExp(
      `(?:export\\s+)?(?:const|let)\\s+\\w*${entityName}\\w*[Ss]chema\\s*=\\s*(?:z|zod)\\.object\\(`,
      "igs",
    ),
    // Orval Body: UpdatePetBody / AdminUserAccountRestUpdateBody = zod.object(
    // Only match Body (request) types - Response types contain envelope fields
    // (type, message, body, timestamp, errorCode, errorDetail) not entity fields.
    new RegExp(
      `(?:export\\s+)?(?:const|let)\\s+\\w*${EntityPascal}\\w*Body\\s*=\\s*(?:z|zod)\\.object\\(`,
      "igs",
    ),
  ];

  // Try each pattern; find ALL matches and pick the result with the most fields.
  // This ensures we pick the best schema (e.g. UpdateBody with 20 fields over
  // ChangePasswordBody with 2 fields).
  // Skip search/filter request bodies (e.g. EventRestSearchBody) - they contain
  // query parameters (conditions, page, size), not entity fields.
  const searchBodyRe = /Search\w*Body/i;
  let bestFields: FieldInfo[] = [];

  for (const schemaPattern of schemaPatterns) {
    let match: RegExpExecArray | null;
    while ((match = schemaPattern.exec(content)) !== null) {
      if (searchBodyRe.test(match[0])) continue;
      const parsed = parseZodObjectBody(content, match);
      if (parsed.length > bestFields.length) {
        bestFields = parsed;
      }
    }
  }

  return bestFields;
}

function parseZodObjectBody(content: string, match: RegExpExecArray): FieldInfo[] {
  const fields: FieldInfo[] = [];

  const openBrace = content.indexOf("{", match.index + match[0].length - 1);
  if (openBrace === -1) return fields;

  const body = extractBraceBlock(content, openBrace);

  // Parse only top-level fields by tracking nesting depth
  const seen = new Set<string>();
  let i = 0;
  while (i < body.length) {
    // Skip whitespace and commas
    while (i < body.length && /[\s,]/.test(body[i])) i++;
    if (i >= body.length) break;

    // Match field name: identifier (or quoted string) followed by ':'
    const fieldNameMatch = body.slice(i).match(/^(?:"(\w+)"|(\w+))\s*:\s*/);
    if (!fieldNameMatch) {
      const nextLine = body.indexOf("\n", i);
      i = nextLine === -1 ? body.length : nextLine + 1;
      continue;
    }

    const name = fieldNameMatch[1] ?? fieldNameMatch[2];
    i += fieldNameMatch[0].length;

    // Extract the Zod expression, tracking brace/paren/bracket depth.
    // String literals are skipped to avoid counting parentheses inside
    // .describe('...unbalanced ( inside...') as nesting changes.
    const exprStart = i;
    let depth = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === "'" || ch === '"' || ch === "`") {
        // Skip string literal contents
        const quote = ch;
        i++;
        while (i < body.length && body[i] !== quote) {
          if (body[i] === "\\" && i + 1 < body.length) i++; // skip escaped char
          i++;
        }
        // i now points at the closing quote (or end of body)
      } else if (ch === "(" || ch === "{" || ch === "[") depth++;
      else if (ch === ")" || ch === "}" || ch === "]") {
        if (depth === 0) break;
        depth--;
      } else if (ch === "," && depth === 0) break;
      i++;
    }
    const zodExpr = body.slice(exprStart, i).trim();
    if (i < body.length && body[i] === ",") i++;

    // Deduplicate fields
    if (seen.has(name)) continue;
    seen.add(name);

    // Skip nested object types - not rendered as scalar fields
    if (/^(?:z|zod)\.object\(/.test(zodExpr) || /(?:z|zod)\.array\(\s*(?:z|zod)\.object\(/.test(zodExpr)) continue;

    const parsed = parseZodType(zodExpr);
    const isForeignKey = parsed.tsType === "string" && name.endsWith("Id") && name !== "id";
    const fkEntityField = isForeignKey ? name.slice(0, -2) : null;
    fields.push({
      ...parsed,
      name,
      capitalizedName: name.charAt(0).toUpperCase() + name.slice(1),
      label: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
      defaultValue: parsed.options.length > 0 ? `"${parsed.options[0]}"` : getDefaultValue(parsed.tsType),
      isForeignKey,
      fkEntityField,
      isSystemField: SYSTEM_FIELDS.includes(name),
      isI18nPair: false,
      baseFieldName: null,
    });
  }

  detectI18nFieldPairs(fields);

  return fields;
}

async function searchDir(dir: string): Promise<string[]> {
  const results: string[] = [];
  if (!(await pathExists(dir))) return results;

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules" &&
      entry.name !== "dist"
    ) {
      results.push(...(await searchDir(fullPath)));
    } else if (
      entry.isFile() &&
      (entry.name === "schemas.ts" ||
        entry.name === "contract.ts" ||
        entry.name.endsWith(".schema.ts") ||
        entry.name.endsWith(".zod.ts"))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

interface SchemaResult {
  path: string;
  content: string;
  packageName: string | null;
}

/**
 * What the list projection actually returns, as property name to declared TypeScript type.
 *
 * The scaffold's field set comes from the write schema, which is the union of what a record
 * holds; a list projection is deliberately narrower. Emitting a column for a field the list
 * never returns produces a screen that does not compile, and the author only finds out after
 * the generator has reported success - so the columns are limited to what the row type has.
 *
 * <p>The declared type is kept because it is where an enum field names its enum: the write
 * schema knows only the constants, while the row type says which enum they belong to, and a
 * badge needs that name to show a label rather than the constant.
 *
 * @param rootDir workspace root
 * @param listRowType the list DTO's type name (e.g. `UserAccountListDTO`)
 * @returns the properties, or null when the model file cannot be read
 */
async function readListDtoFieldNames(
  rootDir: string,
  listRowType: string | null,
): Promise<Map<string, string> | null> {
  if (!listRowType) return null;
  const fileBase = listRowType.charAt(0).toLowerCase() + listRowType.slice(1);
  const packagesDir = join(rootDir, "packages");
  let packages: string[];
  try {
    packages = await readdir(packagesDir);
  } catch {
    return null;
  }
  for (const pkg of packages) {
    const modelPath = join(packagesDir, pkg, "src/generated/model", `${fileBase}.ts`);
    if (!(await pathExists(modelPath))) continue;
    const content = await readFile(modelPath, "utf-8");
    const at = content.indexOf(`interface ${listRowType}`);
    if (at < 0) continue;
    const names = new Map<string, string>();
    for (const m of content.slice(at).matchAll(/^ {2}(\w+)\??:\s*([^;]+);/gm)) {
      names.set(m[1], m[2].trim());
    }
    if (names.size > 0) return names;
  }
  return null;
}

export async function findSchemaFile(
  rootDir: string,
  entityName: string,
): Promise<SchemaResult | null> {
  const packagesDir = join(rootDir, "packages");
  const schemaFiles = await searchDir(packagesDir);

  // Build patterns: simplix-react style (petSchema) + Orval style (UpdatePetBody)
  // \w* infixes support Boot-style naming (AdminUserAccountRestUpdateBody)
  const EntityPascal = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const patterns = [
    // simplix-react: petSchema = z.object(, and petSchema = parentSchema.extend(
    //
    // The `.extend(` alternative is what makes an inherited DTO discoverable. SimpliX Meta-driven
    // generator preserves the Java inheritance chain, so a type with a parent is emitted as
    // `ChildSchema = ParentSchema.extend({ ...own fields... })` and never writes `z.object` under
    // its own name. Without this, an entity whose every DTO extends another - 27 of the capture's
    // 139 - is found by nothing here, and the scaffold falls back to its placeholder field set
    // with no warning, reporting success while emitting an id/name form.
    //
    // Orval's own zod output inlines inheritance and contains no `.extend(` at all, so the
    // alternative cannot change which file is found on the existing path.
    new RegExp(
      `\\w*${entityName}\\w*[Ss]chema\\s*=\\s*(?:(?:z|zod)\\.object|\\w+[Ss]chema\\.extend)`,
      "i",
    ),
    // Orval Body: UpdatePetBody / AdminUserAccountRestUpdateBody = zod.object(
    new RegExp(`\\w*${EntityPascal}\\w*Body\\s*=\\s*(?:z|zod)\\.object`, "i"),
    // Orval Body|Response: GetPetByIdResponse / AdminUserAccountRestGetResponse = zod.object(
    new RegExp(`\\w*${EntityPascal}\\w*(?:Body|Response)\\s*=\\s*(?:z|zod)\\.object`, "i"),
  ];

  for (const filePath of schemaFiles) {
    const content = await readFile(filePath, "utf-8");
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        const packageName = await resolvePackageName(filePath);
        return { path: filePath, content, packageName };
      }
    }
  }

  return null;
}

export async function resolvePackageName(
  schemaPath: string,
): Promise<string | null> {
  let dir = resolve(schemaPath, "..");
  const root = resolve("/");
  while (dir !== root) {
    const pkgJsonPath = join(dir, "package.json");
    if (await pathExists(pkgJsonPath)) {
      try {
        const raw = await readFile(pkgJsonPath, "utf-8");
        const pkg = JSON.parse(raw) as { name?: string };
        return pkg.name ?? null;
      } catch {
        return null;
      }
    }
    dir = resolve(dir, "..");
  }
  return null;
}

/** Every module of the project as its `--module` spelling, grouped ones as `<group>/<module>`. */
export async function findModuleDirs(rootDir: string): Promise<string[]> {
  const config = await loadConfig(rootDir);
  return findModulePaths(rootDir, config.modules?.groups);
}

export interface EntityOperations {
  hasList: boolean;
  hasGet: boolean;
  hasCreate: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  hasTree: boolean;
}

const CRUD_NAMES = new Set(["list", "get", "create", "update", "delete", "multiUpdate", "batchUpdate", "batchDelete", "search", "tree", "subtree"]);

/** Extract content inside matched braces starting from the `{` at startIndex. */
function extractBraceBlock(content: string, openBraceIndex: number): string {
  let depth = 1;
  let i = openBraceIndex + 1;
  while (i < content.length && depth > 0) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    i++;
  }
  return content.slice(openBraceIndex + 1, i - 1);
}

/** Find the `{` after a key pattern and extract the brace-balanced block. */
function findBlock(content: string, keyPattern: RegExp): string | null {
  const match = keyPattern.exec(content);
  if (!match) return null;
  const braceIndex = content.indexOf("{", match.index + match[0].length - 1);
  if (braceIndex === -1) return null;
  return extractBraceBlock(content, braceIndex);
}

/** Extract operation names and their roles from an operations block. */
function extractOperationRoles(
  opsBlock: string,
  detectedRoles: Set<string>,
): void {
  const opNamePattern = /^\s*(\w+)\s*:/gm;
  let opMatch: RegExpExecArray | null;
  while ((opMatch = opNamePattern.exec(opsBlock)) !== null) {
    const opName = opMatch[1];
    if (CRUD_NAMES.has(opName)) {
      detectedRoles.add(opName);
    } else {
      const roleMatch = opsBlock
        .slice(opMatch.index)
        .match(
          new RegExp(
            `${opName}\\s*:\\s*\\{[^}]*role\\s*:\\s*["'](\\w+)["']`,
          ),
        );
      if (roleMatch && CRUD_NAMES.has(roleMatch[1])) {
        detectedRoles.add(roleMatch[1]);
      }
    }
  }
}

export async function parseEntityOperations(
  rootDir: string,
  entityName: string,
): Promise<EntityOperations> {
  const allTrue: EntityOperations = {
    hasList: true,
    hasGet: true,
    hasCreate: true,
    hasUpdate: true,
    hasDelete: true,
    hasTree: false,
  };

  // 1. crud.config.ts takes priority
  const crudConfig = await findCrudConfigForEntity(rootDir, entityName);
  if (crudConfig) {
    return {
      hasList: !!crudConfig.list,
      hasGet: !!crudConfig.get,
      hasCreate: !!crudConfig.create,
      hasUpdate: !!crudConfig.update,
      hasDelete: !!crudConfig.delete,
      hasTree: !!crudConfig.tree,
    };
  }

  // 2. Fallback: contract.ts-based detection
  const packagesDir = join(rootDir, "packages");
  const contractFiles = (await searchDir(packagesDir)).filter((f) =>
    f.endsWith("contract.ts"),
  );

  if (contractFiles.length === 0) return allTrue;

  let foundEntity = false;
  const detectedRoles = new Set<string>();

  // Phase 1: Parse generated contract
  for (const contractPath of contractFiles) {
    if (!contractPath.includes("/generated/")) continue;

    const content = await readFile(contractPath, "utf-8");

    const entityKeyPattern = new RegExp(`${entityName}\\s*:\\s*\\{`);
    const entityBlock = findBlock(content, entityKeyPattern);
    if (!entityBlock) continue;
    foundEntity = true;

    const opsBlock = findBlock(entityBlock, /operations\s*:\s*\{/);
    if (!opsBlock) continue;

    extractOperationRoles(opsBlock, detectedRoles);
  }

  // Phase 2: Parse user-owned contract (customizeApi patches)
  for (const contractPath of contractFiles) {
    if (contractPath.includes("/generated/")) continue;

    const content = await readFile(contractPath, "utf-8");
    if (!content.includes("customizeApi")) continue;

    const entityKeyPattern = new RegExp(`${entityName}\\s*:\\s*\\{`);
    const entityBlock = findBlock(content, entityKeyPattern);
    if (!entityBlock) continue;

    const opsBlock = findBlock(entityBlock, /operations\s*:\s*\{/);
    if (!opsBlock) continue;

    foundEntity = true;

    // Parse patch operations: added or removed (null)
    const patchOpPattern = /^\s*(\w+)\s*:\s*(null|\{[^}]*\})/gm;
    let patchOpMatch: RegExpExecArray | null;
    while ((patchOpMatch = patchOpPattern.exec(opsBlock)) !== null) {
      const opName = patchOpMatch[1];
      const opValue = patchOpMatch[2].trim();

      if (opValue === "null") {
        // Remove: delete the role if the op name IS a CRUD name
        if (CRUD_NAMES.has(opName)) {
          detectedRoles.delete(opName);
        }
      } else if (CRUD_NAMES.has(opName)) {
        detectedRoles.add(opName);
      } else {
        const roleMatch = opValue.match(/role\s*:\s*["'](\w+)["']/);
        if (roleMatch && CRUD_NAMES.has(roleMatch[1])) {
          detectedRoles.add(roleMatch[1]);
        }
      }
    }
  }

  if (!foundEntity) return allTrue;

  return {
    hasList: detectedRoles.has("list"),
    hasGet: detectedRoles.has("get"),
    hasCreate: detectedRoles.has("create"),
    hasUpdate: detectedRoles.has("update"),
    hasDelete: detectedRoles.has("delete"),
    hasTree: detectedRoles.has("tree"),
  };
}

// ── Module dependency injection ──

interface PkgJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Ensure the module's package.json has the required dependencies
 * for scaffold-generated files to compile.
 */
/**
 * The dependency a module needs on the UI kit its templates come from: `workspace:*` where the kit
 * is a package of this workspace, its own version otherwise. None where the setting names a path.
 */
async function kitDependency(rootDir: string, from: string | undefined): Promise<{ name: string; spec: string } | null> {
  if (!from || from.startsWith(".") || from.startsWith("/")) return null;
  const dir = await resolveKitPackageDir(rootDir, from);
  if (!dir) return null;
  const installed = dir.startsWith(join(rootDir, "node_modules"));
  if (!installed) return { name: from, spec: "workspace:*" };
  const manifest = await readJsonFile<{ version?: string }>(join(dir, "package.json"));
  return { name: from, spec: manifest.version ? `^${manifest.version}` : "*" };
}

/** Whether `name` resolves from `dir` the way Node resolves a bare import: a `node_modules/<name>` on the way up. */
export async function resolvesFrom(dir: string, name: string): Promise<boolean> {
  let at = resolve(dir);
  for (;;) {
    if (await pathExists(join(at, "node_modules", name, "package.json"))) return true;
    const up = dirname(at);
    if (up === at) return false;
    at = up;
  }
}

async function ensureModuleDeps(
  moduleDir: string,
  domainPackageName: string | null,
  /** The UI kit whose templates drew the files, which then import it. */
  kit: { readonly name: string; readonly spec: string } | null = null,
  /** What the screen's files hold once this run is done; a dependency is added only for one of them that imports it. */
  held: readonly string[] = [],
): Promise<string[]> {
  const pkgPath = join(moduleDir, "package.json");
  if (!(await pathExists(pkgPath))) return [];

  const pkg = await readJsonFile<PkgJson>(pkgPath);
  const deps = pkg.dependencies ?? {};
  const devDeps = pkg.devDependencies ?? {};
  const added: string[] = [];

  // A package the module already resolves (declared, or reached through a declared umbrella and
  // the install's hoisting) is not missing, and adding it would change the lockfile for nothing.
  // One no file of the screen imports is not needed either: a screen drawn from a kit that never
  // reaches the framework package directly must not hand the module a dependency on it.
  const needed = (name: string) => held.some((content) => importsPackage(content, name));
  const missing = async (name: string) => needed(name) && !deps[name] && !(await resolvesFrom(moduleDir, name));

  // @simplix-react/ui
  if (await missing("@simplix-react/ui")) {
    deps["@simplix-react/ui"] = "catalog:";
    added.push(`@simplix-react/ui@catalog:`);
  }

  // @simplix-react/i18n
  if (await missing("@simplix-react/i18n")) {
    deps["@simplix-react/i18n"] = "catalog:";
    added.push(`@simplix-react/i18n@catalog:`);
  }

  if (kit && (await missing(kit.name))) {
    deps[kit.name] = kit.spec;
    added.push(`${kit.name}@${kit.spec}`);
  }

  // Domain package (workspace:*)
  if (domainPackageName && needed(domainPackageName) && !deps[domainPackageName]) {
    deps[domainPackageName] = "workspace:*";
    added.push(`${domainPackageName}@workspace:*`);
  }

  // @types/react: a file of the screen that draws JSX or imports React needs it, and a module that
  // already resolves it (declared in either list, or hoisted) is left alone.
  const drawsJsx = held.some((content) => importsPackage(content, "react") || /<\/[A-Za-z]|\/>/.test(content));
  if (drawsJsx && !devDeps["@types/react"] && !deps["@types/react"] && !(await resolvesFrom(moduleDir, "@types/react"))) {
    devDeps["@types/react"] = depVersion("@types/react");
    added.push(`@types/react@${devDeps["@types/react"]} (dev)`);
  }

  if (added.length > 0) {
    pkg.dependencies = deps;
    pkg.devDependencies = devDeps;
    await writeFileWithDir(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  return added;
}

/**
 * Update the parent widgets/index.ts to include re-exports from a newly
 * scaffolded entity widget folder.
 */
async function updateWidgetsIndex(
  moduleDir: string,
  entityKebab: string,
  ctx: { EntityPascal: string; hasList: boolean; hasForm: boolean; hasDetail: boolean; hasTree?: boolean },
  /** The entity's own rendered `index.ts`; where given, the module barrel re-exports exactly what it does. */
  featureIndex?: string,
): Promise<void> {
  const widgetsIndexPath = join(moduleDir, "src", "widgets", "index.ts");
  if (!(await pathExists(widgetsIndexPath))) {
    await writeFileWithDir(widgetsIndexPath, "");
  }

  let content = await readFile(widgetsIndexPath, "utf-8");

  // Already has exports for this entity → skip
  if (content.includes(`./${entityKebab}"`)) return;

  // Build export lines
  const lines: string[] = [];
  const rendered = featureIndex
    ?.split("\n")
    .filter((line) => /^export (type )?\{[^}]*\} from "\.\/[^"]+";$/.test(line.trim()))
    .map((line) => line.trim().replace(/from "\.\/[^"]+";$/, `from "./${entityKebab}";`));
  if (rendered && rendered.length > 0) {
    lines.push(...rendered);
  } else if (ctx.hasTree) {
    lines.push(`export { ${ctx.EntityPascal}Tree, use${ctx.EntityPascal}Tree } from "./${entityKebab}";`);
  } else if (ctx.hasList) {
    lines.push(`export { ${ctx.EntityPascal}List, ${ctx.EntityPascal}ListToolbar, use${ctx.EntityPascal}List } from "./${entityKebab}";`);
  }
  if (!rendered?.length && ctx.hasForm) {
    lines.push(`export { ${ctx.EntityPascal}Form } from "./${entityKebab}";`);
    lines.push(`export type { ${ctx.EntityPascal}FormValues } from "./${entityKebab}";`);
  }
  if (!rendered?.length && ctx.hasDetail) {
    lines.push(`export { ${ctx.EntityPascal}Detail } from "./${entityKebab}";`);
  }
  if (lines.length === 0) return;

  // Remove placeholder "export {};" if present
  content = content.replace(/^export \{\};\s*$/m, "");

  // Append new exports
  const trimmed = content.trimEnd();
  const newContent = trimmed + (trimmed.length > 0 ? "\n" : "") + lines.join("\n") + "\n";
  await writeFileWithDir(widgetsIndexPath, newContent);
  log.info(`Updated widgets/index.ts with ${ctx.EntityPascal} exports`);
}

// ── Pages generation ──

/** What one entity's pages run left behind. */
interface GeneratedPages {
  /** Page files written by this run. */
  written: string[];
  /**
   * What the page files hold once this run is done: the render for a file this run wrote, the
   * author's content for a file it kept. The module updates read what the screen needs from
   * these and never from a render that was thrown away, since a kept page that no longer
   * imports a module file must not bring that file back.
   */
  onDisk: string[];
  /**
   * Page files whose template rendered to nothing.
   *
   * A page with no content is not a page, and writing one is how a scaffold reports success over
   * an entity it generated no screen for: the module gets a zero-byte barrel nothing imports, the
   * run prints a file count, and the first thing to notice is a dev server failing to resolve it.
   * These are named to the caller instead, which fails the run.
   */
  empty: string[];
}

async function generatePages(
  moduleDir: string,
  entityKebab: string,
  ctx: Record<string, unknown>,
  /** What the project has taken over; empty where it has taken nothing over. */
  templates: ProjectTemplates = new Map(),
  /** The arguments that reproduce this render, recorded after each fingerprint. */
  origin?: string,
): Promise<GeneratedPages> {
  const pagesDir = join(moduleDir, "src", "pages", entityKebab);
  const generated: string[] = [];
  const empty: string[] = [];

  const pageFiles: Record<string, string> = {};

  // CrudPage (list/tree + detail + new + edit in one component)
  if (ctx.hasTree && ctx.hasDetail) {
    pageFiles["crud-page.tsx"] = renderTemplate(templateFor(templates, "tree-crud-page", treeCrudPageTemplate), ctx);
  } else if (ctx.hasList && ctx.hasDetail) {
    pageFiles["crud-page.tsx"] = renderTemplate(templateFor(templates, "crud-page", crudPageTemplate), ctx);
  } else if (!ctx.hasList && !ctx.hasTree && ctx.hasCreate) {
    // Hub page for creation-only entities (no list operation)
    pageFiles["list-page.tsx"] = renderTemplate(templateFor(templates, "hub-page", hubPageTemplate), ctx);
  }

  // Index barrel
  pageFiles["index.ts"] = renderTemplate(templateFor(templates, "page-index", pageIndexTemplate), ctx);

  // A template a project supplies to hold the page's hand-written parts. Written once and never
  // again: it is the file the author edits, and the whole point of it existing is that the
  // generated page beside it can be rewritten without reading anything a person put there.
  //
  // <p><b>Refreshed, never created.</b> A page that departs from nothing has nothing to put in
  // this file, and a scaffold that writes one anyway leaves an empty hook per page - fifty-eight
  // of them in one console, each saying "this screen is different" while saying nothing. So the
  // file is rendered only where the author already made one, and a page needing its first
  // departure gets it by copying the template.
  const blocks = templates.get(PAGE_BLOCKS_TEMPLATE);
  const writeOnce = new Set<string>();
  // A page template that imports its blocks needs the file to exist, so it is laid down once.
  const pageImportsBlocks = Object.values(pageFiles).some((content) => content.includes(`./${PAGE_BLOCKS_TEMPLATE}"`));
  if (blocks !== undefined && (pageImportsBlocks || (await pathExists(join(pagesDir, `${PAGE_BLOCKS_TEMPLATE}.tsx`))))) {
    pageFiles[`${PAGE_BLOCKS_TEMPLATE}.tsx`] = renderTemplate(blocks, ctx);
    writeOnce.add(`${PAGE_BLOCKS_TEMPLATE}.tsx`);
  }

  const onDisk: string[] = [];

  for (const [fileName, content] of Object.entries(pageFiles)) {
    const filePath = join(pagesDir, fileName);
    const stamped = content.includes(GENERATED_PAGE_MARKER) ? stampFingerprint(content, origin) : content;
    if (stamped.trim().length === 0) {
      empty.push(fileName);
      continue;
    }
    if (stamped !== content && !writeOnce.has(fileName)) {
      // A page is scaffolded and then written on, so carrying the marker proves only where the
      // file came from. Untouched, it is rewritten; edited, the template change is merged into it
      // three-way against the render last written, and a conflict leaves it alone.
      const { outcome, held } = await writeStampedGenerated(filePath, stamped);
      if (outcome === "written" || outcome === "merged") generated.push(fileName);
      if (outcome !== "written") log.warn(`pages/${entityKebab}/${fileName}: ${outcome}`);
      onDisk.push(held);
      continue;
    }
    if (await pathExists(filePath)) {
      noteKeptRender(filePath, stamped);
      onDisk.push(await readFile(filePath, "utf-8"));
      log.warn(`Skipping pages/${entityKebab}/${fileName} - file already exists`);
      continue;
    }
    await writeFileWithDir(filePath, stamped);
    generated.push(fileName);
    onDisk.push(stamped);
  }

  return { written: generated, empty, onDisk };
}

/** Whether a file imports the module's hand-kept permission map. */
export function importsSubjects(content: string): boolean {
  return content.includes("shared/auth/subjects");
}

/** Whether a file reads the module's own widgets catalog (`<namespace>/widgets`). */
export function readsWidgetsNamespace(content: string, moduleNamespace: string): boolean {
  return content.includes(`"${moduleNamespace}/widgets"`);
}

/**
 * Whether a file translates a key under the entity's block of the widgets catalogue
 * (`t("<entity>.save<Entity>")`), the keys the bundled templates read and
 * {@link updateLocaleJsons} defaults.
 */
export function readsEntityKeys(content: string, entity: string): boolean {
  const escaped = entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bt\\(\\s*["'\`]${escaped}\\.`).test(content);
}

/** Whether a file imports package `name` or a subpath of it. */
export function importsPackage(content: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return new RegExp(`(?:from\\s+|import\\s+|import\\(\\s*)["']${escaped}(?:["']|\\/)`).test(content);
}

/** The module paths a permission map import `../../shared/auth/subjects` resolves to. */
const SUBJECTS_CANDIDATES = ["subjects.ts", "subjects.tsx", join("subjects", "index.ts"), join("subjects", "index.tsx")];

/**
 * Guarantees the module has a permission-subject map for a generated page to read.
 *
 * Called only when a file the screen holds after this run imports the map, and then only when no
 * file the import can resolve to exists: a module that keeps its map as `subjects.tsx` or in a
 * folder is not handed a second, empty one.
 *
 * The page gates its create action on `useCan("create", SUBJECTS.<entity>)`, and only the
 * backend knows which group guards the entity's endpoints - so the map is declared, never
 * guessed. Creating it empty makes the missing entry a compile error on the generated page,
 * which is where the author is already looking.
 */
async function ensureSubjectsFile(moduleDir: string): Promise<void> {
  const authDir = join(moduleDir, "src", "shared", "auth");
  for (const candidate of SUBJECTS_CANDIDATES) {
    if (await pathExists(join(authDir, candidate))) return;
  }
  const subjectsPath = join(authDir, "subjects.ts");
  await writeFileWithDir(
    subjectsPath,
    [
      "/**",
      " * Permission group guarding each screen in this module, mirroring the backend's",
      " * `hasPermission('<group>', '<action>')`. A screen reads its group from here so the affordances",
      " * it offers and the rule the server enforces are changed in one place.",
      " */",
      "export const SUBJECTS = {",
      "} as const;",
      "",
    ].join("\n"),
  );
  log.info("Created shared/auth/subjects.ts - add the entity's permission group to it");
}

async function updatePagesIndex(
  moduleDir: string,
  entityKebab: string,
  ctx: Record<string, unknown>,
): Promise<void> {
  const pagesIndexPath = join(moduleDir, "src", "pages", "index.ts");

  // Create pages/index.ts when absent, carrying the locale side-effect import
  if (!(await pathExists(pagesIndexPath))) {
    await writeFileWithDir(
      pagesIndexPath,
      '// Side-effect: register module translations\nimport "../locales";\n',
    );
  }

  let content = await readFile(pagesIndexPath, "utf-8");
  if (content.includes(`./${entityKebab}"`)) return;

  // Build export lines
  const exports: string[] = [];
  if ((ctx.hasList || ctx.hasTree) && ctx.hasDetail) {
    exports.push(`${ctx.EntityPascal}CrudPage`);
  } else if (!ctx.hasList && !ctx.hasTree && ctx.hasCreate) {
    exports.push(`${ctx.EntityPascal}ListPage`);
  }
  if (exports.length === 0) return;

  const line = `export { ${exports.join(", ")} } from "./${entityKebab}";`;
  content = content.replace(/^export \{\};\s*$/m, "");
  const trimmed = content.trimEnd();
  await writeFileWithDir(pagesIndexPath, trimmed + (trimmed.length > 0 ? "\n" : "") + line + "\n");
  log.info("Updated pages/index.ts");
}

async function updateModuleIndex(moduleDir: string): Promise<void> {
  const indexPath = join(moduleDir, "src", "index.ts");
  if (!(await pathExists(indexPath))) return;

  const content = await readFile(indexPath, "utf-8");
  if (content.includes('"./pages"')) return;

  await writeFileWithDir(indexPath, content.trimEnd() + '\nexport * from "./pages";\n');
  log.info("Updated src/index.ts with pages export");
}

/** Source text with its block and line comments removed, for a check that reads code and not prose. */
export function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}

async function ensureWidgetsLocaleFiles(moduleDir: string, locales: string[]): Promise<void> {
  for (const locale of locales) {
    const jsonPath = join(moduleDir, "src", "locales", "widgets", `${locale}.json`);
    if (!(await pathExists(jsonPath))) await writeFileWithDir(jsonPath, "{}\n");
  }
}

async function updateLocalesIndex(
  moduleDir: string,
  locales: string[],
): Promise<void> {
  const localesIndexPath = join(moduleDir, "src", "locales", "index.ts");
  if (!(await pathExists(localesIndexPath))) return;

  let content = await readFile(localesIndexPath, "utf-8");

  // widgets mapping already exists → skip (check both quoted and unquoted key forms). A comment
  // that names the catalogue (`widgets: ...`) is not a registration, so the code is read without it.
  if (/\bwidgets\s*[:{]/.test(withoutComments(content))) return;

  // Build lazy import lines for each locale
  const importLines = locales.map(
    (l) => `      ${l}: () => import("./widgets/${l}.json"),`,
  ).join("\n");
  const widgetsEntry = `    widgets: {\n${importLines}\n    },`;

  // Find `components: {` and insert widgets entry using brace-counting
  const componentsMatch = content.match(/components:\s*\{/);
  if (!componentsMatch || componentsMatch.index == null) return;

  const openBrace = content.indexOf("{", componentsMatch.index + "components".length);
  if (openBrace === -1) return;

  // Find matching closing brace using depth counting
  let depth = 1;
  let i = openBrace + 1;
  while (i < content.length && depth > 0) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    i++;
  }
  const closeBrace = i - 1;

  // Insert widgets entry before the closing brace of `components`
  const innerContent = content.slice(openBrace + 1, closeBrace);
  const newInner = innerContent.trimEnd() + "\n" + widgetsEntry + "\n  ";
  content = content.slice(0, openBrace + 1) + newInner + content.slice(closeBrace);

  await writeFileWithDir(localesIndexPath, content);
  log.info("Updated locales/index.ts with widgets component");
}

async function updateLocaleJsons(
  moduleDir: string,
  entityName: string,
  EntityPascal: string,
  locales: string[],
  ops: EntityOperations,
  hasTree = false,
): Promise<void> {
  for (const locale of locales) {
    const jsonPath = join(moduleDir, "src", "locales", "widgets", `${locale}.json`);
    if (!(await pathExists(jsonPath))) continue;

    const raw = await readFile(jsonPath, "utf-8");
    const json = JSON.parse(raw || "{}") as Record<string, Record<string, string>>;

    // Entity key already exists → skip
    if (json[entityName]) continue;

    // Entity-specific default keys
    const entityPlural = `${entityName}s`;
    const EntityPluralPascal = `${EntityPascal}s`;
    const entityKeys: Record<string, string> = {};
    if (!ops.hasList && !hasTree) {
      entityKeys.title = EntityPluralPascal;
      entityKeys.description = `Create or manage ${entityPlural}.`;
    } else {
      entityKeys[entityPlural] = EntityPluralPascal;
      entityKeys[`${entityPlural}Description`] = `Create or manage ${entityPlural}.`;
      entityKeys.searchPlaceholder = `Search ${entityName}...`;
      entityKeys.view = "View";
      entityKeys.edit = "Edit";
      entityKeys.delete = "Delete";
      entityKeys.back = "Back";
    }
    // Form/detail Section headers reference `<entity>.sectionTitle` for every entity.
    entityKeys.sectionTitle = `${EntityPascal} Information`;
    if (ops.hasCreate) entityKeys[`new${EntityPascal}`] = `New ${EntityPascal}`;
    if (ops.hasCreate) entityKeys[`addNew${EntityPascal}`] = `Add New ${EntityPascal}`;
    if (ops.hasCreate || ops.hasUpdate) entityKeys[`save${EntityPascal}`] = `Save ${EntityPascal}`;
    if (ops.hasUpdate) entityKeys[`edit${EntityPascal}`] = `Edit ${EntityPascal}`;
    if (ops.hasDelete) {
      entityKeys[`delete${EntityPascal}Title`] = `Delete ${EntityPascal}`;
      entityKeys[`delete${EntityPascal}Desc`] = `Are you sure you want to delete "{{name}}"? This action cannot be undone.`;
      entityKeys[`delete${EntityPascal}DescSimple`] = `Are you sure you want to delete this ${entityName}? This action cannot be undone.`;
    }
    if (ops.hasGet) {
      entityKeys[`${entityName}Detail`] = `${EntityPascal} Detail`;
      entityKeys.notFound = `${EntityPascal} not found.`;
      entityKeys.detailHeader = `detail: {{id}}`;
    }
    if (ops.hasCreate) entityKeys.newHeader = "new";
    if (ops.hasUpdate) entityKeys.editHeader = `edit: {{id}}`;
    entityKeys.cancel = "Cancel";
    entityKeys.emptyTitle = `No ${entityPlural} found`;
    entityKeys.emptyDescription = `Create a new ${entityName} to get started.`;
    entityKeys.yes = "Yes";
    entityKeys.no = "No";

    json[entityName] = entityKeys;
    await writeFileWithDir(jsonPath, JSON.stringify(json, null, 2) + "\n");
  }
  log.info("Updated locale JSON files with entity translations");
}

async function ensureTsupPagesEntry(moduleDir: string): Promise<void> {
  const tsupPath = join(moduleDir, "tsup.config.ts");
  if (!(await pathExists(tsupPath))) return;

  let content = await readFile(tsupPath, "utf-8");
  if (content.includes('"pages/index"')) return;

  content = content.replace(
    '"widgets/index": "src/widgets/index.ts"',
    '"widgets/index": "src/widgets/index.ts",\n    "pages/index": "src/pages/index.ts"',
  );
  await writeFileWithDir(tsupPath, content);
  log.info("Updated tsup.config.ts with pages entry");
}

async function ensurePackageJsonPagesExport(moduleDir: string): Promise<void> {
  const pkgPath = join(moduleDir, "package.json");
  if (!(await pathExists(pkgPath))) return;

  const pkg = await readJsonFile<Record<string, unknown>>(pkgPath);
  const exports = (pkg.exports ?? {}) as Record<string, unknown>;
  if (exports["./pages"]) return;

  // `source` first, and first in the object. A dev server resolves a workspace package through
  // `resolve.conditions: ["source"]`, so an entry without it falls through to `import` - the built
  // output - and every source edit under `./pages` is invisible in the browser while HMR reports a
  // successful update. Nothing errors; the screen simply goes on showing the code as it was at the
  // last build. The module's own three entries are written with it by the template, so a module
  // acquires exactly one entry that is wrong at the moment somebody scaffolds its first page.
  exports["./pages"] = {
    source: "./src/pages/index.ts",
    types: "./src/pages/index.ts",
    import: "./dist/pages/index.js",
  };
  pkg.exports = exports;
  await writeFileWithDir(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  log.info("Updated package.json with pages export");
}

/**
 * Resolves a `--module` value against the project's `modules.groups`, ending the run with the
 * reason when it names an undeclared group or a group itself.
 */
export async function resolveModuleOption(rootDir: string, value: string): Promise<ModulePath> {
  const config = await loadConfig(rootDir);
  try {
    return parseModulePath(value, config.modules?.groups);
  } catch (error) {
    if (!(error instanceof ModulePathError)) throw error;
    log.error(error.message);
    process.exit(1);
    throw error;
  }
}

export async function resolveModuleNamespace(moduleDir: string): Promise<string> {
  const pkgPath = join(moduleDir, "package.json");
  if (!(await pathExists(pkgPath))) return "unknown";
  const pkg = await readJsonFile<{ name: string }>(pkgPath);
  // "@sample-petstore/sample-petstore-petstore" → "sample-petstore-petstore"
  return pkg.name.replace(/^@[^/]+\//, "");
}

/**
 * Parse the Orval-generated mutation function to find path parameter names.
 * Searches for `const { ...fields } = props` in the mutation options function
 * and returns the first field that isn't "data" or "params".
 *
 * @example
 * - `const { data } = props` → returns null (body-only mutation)
 * - `const { petId } = props` → returns "petId" (path-param-only mutation)
 * - `const { username, data } = props` → returns "username" (path-param + body)
 */
export async function findMutationPathParam(
  rootDir: string,
  operationId: string,
): Promise<string | null> {
  const capitalizedOp = operationId.charAt(0).toUpperCase() + operationId.slice(1);
  const mutOptsFn = `get${capitalizedOp}MutationOptions`;

  // Search all packages for the generated mutation
  const packagesDir = join(rootDir, "packages");
  if (!(await pathExists(packagesDir))) return null;

  const packages = await readdir(packagesDir, { withFileTypes: true });
  for (const pkg of packages) {
    if (!pkg.isDirectory()) continue;
    const endpointsDir = join(packagesDir, pkg.name, "src", "generated", "endpoints");
    if (!(await pathExists(endpointsDir))) continue;

    const entries = await readdir(endpointsDir, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
      if (entry.name.endsWith(".msw.ts") || entry.name.endsWith(".zod.ts")) continue;

      const filePath = join(entry.parentPath ?? endpointsDir, entry.name);
      const content = await readFile(filePath, "utf-8");
      if (!content.includes(mutOptsFn)) continue;

      const idx = content.indexOf(mutOptsFn);
      const slice = content.slice(idx, idx + 2000);
      const match = slice.match(/const\s*\{\s*([^}]+)\}\s*=\s*props/);
      if (!match) continue;

      const fields = match[1]
        .split(",")
        .map((f) => f.trim().split(":")[0].trim())
        .filter((f) => f !== "data" && f !== "params");

      return fields.length > 0 ? fields[0] : null;
    }
  }

  return null;
}

// ── Snapshot-based entity lookup ──

export async function findEntityFromSnapshot(
  rootDir: string,
  entityName: string,
): Promise<ExtractedEntity | null> {
  const packagesDir = join(rootDir, "packages");
  if (!(await pathExists(packagesDir))) return null;

  const entries = await readdir(packagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const snapshotPath = join(packagesDir, entry.name, ".openapi-snapshot.json");
    if (!(await pathExists(snapshotPath))) continue;

    const snapshot = await readJsonFile<OpenAPISnapshot>(snapshotPath);
    const entity = snapshot.entities?.find((e) => e.name === entityName);
    if (entity) return entity;
  }
  return null;
}

// ── Filter parameter analysis ──

export interface FilterFieldInfo {
  /** Filter key used in CrudList.filters.values, e.g. "name.contains" */
  filterKey: string;
  /** Component to use: TextFilter, NumberFilter, etc. */
  component: string;
  /** Display label for the filter */
  label: string;
  /** Base field name (e.g. "name", "status") */
  field: string;
  /** Operator suffix (e.g. "contains", "equals") */
  operator: string;
  /** For FacetedFilter: enum options */
  options?: string[];
  /** For DateRangeFilter: the paired gte/lte keys */
  pairedKey?: string;
  /** Value type for type-safe casting */
  valueType: "string" | "number" | "boolean" | "date" | "dateRange" | "array";
  /** All available text operators for this field (used by UnifiedTextFilter grouping) */
  textOperators?: string[];
}

/** Text filter field info for UnifiedTextFilter grouping */
export interface TextFilterFieldInfo {
  field: string;
  operators: string[];
  defaultOperator: string;
}

// Operator suffixes that are valid for text search
const TEXT_OPERATOR_SUFFIXES = ["contains", "notContains", "equals", "notEquals", "startsWith", "endsWith"];

// Map operator suffix to SearchOperator enum key.
// Every suffix a filter can carry needs an entry: a miss is substituted downstream rather than
// left empty (the NumberFilter branch falls back to GREATER_THAN_OR_EQUAL), so an absent operator
// queries the other direction while compiling and reporting nothing.
const SUFFIX_TO_ENUM_KEY: Record<string, string> = {
  contains: "CONTAINS",
  notContains: "NOT_CONTAINS",
  equals: "EQUALS",
  notEquals: "NOT_EQUALS",
  startsWith: "STARTS_WITH",
  endsWith: "ENDS_WITH",
  greaterThan: "GREATER_THAN",
  lessThan: "LESS_THAN",
  greaterThanOrEqualTo: "GREATER_THAN_OR_EQUAL",
  lessThanOrEqualTo: "LESS_THAN_OR_EQUAL",
  in: "IN",
  notIn: "NOT_IN",
  between: "BETWEEN",
  notBetween: "NOT_BETWEEN",
  isNull: "IS_NULL",
  isNotNull: "IS_NOT_NULL",
};

// System params to exclude from filter generation
const SYSTEM_PARAMS = new Set(["ids", "page", "size", "sort"]);
// Audit field prefixes to exclude by default
const AUDIT_PREFIXES = ["createdBy.", "updatedBy.", "deletedTimestamp."];

export function parseFilterParams(
  queryParams: QueryParam[],
  entityFields: EntityField[],
): FilterFieldInfo[] {
  const result: FilterFieldInfo[] = [];
  const fieldMap = new Map(entityFields.map((f) => [f.name, f]));
  const processed = new Set<string>();

  // Pre-process: group params by base field
  const paramsByField = new Map<string, QueryParam[]>();
  for (const qp of queryParams) {
    // Skip system params
    if (SYSTEM_PARAMS.has(qp.name)) continue;
    // Skip id sub-params
    if (qp.name.startsWith("id.")) continue;
    // Skip audit fields
    if (AUDIT_PREFIXES.some((prefix) => qp.name.startsWith(prefix))) continue;

    const dotIdx = qp.name.indexOf(".");
    const baseField = dotIdx > 0 ? qp.name.slice(0, dotIdx) : qp.name;
    const existing = paramsByField.get(baseField) ?? [];
    existing.push(qp);
    paramsByField.set(baseField, existing);
  }

  for (const [baseField, params] of paramsByField) {
    if (processed.has(baseField)) continue;
    processed.add(baseField);

    const entityField = fieldMap.get(baseField);
    const operatorNames = params.map((p) => {
      const dot = p.name.indexOf(".");
      return dot > 0 ? p.name.slice(dot + 1) : "";
    });

    // Capitalize first letter for label
    const label = baseField.charAt(0).toUpperCase() + baseField.slice(1);

    // Rule 1: Boolean field
    if (entityField?.type === "boolean") {
      const equalsParam = params.find((p) => p.name.endsWith(".equals"));
      if (equalsParam) {
        result.push({
          filterKey: equalsParam.name,
          component: "ToggleFilter",
          label,
          field: baseField,
          operator: "equals",
          valueType: "boolean",
        });
      }
      continue;
    }

    // Rule 2a: Country field with .in → CountryFilter
    const isCountryField = /(?:country|countryCode)$/i.test(baseField);
    const inParam = params.find((p) => p.name.endsWith(".in"));
    if (isCountryField && inParam) {
      result.push({
        filterKey: inParam.name,
        component: "CountryFilter",
        label,
        field: baseField,
        operator: "in",
        valueType: "array",
      });
      continue;
    }

    // Rule 2b: Timezone field with .in or .contains → TimezoneFilter
    const isTimezoneField = /(?:timezone|timeZone)$/i.test(baseField);
    if (isTimezoneField && (inParam || params.find((p) => p.name.endsWith(".contains")))) {
      const tzParam = inParam ?? params.find((p) => p.name.endsWith(".contains"))!;
      result.push({
        filterKey: tzParam.name,
        component: "TimezoneFilter",
        label,
        field: baseField,
        operator: inParam ? "in" : "contains",
        valueType: inParam ? "array" : "string",
      });
      continue;
    }

    // Rule 2c: Has .in operator → FacetedFilter
    if (inParam) {
      result.push({
        filterKey: inParam.name,
        component: "FacetedFilter",
        label,
        field: baseField,
        operator: "in",
        options: entityField?.enum,
        valueType: "array",
      });
      continue;
    }

    // Rule 3: Date field with gte+lte pair → DateRangeFilter
    const isDateField =
      entityField?.format === "date-time" ||
      baseField.endsWith("At") ||
      baseField.endsWith("Date") ||
      baseField.endsWith("Time");
    const hasGte = operatorNames.includes("greaterThanOrEqualTo");
    const hasLte = operatorNames.includes("lessThanOrEqualTo");
    if (isDateField && hasGte && hasLte) {
      const gteParam = params.find((p) => p.name.endsWith(".greaterThanOrEqualTo"));
      const lteParam = params.find((p) => p.name.endsWith(".lessThanOrEqualTo"));
      if (gteParam && lteParam) {
        result.push({
          filterKey: gteParam.name,
          component: "DateRangeFilter",
          label,
          field: baseField,
          operator: "greaterThanOrEqualTo",
          pairedKey: lteParam.name,
          valueType: "dateRange",
        });
      }
      continue;
    }

    // Rule 4: Number field with comparison operators → NumberFilter
    const isNumericField =
      entityField?.type === "number" ||
      entityField?.type === "integer" ||
      entityField?.format === "int32" ||
      entityField?.format === "int64" ||
      entityField?.format === "double" ||
      entityField?.format === "float";
    const hasComparison = operatorNames.some((op) =>
      ["greaterThan", "lessThan", "greaterThanOrEqualTo", "lessThanOrEqualTo"].includes(op),
    );
    if (isNumericField && hasComparison) {
      const firstParam = params.find((p) =>
        p.name.endsWith(".greaterThanOrEqualTo") || p.name.endsWith(".equals"),
      ) ?? params[0];
      result.push({
        filterKey: firstParam.name,
        component: "NumberFilter",
        label,
        field: baseField,
        operator: firstParam.name.slice(firstParam.name.indexOf(".") + 1),
        valueType: "number",
      });
      continue;
    }

    // Rule 5: Has .contains → TextFilter with .contains
    const containsParam = params.find((p) => p.name.endsWith(".contains"));
    if (containsParam) {
      // Collect all text-applicable operators for this field
      const textOps = operatorNames
        .filter((op) => TEXT_OPERATOR_SUFFIXES.includes(op))
        .sort((a, b) => TEXT_OPERATOR_SUFFIXES.indexOf(a) - TEXT_OPERATOR_SUFFIXES.indexOf(b));
      result.push({
        filterKey: containsParam.name,
        component: "TextFilter",
        label,
        field: baseField,
        operator: "contains",
        valueType: "string",
        textOperators: textOps.length > 0 ? textOps : ["contains"],
      });
      continue;
    }

    // Rule 6: .equals + entity has enum → FacetedFilter
    const equalsParam = params.find((p) => p.name.endsWith(".equals"));
    if (equalsParam && entityField?.enum) {
      result.push({
        filterKey: equalsParam.name,
        component: "FacetedFilter",
        label,
        field: baseField,
        operator: "equals",
        options: entityField.enum,
        valueType: "string",
      });
      continue;
    }

    // Rule 7: .equals only → TextFilter
    if (equalsParam) {
      // Collect all text-applicable operators for this field
      const textOps = operatorNames
        .filter((op) => TEXT_OPERATOR_SUFFIXES.includes(op))
        .sort((a, b) => TEXT_OPERATOR_SUFFIXES.indexOf(a) - TEXT_OPERATOR_SUFFIXES.indexOf(b));
      result.push({
        filterKey: equalsParam.name,
        component: "TextFilter",
        label,
        field: baseField,
        operator: "equals",
        valueType: "string",
        textOperators: textOps.length > 0 ? textOps : ["equals"],
      });
      continue;
    }
  }

  return result;
}

const PLACEHOLDER_FIELDS: FieldInfo[] = [
  {
    name: "id",
    capitalizedName: "Id",
    label: "ID",
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Text",
    options: [],
    defaultValue: '""',
    isForeignKey: false,
    fkEntityField: null,
    isSystemField: true,
    isI18nPair: false,
    baseFieldName: null,
  },
  {
    name: "name",
    capitalizedName: "Name",
    label: "Name",
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Text",
    options: [],
    defaultValue: '""',
    isForeignKey: false,
    fkEntityField: null,
    isSystemField: false,
    isI18nPair: false,
    baseFieldName: null,
  },
];

export const scaffoldCrudCommand = new Command("scaffold")
  .description("Generate CRUD widgets into an FSD module's widgets/ layer")
  .argument("<entity>", "Entity name (e.g., product, user)")
  .option(
    "--module <dir>",
    "Target FSD module directory (relative to modules/)",
  )
  .option(
    "--output <dir>",
    "Custom output directory (overrides --module, relative to cwd)",
  )
  .option(
    "--native",
    "Generate the mobile entity screen set (EntityList / push detail / full-screen form + expo-router routes)",
  )
  .option(
    "--app <dir>",
    "Target Expo app under apps/ for route files (with --native)",
  )
  .action(reportOutputDirError(runScaffold));

/** The options `simplix scaffold` takes. */
export interface ScaffoldOptions {
  /** Draw no progress spinner: the run is observed in capture mode. */
  quiet?: boolean;
  module?: string;
  output?: string;
  native?: boolean;
  app?: string;
}

/**
 * Generates one entity's widgets and pages: the body of `simplix scaffold <entity>`.
 *
 * <p>Exported so the generated-state report can run the same render in capture mode.
 */
export async function runScaffold(entityArg: string, options: ScaffoldOptions): Promise<void> {
  // Every source below is keyed by the entity's canonical spelling: the crud config's key, the
  // contract's key, the snapshot's `name`, the tag the meta source resolves. Normalising here is
  // what makes the argument's case a matter of taste rather than a matter of which half of the
  // output comes out wired.
  const entity = toEntityName(entityArg);
  if (options.native) {
    // Dynamic import keeps the module graph acyclic (scaffold-native reuses
    // the metadata pipeline exported from this file).
    const { runNativeScaffold } = await import("./scaffold-native.js");
    await runNativeScaffold(entity, { module: options.module, app: options.app });
    return;
  }
  const rootDir = await findProjectRoot(process.cwd());
  // Refused before anything is written: the screen's story goes to the configured directory.
  await assertOutputDirs(rootDir, await loadConfig(rootDir));
  const entityKebab = toKebabCase(entity);
  const EntityPascal = toPascalCase(entity);

  // Resolve output directory
  let outputDir: string;
  let relativeOutput: string;
  let moduleDir: string | null = null;

  if (options.output) {
    // Explicit output overrides everything
    outputDir = resolve(rootDir, options.output);
    relativeOutput = options.output;
  } else if (options.module) {
    // FSD module specified → features/<entity>/; a grouped path's group comes from the config.
    const module = await resolveModuleOption(rootDir, options.module);
    moduleDir = moduleDirOf(rootDir, module);
    outputDir = resolve(moduleDir, "src", "widgets", entityKebab);
    relativeOutput = join("modules", ...module.path.split("/"), "src", "widgets", entityKebab);
  } else {
    // Auto-detect: find available modules
    const moduleDirs = await findModuleDirs(rootDir);
    if (moduleDirs.length === 1) {
      // Single module → use it
      moduleDir = resolve(rootDir, "modules", ...moduleDirs[0].split("/"));
      outputDir = resolve(moduleDir, "src", "widgets", entityKebab);
      relativeOutput = join("modules", ...moduleDirs[0].split("/"), "src", "widgets", entityKebab);
      log.info(`Auto-detected module: ${moduleDirs[0]}`);
    } else if (moduleDirs.length > 1) {
      log.error("Multiple modules found. Specify --module <dir>:");
      for (const dir of moduleDirs) {
        log.step(dir);
      }
      process.exit(1);
      return;
    } else {
      log.error(
        "No modules/ directory found. Create a module first:\n" +
        "  simplix add-module <name>",
      );
      process.exit(1);
      return;
    }
  }

  const spinner = ora({ text: `Searching for ${entity} schema...`, isSilent: options.quiet === true }).start();

  try {
    // A domain whose package exports the DTO meta output is read from SimpliX Meta, which states what
    // the emitted zod text cannot: which DTO a form is, what a parent contributes to it, and
    // whether the backend can order a list by a column. The dynamic import keeps the module
    // graph acyclic: the source is written against the contracts declared here.
    const { loadMetaScaffoldSource } = await import("../meta/scaffold-source.js");
    const metaSource = await loadMetaScaffoldSource(rootDir, entity);
    const { loadMetaHolders } = await import("../meta/scaffold-source.js");
    const metaHolders = metaSource ? await loadMetaHolders(rootDir, entity) : [];

    const schemaResult = await findSchemaFile(rootDir, entity);

    // Load snapshot early so it can serve as field fallback
    const extractedEntity = await findEntityFromSnapshot(rootDir, entity);

    let fields: FieldInfo[];
    let packageName: string | null = null;
    if (metaSource) {
      spinner.text = `Read ${entity} from SimpliX Meta (${metaSource.domain})`;
      fields = metaSource.fields;
      packageName = schemaResult?.packageName ?? null;

      if (fields.length === 0) {
        // A placeholder id/name pair here would be a widget set built on two invented fields,
        // reported as a successful scaffold. SimpliX Meta states what the entity holds, and for these
        // it states nothing a screen can render.
        spinner.fail(`No renderable fields for ${entity}`);
        log.error(
          `SimpliX Meta states no scalar field for "${entity}" (${metaSource.tag}): it ` +
          "carries no request body and answers with no record. Write the screen by hand, or " +
          "add the DTO the entity is read and written as.",
        );
        process.exit(1);
        return;
      }
    } else if (schemaResult) {
      spinner.text = `Found schema at ${schemaResult.path}`;
      fields = parseSchemaFields(schemaResult.content, entity);
      packageName = schemaResult.packageName;

      if (fields.length === 0 && extractedEntity?.fields.length) {
        // Fallback: use snapshot fields (covers read-only entities with no Body schema)
        fields = entityFieldsToFieldInfo(extractedEntity.fields);
      }
      if (fields.length === 0) {
        log.warn(
          "Could not parse fields from schema. Generating with placeholder fields.",
        );
        fields = PLACEHOLDER_FIELDS;
      }
    } else {
      spinner.text = "No schema found, generating with placeholder fields...";
      fields = PLACEHOLDER_FIELDS;
    }

    // Apply mandated list-column ordering + visibility (INV#18). Run before
    // any downstream consumer of `fields` (tree display fields, ctx) so the
    // category/hideInList tags are available everywhere.
    fields = orderAndCategorizeFields(fields);

    // Resolve actual hook names from crud.config.ts, and from SimpliX Meta for a meta domain that
    // has none: a hand-written entry states an intent SimpliX Meta cannot, so it wins where it exists.
    const crudConfig = await findCrudConfigForEntity(rootDir, entity);
    const roles = crudConfig ?? metaSource?.roles ?? null;

    const ops =
      !crudConfig && metaSource
        ? metaSource.operations
        : await parseEntityOperations(rootDir, entity);

    const toHookName = (opId: string) =>
      `use${opId.charAt(0).toUpperCase()}${opId.slice(1)}`;
    const hookList = roles?.list ? toHookName(roles.list) : null;
    const hookGet = roles?.get ? toHookName(roles.get) : null;
    const hookGetForEdit = roles?.getForEdit ? toHookName(roles.getForEdit) : null;
    const hookCreate = roles?.create
      ? toHookName(roles.create)
      : null;
    const hookUpdate = roles?.update
      ? toHookName(roles.update)
      : null;
    const hookDelete = roles?.delete
      ? toHookName(roles.delete)
      : null;
    const hookOrder = roles?.order
      ? toHookName(roles.order as string)
      : null;
    const hookTree = roles?.tree
      ? toHookName(roles.tree)
      : null;

    const fieldNameList = fields.map((f) => f.name).join(", ");
    const hasEnumFields = fields.some((f) => f.component === "Select");
    const hasDateFields = fields.some((f) => f.component === "Date");
    const hasBooleanFields = fields.some((f) => f.component === "Boolean");
    const hasTextareaFields = fields.some((f) => f.component === "Textarea");

    // Detect path param names for update/delete mutations. SimpliX Meta states them outright; the
    // Orval path reads them back out of the generated mutation.
    const updatePathParam = metaSource
      ? metaSource.updatePathParam ?? null
      : crudConfig?.update
        ? await findMutationPathParam(rootDir, crudConfig.update)
        : null;
    const deletePathParam = metaSource
      ? metaSource.deletePathParam ?? `${entity}Id`
      : crudConfig?.delete
        ? await findMutationPathParam(rootDir, crudConfig.delete)
        : `${entity}Id`;

    // Resolve row ID field from the entity's get operation path param.
    // e.g. "/sites/:id" → "id", "/users/:username" → "username"
    const getOp = extractedEntity?.operations.find((o) => o.role === "get");
    const pathParamMatch = getOp?.path.match(/:(\w+)(?:\/|$)/);
    const rowIdField = metaSource?.rowIdField ?? pathParamMatch?.[1] ?? "id";
    const filterFields = metaSource
      ? metaSource.filters
      : extractedEntity
        ? parseFilterParams(extractedEntity.queryParams, extractedEntity.fields)
        : [];

    // Detect orderField from the order operation's own body
    let orderField: string | null = metaSource?.orderField ?? null;
    if (!orderField && hookOrder && extractedEntity) {
      const orderOp = extractedEntity.operations.find(
        (o) => o.role === "order",
      );
      // bodySchema is { type: "array", items: { properties: { id, displayOrder } } }
      const itemProps = orderOp?.bodySchema?.items?.properties;
      if (itemProps) {
        const nonIdField = Object.keys(itemProps).find(
          (k) => k !== "id" && k !== rowIdField,
        );
        orderField = nonIdField ?? null;
      }
    }

    // Separate text filters for UnifiedTextFilter grouping (legacy Toolbar)
    const textFilters = filterFields.filter((f) => f.component === "TextFilter");
    const nonTextFilters = filterFields.filter((f) => f.component !== "TextFilter");

    // Build UnifiedTextFilter field definitions (legacy Toolbar)
    const textFilterFields: TextFilterFieldInfo[] = textFilters.map((f) => {
      const ops = (f.textOperators ?? [f.operator]).map((op) => SUFFIX_TO_ENUM_KEY[op] ?? op);
      const defaultOp = SUFFIX_TO_ENUM_KEY[f.operator] ?? f.operator;
      return { field: f.field, operators: ops, defaultOperator: defaultOp };
    });

    // Build unified FilterBar definitions
    interface FilterBarDefItem {
      type: string;
      field: string;
      operators?: string[];
      defaultOperator?: string;
      options?: string[];
      isText?: boolean;
      isNumber?: boolean;
      isFaceted?: boolean;
      isToggle?: boolean;
      isDateRange?: boolean;
      isCountry?: boolean;
      isTimezone?: boolean;
    }

    const filterBarDefs: FilterBarDefItem[] = [];
    for (const f of filterFields) {
      switch (f.component) {
        case "TextFilter": {
          const ops = (f.textOperators ?? [f.operator]).map((op) => SUFFIX_TO_ENUM_KEY[op] ?? op);
          const defaultOp = SUFFIX_TO_ENUM_KEY[f.operator] ?? f.operator;
          filterBarDefs.push({ type: "text", field: f.field, operators: ops, defaultOperator: defaultOp, isText: true });
          break;
        }
        case "NumberFilter": {
          const op = SUFFIX_TO_ENUM_KEY[f.operator] ?? "GREATER_THAN_OR_EQUAL";
          filterBarDefs.push({ type: "number", field: f.field, operators: [op], defaultOperator: op, isNumber: true });
          break;
        }
        case "FacetedFilter":
          filterBarDefs.push({ type: "faceted", field: f.field, options: f.options, isFaceted: true });
          break;
        case "ToggleFilter":
          filterBarDefs.push({ type: "toggle", field: f.field, isToggle: true });
          break;
        case "DateRangeFilter":
          filterBarDefs.push({ type: "dateRange", field: f.field, isDateRange: true });
          break;
        case "CountryFilter":
          filterBarDefs.push({ type: "country", field: f.field, isCountry: true });
          break;
        case "TimezoneFilter":
          filterBarDefs.push({ type: "timezone", field: f.field, isTimezone: true });
          break;
      }
    }

    // ── Display name field detection (for all entities) ──
    // The delete confirmation names the record with it, so a positional guess puts a foreign
    // key (identical on every row) into the dialog. A field SimpliX Meta pairs with an `…I18n`
    // sibling is the human-facing text by construction, and the meta source answers with it.
    const commonNameFields = ["name", "title", "label", "displayName"];
    const displayNameField = metaSource?.displayNameField
      ?? fields.find((f) =>
        commonNameFields.includes(f.name) && f.tsType === "string",
      )?.name
      ?? fields.find((f) =>
        f.tsType === "string" && f.name !== rowIdField,
      )?.name
      ?? null;

    // ── Tree entity detection ──
    const hasTree = ops.hasTree || !!hookTree;

    let treeParentIdField: string | null = null;
    let treeSortOrderField: string | null = null;
    let treeDisplayNameField: string | null = null;
    let treeSearchFields: string[] = [];
    let treeDisplayFields: FieldInfo[] = [];

    if (hasTree) {
      // Detect parentId field
      treeParentIdField = fields.find((f) => f.name === "parentId")?.name
        ?? fields.find((f) => f.name.toLowerCase().includes("parent") && f.name.toLowerCase().endsWith("id"))?.name
        ?? "parentId";

      // Detect sort order field
      treeSortOrderField = orderField
        ?? fields.find((f) => ["sortOrder", "displayOrder", "orderIndex"].includes(f.name))?.name
        ?? "sortOrder";

      // Display name field: prefer common name fields, then the field SimpliX Meta pairs with an
      // `…I18n` sibling, and fall back to the first string field only when neither answers.
      const commonNameFields = ["name", "title", "label", "displayName"];
      treeDisplayNameField = metaSource?.displayNameField
        ?? fields.find((f) =>
          commonNameFields.includes(f.name) && f.tsType === "string",
        )?.name
        ?? fields.find((f) =>
          f.tsType === "string" && f.name !== rowIdField && f.name !== treeParentIdField,
        )?.name
        ?? "name";

      // Search fields: string fields excluding id and parentId
      treeSearchFields = fields
        .filter((f) => f.tsType === "string" && f.name !== rowIdField && f.name !== treeParentIdField)
        .map((f) => f.name);

      // Display fields: fields for tree columns (exclude id, parentId, sortOrder
      // and any field hidden by the mandated column ordering pass so that
      // @first resolves to the first VISIBLE tree column)
      const filteredFields = fields.filter((f) =>
        f.name !== rowIdField &&
        f.name !== treeParentIdField &&
        f.name !== treeSortOrderField &&
        !f.hideInList,
      );
      const displayNameIdx = filteredFields.findIndex((f) => f.name === treeDisplayNameField);
      if (displayNameIdx > 0) {
        const [nameField] = filteredFields.splice(displayNameIdx, 1);
        filteredFields.unshift(nameField);
      }
      treeDisplayFields = filteredFields;
    }

    const hasTreeReorder = hasTree && !!hookUpdate && !!treeSortOrderField;
    const hasTreeMove = hasTree && !!hookUpdate && !!treeParentIdField;
    const updateMutationKey = updatePathParam ?? rowIdField;

    // ── List/tree row DTO resolution (INV#30) ──
    // The list row is the per-operation response DTO (e.g. CompanyListDTO),
    // NOT the entity's detail modelType. Resolve from the snapshot by role and
    // only emit a DTO import when we can both name the type AND import it.
    const listOp =
      extractedEntity?.operations?.find((o) => o.role === "list") ??
      extractedEntity?.operations?.find((o) => o.role === "search");
    const treeOp = extractedEntity?.operations?.find((o) => o.role === "tree");
    const metaListRowType = metaSource?.listRowType ?? null;
    const metaTreeRowType = metaSource?.treeRowType ?? null;
    const listRowType = metaSource
      ? (packageName && metaListRowType ? metaListRowType : null)
      : packageName && listOp?.responseEntityType ? listOp.responseEntityType : null;
    const treeRowType = metaSource
      ? (packageName && metaTreeRowType ? metaTreeRowType : null)
      : packageName && (treeOp?.responseEntityType ?? listOp?.responseEntityType)
        ? (treeOp?.responseEntityType ?? listOp?.responseEntityType)
        : null;

    const entityPlural = `${entity}s`;
    // Columns and card lines render the list row, so they are limited to what the list
    // projection returns; the full set stays available to the form and detail templates.
    const listDtoFields = metaSource
      ? metaSource.rowProperties ?? null
      : await readListDtoFieldNames(rootDir, listRowType);
    // An enum column shows a translated label only if it can name its enum, and the row type
    // is where that name is written. Fields the row type does not declare keep no name, so
    // their badge falls back to the constant rather than asking for a key nothing defines.
    const withEnumType = (f: FieldInfo) => {
      if (f.component !== "Select") return f;
      const declared = listDtoFields?.get(f.name)?.replace(/\[\]|\s|\|\s*null|\|\s*undefined/g, "");
      return declared && /^[A-Z]\w*$/.test(declared) ? { ...f, enumTypeName: declared } : f;
    };
    // A plain field is left out of the columns because its `…I18n` twin renders it. A list
    // projection that returns the resolved text and not the map leaves neither, so the row loses
    // the column it is named by, and the table then shows everything about a record except
    // which record it is.
    // A row the contract states is drawn from its own DTO, which carries what the server derives
    // for a row (a standing, a last-seen time, a referenced record's name) and no request body states.
    // A field the request body also states keeps that definition, which carries its format.
    const byName = new Map(fields.map((f) => [f.name, f]));
    const projected = metaSource?.rowFields
      ? metaSource.rowFields.map((f) => byName.get(f.name) ?? f)
      : listDtoFields ? fields.filter((f) => listDtoFields.has(f.name)) : fields;
    const projectedNames = new Set(projected.map((f) => f.name));
    const listFields = projected
      .map((f) => (f.isI18nPair && !projectedNames.has(`${f.name}I18n`) ? { ...f, isI18nPair: false } : f))
      .map(withEnumType)
      // The first column names the row and is the card's title on a phone, so the record's
      // display name leads and the order of the rest is kept.
      .sort((a, b) => Number(b.name === displayNameField) - Number(a.name === displayNameField));
    // Each entity whose records point back at this one is a sub-list in the detail, forced to the
    // open record's key. Its columns are the holder's own row fields, drawn as its list draws them.
    const holders = [];
    for (const holder of metaHolders) {
      const holderList = holder.source.roles.list;
      const holderPackage = (await findSchemaFile(rootDir, holder.entity))?.packageName ?? null;
      if (!holderList || !holderPackage) continue;
      const holderFields = withContractKinds(holder.source.rowFields ?? holder.source.fields, holder.source.rowIdField)
        .filter((f) => f.name !== holder.field);
      holders.push({
        entity: holder.entity,
        EntityPascal: holder.entity.charAt(0).toUpperCase() + holder.entity.slice(1),
        key: `${holder.entity}By${holder.field.charAt(0).toUpperCase()}${holder.field.slice(1)}`,
        hookList: toHookName(holderList),
        // The holder's own list rule, so the tab asks only a reader the server will answer.
        accessList: `${holderList}Access`,
        packageName: holderPackage,
        filterKey: `${holder.field}.${holder.operator}`,
        rowIdField: holder.source.rowIdField,
        fields: holderFields,
      });
    }
    // The generated access rule of each operation a control leads to (`createJobPositionAccess`),
    // which the domain barrel exports from SimpliX Meta. Absent where the domain is not on meta.
    const accessOf = (opId: string | undefined) => (metaSource && opId ? `${opId}Access` : null);
    const ctx = {
      accessCreate: accessOf(roles?.create),
      accessUpdate: accessOf(roles?.update),
      accessOrder: accessOf(roles?.order as string | undefined),
      accessDelete: accessOf(roles?.delete),
      holders,
      EntityPascal,
      entityKebab,
      entity,
      entityPlural,
      fields: withContractKinds(fields, rowIdField),
      // A detail draws what the get route answers with, which holds what the server derives
      // (a standing, a display name, a last-seen time) and no request body states.
      detailFields: withContractKinds(metaSource?.detailFields ?? fields, rowIdField),
      // The enum the detail header draws as the record's standing.
      statusField: withContractKinds(metaSource?.detailFields ?? fields).find(
        (f) => f.contractKind === "enum" && /(^|[a-z])(status|state|standing)$/i.test(f.name),
      )?.name,
      listFields: withContractKinds(listFields, rowIdField),
      packageName,
      listRowType,
      treeRowType,
      hookList,
      hookGet,
      hookGetForEdit,
      hookCreate,
      hookUpdate,
      hookDelete,
      hookOrder,
      hookTree,
      orderField,
      updatePathParam,
      updateMutationKey,
      deletePathParam,
      entityPath: metaSource?.entityPath ?? extractedEntity?.path ?? `/api/v1/${entity}`,
      fieldNameList,
      rowIdField,
      // The detail panel names the two stamps outright, and a record that declares neither does
      // not compile with them. Four of this application's detail DTOs are such records.
      // Read off the fields the detail is drawn from: a create DTO never carries the stamps.
      hasAuditFields:
        (metaSource?.detailFields ?? fields).some((f) => f.name === "createdAt") &&
        (metaSource?.detailFields ?? fields).some((f) => f.name === "updatedAt"),
      hasList: ops.hasList,
      hasForm: ops.hasCreate || ops.hasUpdate,
      hasDetail: ops.hasGet,
      hasCreate: ops.hasCreate,
      hasUpdate: ops.hasUpdate,
      hasDelete: ops.hasDelete,
      hasTree,
      hasTreeReorder,
      hasTreeMove,
      treeParentIdField,
      treeSortOrderField,
      displayNameField,
      treeDisplayNameField,
      treeSearchFields,
      treeDisplayFields,
      hasEnumFields,
      hasDateFields,
      hasBooleanFields,
      hasTextareaFields,
      filters: nonTextFilters,
      contractFilters: contractFiltersOf(nonTextFilters, [...fields, ...(metaSource?.detailFields ?? [])]),
      hasFilters: filterFields.length > 0,
      filterBarDefs,
      textFilterFields,
      hasTextFilters: textFilterFields.length > 0,
      firstTextField: textFilterFields[0]?.field ?? "",
      firstTextDefaultOp: textFilterFields[0]?.defaultOperator ?? "CONTAINS",
    };

    // Resolve module namespace early (needed by tree/form templates)
    const moduleNamespace = moduleDir ? await resolveModuleNamespace(moduleDir) : entity;
    const hasListDetail = (hasTree || ctx.hasList) && ctx.hasDetail;
    const moduleName = moduleDir ? basename(moduleDir) : entity;
    // Detect i18n field presence and build pairs array for template
    const i18nFieldPairs: { i18nFieldName: string; plainFieldName: string }[] = [];
    for (const f of fields) {
      if (f.baseFieldName !== null) {
        i18nFieldPairs.push({ i18nFieldName: f.name, plainFieldName: f.baseFieldName });
      }
    }
    const hasI18nFields = i18nFieldPairs.length > 0;
    const projectConfig = await loadConfig(rootDir);
    const i18nLocales = projectConfig.i18n?.locales ?? ["en", "ko", "ja"];
    // Sample rows a generated story draws, shared through the context so the story template
    // reads the same fields the screen templates do.
    const fixtureRowsJson = JSON.stringify(fixtureRows([...ctx.detailFields, ...ctx.listFields], rowIdField, entityKebab), null, 2);
    const fullCtx = { ...ctx, moduleNamespace, moduleName, entityIcon: "FileTextIcon", hasListDetail, hasI18nFields, i18nFieldPairs, i18nLocales, fixtureRowsJson };

    // The project's own templates win where it has written any, for the widgets as for the pages.
    const projectTemplates = await loadProjectTemplates(rootDir, projectConfig.templates?.from);
    const files = renderWidgetFiles(ops, hasTree, fullCtx, projectTemplates);
    // The arguments that lay these files down again, recorded after each fingerprint so the
    // generated-state report can re-render them and tell an untouched file from a stale one.
    const origin = moduleDir
      ? `scaffold ${entityKebab} --module ${modulePathOf(rootDir, moduleDir)}`
      : `scaffold ${entityKebab} --output ${relativeOutput}`;
    const widgetBlocks = renderWidgetBlocks(files, fullCtx, projectTemplates);

    spinner.text = "Generating CRUD widgets...";

    // What the screen's widget files hold once this run is done: a render this run wrote, or the
    // author's file where it kept one. The module-level support files (dependencies, the subjects
    // map, the widgets catalogue) are judged against this and never against a render that was
    // thrown away, so an edited widget that no longer needs one cannot bring it back.
    const held: string[] = [];
    for (const [fileName, content] of Object.entries(files)) {
      const filePath = join(outputDir, fileName);
      // A widget whose template stamps it is rewritten while nobody has touched it, as a page is.
      const stamped = content.includes(GENERATED_PAGE_MARKER) ? stampFingerprint(content, origin) : content;
      if (stamped !== content) {
        const outcome = await writeStampedGenerated(filePath, stamped);
        if (outcome.outcome !== "written") log.warn(`${fileName}: ${outcome.outcome}`);
        held.push(outcome.held);
        continue;
      }
      if (await pathExists(filePath)) {
        held.push(await readFile(filePath, "utf-8"));
        log.warn(`Skipping ${fileName} - file already exists`);
        continue;
      }
      await writeFileWithDir(filePath, stamped);
      held.push(stamped);
    }
    for (const [fileName, content] of Object.entries(widgetBlocks)) {
      const filePath = join(outputDir, fileName);
      if (!(await pathExists(filePath))) {
        await writeFileWithDir(filePath, content);
        held.push(content);
      } else {
        noteKeptRender(filePath, content);
        held.push(await readFile(filePath, "utf-8"));
      }
    }

    // The design reference's frame for this screen, from the story template beside the page
    // template, rendered with the same context. Tracked like a screen file: rewritten while
    // untouched, kept once customised.
    const storyTemplate = projectTemplates.get(STORY_TEMPLATE);
    const storiesDir = projectConfig.templates?.storiesDir;
    if (storyTemplate !== undefined && storiesDir) {
      const storyPath = resolve(rootDir, storiesDir, `${entityKebab}.stories.tsx`);
      const named = (pattern: string | undefined) => pattern?.replaceAll("{entity}", entityKebab).replaceAll("{Entity}", EntityPascal);
      const storyCtx = { ...fullCtx, storyId: named(projectConfig.templates?.story?.id), storyTitle: named(projectConfig.templates?.story?.title) ?? `Generated/${EntityPascal}` };
      const outcome = await writeGenerated(storyPath, renderTemplate(storyTemplate, storyCtx), origin);
      log.info(`${outcome} story ${relative(rootDir, storyPath)}`);
    }

    if (moduleDir) {
      // Auto-update widgets/index.ts with entity exports
      await updateWidgetsIndex(moduleDir, entityKebab, fullCtx, files["index.ts"]);

      // Pages generation (reuse i18nLocales loaded above)
      const locales = i18nLocales;

      const pages = await generatePages(moduleDir, entityKebab, fullCtx, projectTemplates, origin);
      if (pages.written.length > 0) {
        log.info(`Generated ${pages.written.length} page files`);
      }
      if (pages.empty.length > 0) {
        // The widgets are on disk and are what they should be; what does not exist is a screen
        // to reach them through. Saying so here is the difference between a scaffold a person
        // finishes by hand and one they discover when the dev server cannot resolve the import.
        const active = Object.entries(ops)
          .filter(([, on]) => on)
          .map(([role]) => role.replace("has", "").toLowerCase());
        spinner.fail(`No page generated for ${EntityPascal}`);
        log.error(
          `${pages.empty.map((one) => `pages/${entityKebab}/${one}`).join(", ")} rendered ` +
          `empty and was not written. A generated page is a list with a detail panel or a ` +
          `creation hub, and ${entity} offers neither: its operations are ` +
          `${active.length > 0 ? active.join(", ") : "none"}. The widgets in ` +
          `${relativeOutput} are generated - write the page against them by hand, or give the ` +
          `entity the get operation its detail panel reads.`,
        );
        process.exit(1);
        return;
      }

      // Module-level updates
      await updatePagesIndex(moduleDir, entityKebab, fullCtx);
      await updateModuleIndex(moduleDir);

      // Everything the module holds beside the screen's own files is judged against what the
      // screen's files hold after this run (see `held`), and is touched only where it is missing.
      const screenFiles = [...held, ...pages.onDisk];

      // Dependencies the screen's files import and the module does not yet resolve.
      const addedDeps = await ensureModuleDeps(moduleDir, packageName, await kitDependency(rootDir, projectConfig.templates?.from), screenFiles);
      if (addedDeps.length > 0) {
        log.info("Added dependencies:");
        for (const dep of addedDeps) {
          log.step(dep);
        }
      }

      // The subjects map is laid down only for a file that imports it: a page gated on the
      // generated access rules reads no hand-kept permission map, and a module that keeps its own
      // elsewhere is not handed an empty second one.
      if (screenFiles.some(importsSubjects)) {
        await ensureSubjectsFile(moduleDir);
      }

      // The widgets catalogue is registered, and its files laid down, only where a file reads it:
      // a registration naming files nobody wrote fails the module's translation load, and one
      // nobody reads is an entry the author has to take out again after every run.
      if (screenFiles.some((content) => readsWidgetsNamespace(content, moduleNamespace))) {
        await ensureWidgetsLocaleFiles(moduleDir, locales);
        await updateLocalesIndex(moduleDir, locales);
      }
      // The entity's default keys go into the catalogue only for a file that reads them. A file that
      // reads the catalogue for keys of its own (`page.note`) leaves the entity's block out, and
      // putting it in is a change to a file the author keeps.
      if (screenFiles.some((content) => readsEntityKeys(content, entity))) {
        await updateLocaleJsons(moduleDir, entity, EntityPascal, locales, ops, hasTree);
      }
      await ensureTsupPagesEntry(moduleDir);
      await ensurePackageJsonPagesExport(moduleDir);
    }

    spinner.succeed(`CRUD widgets + pages generated for ${EntityPascal}`);

    const activeOps = Object.entries(ops)
      .filter(([, v]) => v)
      .map(([k]) => k.replace("has", "").toLowerCase());
    log.info(`Operations: ${activeOps.join(", ")}`);

    if (metaSource && metaSource.unreachableRoles.length > 0) {
      // No generated screen offers a multi-select, so nothing sends these requests. They are
      // named here rather than left to be discovered as endpoints nobody calls.
      log.warn(
        `${entity}: the backend offers ${metaSource.unreachableRoles.join(", ")}, which no ` +
        "generated screen reaches - a multi-select toolbar is written by hand.",
      );
    }

    const skipped: string[] = [];
    if (!ops.hasList) skipped.push("list (no list operation)");
    if (!ops.hasCreate && !ops.hasUpdate) skipped.push("form (no create/update)");
    if (!ops.hasGet) skipped.push("detail (no get operation)");
    if (skipped.length > 0) {
      log.info(`Skipped: ${skipped.join(", ")}`);
    }

    log.info("");
    log.info("Generated files (FSD widgets/ layer):");
    for (const fileName of Object.keys(files)) {
      log.step(`${relativeOutput}/${fileName}`);
    }
    if (packageName) {
      log.info("");
      log.info(`Domain package: ${packageName}`);
    }
    log.info(`Fields detected: ${fields.map((f) => f.name).join(", ")}`);
    log.info("");
    log.info("FSD Architecture:");
    log.step("packages/            → domain logic (schemas, hooks) - no UI");
    log.step("modules/src/widgets/ → CRUD widgets");
    log.step("modules/src/pages/   → page components (auto-generated)");
    log.step("modules/src/shared/  → shared UI, lib, config");
    log.info("");
    log.info("Next: wire up routes in your app to use the generated pages");
  } catch (err) {
    spinner.fail(`Failed to scaffold CRUD for ${entity}`);
    log.error(String(err));
    process.exit(1);
  }
}
