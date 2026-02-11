// OpenAPI parsing result types

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  paths: Record<string, PathItem>;
  components?: { schemas?: Record<string, SchemaObject> };
}

export interface PathItem {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
  parameters?: ParameterObject[];
}

export interface OperationObject {
  operationId?: string;
  summary?: string;
  tags?: string[];
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
}

export interface ParameterObject {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
  schema?: SchemaObject;
  description?: string;
}

export interface RequestBodyObject {
  content?: Record<string, MediaTypeObject>;
  required?: boolean;
}

export interface MediaTypeObject {
  schema?: SchemaObject;
}

export interface ResponseObject {
  description?: string;
  content?: Record<string, MediaTypeObject>;
}

export interface SchemaObject {
  $ref?: string;
  type?: string;
  format?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  enum?: string[];
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  nullable?: boolean;
  default?: unknown;
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  additionalProperties?: boolean | SchemaObject;
}

// --- Extracted entity types ---

export interface EntityField {
  name: string;
  snakeName: string;
  type: string;
  format?: string;
  zodType: string;
  sqlType: string;
  required: boolean;
  nullable: boolean;
  default?: unknown;
  enum?: string[];
}

export interface QueryParam {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface CRUDOperations {
  list: boolean;
  get: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface ExtractedEntity {
  name: string;
  pascalName: string;
  pluralName: string;
  path: string;
  parent?: { param: string; path: string };
  fields: EntityField[];
  createFields: EntityField[];
  updateFields: EntityField[];
  queryParams: QueryParam[];
  operations: CRUDOperations;
  tags: string[];
}

export interface DomainGroup {
  domainName: string;
  entities: ExtractedEntity[];
}

/** Snapshot stored as .openapi-snapshot.json for diff comparison */
export interface OpenAPISnapshot {
  generatedAt: string;
  specSource: string;
  entities: ExtractedEntity[];
}

/** Diff result for update flow */
export interface DiffResult {
  added: ExtractedEntity[];
  removed: ExtractedEntity[];
  modified: EntityModification[];
  hasChanges: boolean;
}

export interface EntityModification {
  entityName: string;
  addedFields: EntityField[];
  removedFields: string[];
  changedFields: FieldChange[];
}

export interface FieldChange {
  name: string;
  field: "type" | "required" | "nullable" | "zodType";
  from: string;
  to: string;
}
