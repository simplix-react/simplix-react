import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { createTagMatcher } from "../openapi/pipeline/domain-splitter.js";
import type {
  DtoMeta,
  EnumMeta,
  FieldMeta,
  OperationMeta,
  TypeMeta,
  TypeRef,
} from "./types.js";

/**
 * Java packages whose types belong to the platform rather than to the application. A closure
 * that reaches one of these has followed a controller into the framework, and the generator
 * would try to emit a TypeScript declaration for `SseEmitter` or `ApplicationContext`.
 */
export const FRAMEWORK_PACKAGE_PREFIXES = [
  "java.",
  "javax.",
  "jakarta.",
  "org.springframework.",
];

export interface ResolveMetaOptions {
  /** Domain name → tag patterns, exactly the shape of `simplix.config.ts`'s `domains` field. */
  domains: Record<string, string[]>;
  /** Java container name → its TypeScript form, contributed by the spec profile. */
  containerTypes: Record<string, ContainerMapping>;
}

/**
 * One tag's worth of operations. A tag is the unit a generator turns into a file, so it is also
 * the unit that owns a declaration.
 */
export interface ResolvedEntity {
  tag: string;
  /** The domain patterns that matched this tag. */
  patterns: string[];
  operations: OperationMeta[];
}

/** One DTO type inside a domain's closure, with its inheritance already followed. */
export interface ResolvedType {
  name: string;
  /** SimpliX Meta declaration. `meta.fields` is the own-field list; `meta.typeParams` its generics. */
  meta: TypeMeta;
  /** The `extends` chain, nearest parent first. */
  ancestors: string[];
  /**
   * Inherited fields followed by own ones. A name the child redeclares keeps the ancestor's
   * position and carries the child's declaration.
   */
  allFields: FieldMeta[];
  /**
   * Tag of the entity whose schema module emits this declaration: the first entity in
   * `reachedBy`. It answers where the declaration is written once, never which entities it
   * belongs to.
   */
  owner: string;
  /**
   * Tag of every entity whose operations reach this declaration, in the domain's entity order.
   * A DTO two entities return belongs to both: each entity's catalog labels its fields, so a
   * per-entity question reads this list and never `owner`.
   */
  reachedBy: string[];
}

/** One enum inside a domain's closure. */
export interface ResolvedEnum {
  name: string;
  meta: EnumMeta;
  /** Tag of every entity whose operations reach this enum, in the domain's entity order. */
  reachedBy: string[];
}

/** Everything one domain package is generated from. */
export interface ResolvedDomain {
  name: string;
  /** Entities sorted by tag, which is also the order each declaration's `reachedBy` lists them in. */
  entities: ResolvedEntity[];
  /** Every matched operation of the domain, in SimpliX Meta order. */
  operations: OperationMeta[];
  /** The transitive type closure, keyed and ordered by name. */
  types: Map<string, ResolvedType>;
  /** The transitive enum closure, keyed and ordered by name. */
  enums: Map<string, ResolvedEnum>;
  /** Containers the closure reaches, and what each becomes in TypeScript. */
  containers: Map<string, ContainerMapping>;
}

/** Operations left over because their tag matched no domain, grouped by tag. */
export interface UnmatchedTag {
  tag: string;
  operations: OperationMeta[];
  /** The domain whose patterns share the longest prefix with the tag, or null where none shares one. */
  closest: ClosestDomain | null;
}

/** The domain a tag no domain claims is nearest to, by the dot-separated prefix its patterns share. */
export interface ClosestDomain {
  domain: string;
  /** The leading segments shared with the domain's patterns, e.g. `user.admin`. */
  prefix: string;
  /** How many of the domain's literal patterns share that prefix with the tag. */
  patterns: number;
}

/** A configured pattern that matches no tag in the document — an entity that answers nothing. */
export interface DeadPattern {
  domain: string;
  pattern: string;
}

/**
 * A tag more than one domain's patterns claim. The first domain in configuration order takes it
 * and the others are left without it, which is the same silent loss a dead pattern causes, seen
 * from the other side — the second domain generates an entity that answers nothing.
 */
export interface ContestedTag {
  tag: string;
  /** Every domain whose patterns match, in configuration order. The first one owns the tag. */
  domains: string[];
}

/** A platform type that entered a domain closure. */
export interface FrameworkTypeUse {
  name: string;
  javaClass: string;
  domain: string;
}

/** A declaration reached by more than one domain, so emitted into each of their packages. */
export interface SharedDeclaration {
  name: string;
  kind: "type" | "enum";
  domains: string[];
}

export interface ResolvedMeta {
  /** Domains in configuration order, including any left with no entity. */
  domains: Map<string, ResolvedDomain>;
  unmatched: UnmatchedTag[];
  deadPatterns: DeadPattern[];
  contestedTags: ContestedTag[];
  frameworkTypes: FrameworkTypeUse[];
  sharedDeclarations: SharedDeclaration[];
  /** Type names a closure referenced that SimpliX Meta does not declare. */
  missingTypes: string[];
  /** Enum names a closure referenced that SimpliX Meta does not declare. */
  missingEnums: string[];
  /** Container names a closure reached that `containerTypes` does not map. */
  unmappedContainers: string[];
}

/**
 * Slice SimpliX Meta into one closure per domain and index it once, so no generator walks the document
 * again.
 *
 * A tag belongs to the first domain whose patterns match it, mirroring the OpenAPI pipeline's
 * first-match-wins grouping. Matching is exact by default: a plain pattern matches a tag
 * literally and only a `/…/` pattern is a regular expression, so `site.*` looks for a tag named
 * `site.*`.
 *
 * Nothing is dropped quietly. An operation no domain claims, a tag two domains claim, a pattern
 * no tag answers, a reference SimpliX Meta does not declare and a container the profile does not map
 * all come back on {@link ResolvedMeta} for the caller to act on.
 */
export function resolveMeta(meta: DtoMeta, options: ResolveMetaOptions): ResolvedMeta {
  const index = new InheritanceIndex(meta.types);
  const operationsByTag = groupOperationsByTag(meta.operations);
  const domainEntries = Object.entries(options.domains);

  const missingTypes = new Set<string>();
  const missingEnums = new Set<string>();
  const unmappedContainers = new Set<string>();

  const tagOwner = assignTagsToDomains(operationsByTag, domainEntries);
  const domains = new Map<string, ResolvedDomain>();

  for (const [domainName, patterns] of domainEntries) {
    const matchers = patterns.map((pattern) => ({ pattern, test: createTagMatcher(pattern) }));
    const tags = [...operationsByTag.keys()]
      .filter((tag) => tagOwner.get(tag) === domainName)
      .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));

    const entities: ResolvedEntity[] = tags.map((tag) => ({
      tag,
      patterns: matchers.filter((matcher) => matcher.test(tag)).map((matcher) => matcher.pattern),
      operations: operationsByTag.get(tag) ?? [],
    }));

    const walker = new ClosureWalker(meta, index, options.containerTypes, {
      missingTypes,
      missingEnums,
      unmappedContainers,
    });
    for (const entity of entities) {
      walker.walkEntity(entity);
    }

    domains.set(domainName, {
      name: domainName,
      entities,
      operations: meta.operations.filter((operation) => tagOwner.get(operation.tag) === domainName),
      types: walker.sortedTypes(),
      enums: walker.sortedEnums(),
      containers: walker.containers,
    });
  }

  return {
    domains,
    unmatched: collectUnmatched(operationsByTag, tagOwner, domainEntries),
    deadPatterns: collectDeadPatterns(domainEntries, [...operationsByTag.keys()]),
    contestedTags: collectContestedTags(domainEntries, [...operationsByTag.keys()]),
    frameworkTypes: collectFrameworkTypes(domains),
    sharedDeclarations: collectSharedDeclarations(domains),
    missingTypes: [...missingTypes].sort(),
    missingEnums: [...missingEnums].sort(),
    unmappedContainers: [...unmappedContainers].sort(),
  };
}

function groupOperationsByTag(operations: OperationMeta[]): Map<string, OperationMeta[]> {
  const byTag = new Map<string, OperationMeta[]>();
  for (const operation of operations) {
    const list = byTag.get(operation.tag);
    if (list) {
      list.push(operation);
    } else {
      byTag.set(operation.tag, [operation]);
    }
  }
  return byTag;
}

function assignTagsToDomains(
  operationsByTag: Map<string, OperationMeta[]>,
  domainEntries: [string, string[]][],
): Map<string, string> {
  const owner = new Map<string, string>();
  for (const tag of operationsByTag.keys()) {
    for (const [domainName, patterns] of domainEntries) {
      if (patterns.some((pattern) => createTagMatcher(pattern)(tag))) {
        owner.set(tag, domainName);
        break;
      }
    }
  }
  return owner;
}

function collectUnmatched(
  operationsByTag: Map<string, OperationMeta[]>,
  tagOwner: Map<string, string>,
  domainEntries: readonly [string, string[]][],
): UnmatchedTag[] {
  return [...operationsByTag.entries()]
    .filter(([tag]) => !tagOwner.has(tag))
    .map(([tag, operations]) => ({ tag, operations, closest: closestDomain(tag, domainEntries) }));
}

/** The fewest leading segments a tag must share with a domain's pattern for that domain to be named as its closest. */
export const CLOSEST_DOMAIN_MIN_SEGMENTS = 2;

/**
 * A matcher for `meta.ignoreTags`: each pattern is a glob over the dot-separated tag, where `*`
 * matches any run within one segment and `**` any run across segments. The whole tag must match.
 */
export function ignoredTagMatcher(patterns: readonly string[]): (tag: string) => boolean {
  const regexes = patterns.map((pattern) => {
    const body = pattern
      .split("**")
      .map((part) => part.split("*").map((text) => text.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^.]*"))
      .join(".*");
    return new RegExp(`^${body}$`);
  });
  return (tag) => regexes.some((regex) => regex.test(tag));
}

/** How many leading dot-separated segments two names have in common. */
function sharedSegments(left: readonly string[], right: readonly string[]): number {
  let shared = 0;
  while (shared < left.length && shared < right.length && left[shared] === right[shared]) shared += 1;
  return shared;
}

/**
 * The domain whose patterns share the longest leading run of dot-separated segments with `tag`.
 *
 * Only literal patterns are compared: a `/…/` pattern is a regular expression with no prefix to
 * read, and one that matched the tag would have claimed it. Where two domains share a prefix of
 * the same length, the one with more patterns under it is nearer, and then the one configured
 * first. A tag that shares fewer than {@link CLOSEST_DOMAIN_MIN_SEGMENTS} leading segments with
 * every pattern has no closest domain: one shared segment (`dev`, `public`) is a namespace many
 * unrelated tags live under, not evidence of where this one belongs.
 */
export function closestDomain(tag: string, domains: readonly [string, string[]][]): ClosestDomain | null {
  const segments = tag.split(".");
  let best: { domain: string; depth: number; patterns: number } | null = null;
  for (const [domain, patterns] of domains) {
    let depth = 0;
    let count = 0;
    for (const pattern of patterns) {
      if (/^\/.+\/$/.test(pattern)) continue;
      const shared = sharedSegments(segments, pattern.split("."));
      if (shared > depth) {
        depth = shared;
        count = 1;
      } else if (shared === depth && shared > 0) {
        count += 1;
      }
    }
    if (depth < CLOSEST_DOMAIN_MIN_SEGMENTS) continue;
    if (!best || depth > best.depth || (depth === best.depth && count > best.patterns)) {
      best = { domain, depth, patterns: count };
    }
  }
  return best ? { domain: best.domain, prefix: segments.slice(0, best.depth).join("."), patterns: best.patterns } : null;
}

/** The warning `simplix meta` prints for a tag no domain claims: the tag, what it costs, and where it likely belongs. */
export function unclaimedTagMessage(one: UnmatchedTag): string {
  const head = `Tag '${one.tag}' is claimed by no domain in simplix.config.ts, so its ${one.operations.length} operation(s) generate nothing.`;
  if (!one.closest) return `${head} No domain pattern shares a prefix with it.`;
  const { domain, prefix, patterns } = one.closest;
  return `${head} Closest domain: "${domain}" (shares '${prefix}' with ${patterns} of its patterns); add '${one.tag}' to that domain.`;
}

function collectDeadPatterns(
  domainEntries: [string, string[]][],
  tags: string[],
): DeadPattern[] {
  const dead: DeadPattern[] = [];
  for (const [domain, patterns] of domainEntries) {
    for (const pattern of patterns) {
      const matches = createTagMatcher(pattern);
      if (!tags.some((tag) => matches(tag))) {
        dead.push({ domain, pattern });
      }
    }
  }
  return dead;
}

function collectContestedTags(
  domainEntries: [string, string[]][],
  tags: string[],
): ContestedTag[] {
  const contested: ContestedTag[] = [];
  for (const tag of tags) {
    const claiming = domainEntries
      .filter(([, patterns]) => patterns.some((pattern) => createTagMatcher(pattern)(tag)))
      .map(([domain]) => domain);
    if (claiming.length > 1) {
      contested.push({ tag, domains: claiming });
    }
  }
  return contested;
}

function collectFrameworkTypes(domains: Map<string, ResolvedDomain>): FrameworkTypeUse[] {
  const found: FrameworkTypeUse[] = [];
  for (const domain of domains.values()) {
    for (const type of domain.types.values()) {
      if (FRAMEWORK_PACKAGE_PREFIXES.some((prefix) => type.meta.javaClass.startsWith(prefix))) {
        found.push({ name: type.name, javaClass: type.meta.javaClass, domain: domain.name });
      }
    }
  }
  return found;
}

function collectSharedDeclarations(domains: Map<string, ResolvedDomain>): SharedDeclaration[] {
  const byName = new Map<string, { kind: "type" | "enum"; domains: string[] }>();

  const record = (name: string, kind: "type" | "enum", domain: string): void => {
    const entry = byName.get(name);
    if (entry) {
      entry.domains.push(domain);
    } else {
      byName.set(name, { kind, domains: [domain] });
    }
  };

  for (const domain of domains.values()) {
    for (const name of domain.types.keys()) record(name, "type", domain.name);
    for (const name of domain.enums.keys()) record(name, "enum", domain.name);
  }

  return [...byName.entries()]
    .filter(([, entry]) => entry.domains.length > 1)
    .map(([name, entry]) => ({ name, kind: entry.kind, domains: entry.domains }))
    .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
}

/**
 * `extends` chains, resolved once for the whole document rather than per domain — the same type
 * lands in several closures and its ancestry does not change between them.
 */
class InheritanceIndex {
  private readonly ancestorsOf = new Map<string, string[]>();
  private readonly allFieldsOf = new Map<string, FieldMeta[]>();
  private readonly inProgress: string[] = [];

  constructor(private readonly types: Record<string, TypeMeta>) {}

  ancestors(name: string): string[] {
    const cached = this.ancestorsOf.get(name);
    if (cached) return cached;
    this.enter(name);
    const parent = this.types[name]?.extends;
    const chain = parent ? [parent, ...this.ancestors(parent)] : [];
    this.leave();
    this.ancestorsOf.set(name, chain);
    return chain;
  }

  /**
   * Inherited fields first, own fields after. A name the child redeclares keeps the ancestor's
   * position and carries the child's declaration, which is what TypeScript's `interface X
   * extends Y` produces.
   */
  allFields(name: string): FieldMeta[] {
    const cached = this.allFieldsOf.get(name);
    if (cached) return cached;
    const type = this.types[name];
    if (!type) return [];

    this.enter(name);
    const merged = type.extends ? [...this.allFields(type.extends)] : [];
    this.leave();

    const positions = new Map(merged.map((field, at) => [field.name, at]));
    for (const field of type.fields) {
      const at = positions.get(field.name);
      if (at === undefined) {
        positions.set(field.name, merged.length);
        merged.push(field);
      } else {
        merged[at] = field;
      }
    }

    this.allFieldsOf.set(name, merged);
    return merged;
  }

  private enter(name: string): void {
    if (this.inProgress.includes(name)) {
      throw new Error(
        `Circular extends chain in SimpliX Meta: ${[...this.inProgress, name].join(" → ")}`,
      );
    }
    this.inProgress.push(name);
  }

  private leave(): void {
    this.inProgress.pop();
  }
}

interface WalkReports {
  missingTypes: Set<string>;
  missingEnums: Set<string>;
  unmappedContainers: Set<string>;
}

/** Accumulates one domain's transitive closure across the entities that reach into it. */
class ClosureWalker {
  private readonly types = new Map<string, ResolvedType>();
  private readonly enums = new Map<string, ResolvedEnum>();
  readonly containers = new Map<string, ContainerMapping>();
  private entityTag = "";
  /**
   * The declarations the current entity has visited. The closure registers a type once for the
   * domain, but every entity walks it again through to its leaves, so a DTO another entity reached
   * first still records this entity, and so does everything nested in it.
   */
  private visitedByEntity = new Set<string>();

  constructor(
    private readonly meta: DtoMeta,
    private readonly index: InheritanceIndex,
    private readonly containerTypes: Record<string, ContainerMapping>,
    private readonly reports: WalkReports,
  ) {}

  walkEntity(entity: ResolvedEntity): void {
    this.entityTag = entity.tag;
    this.visitedByEntity = new Set();
    for (const operation of entity.operations) {
      if (operation.response) this.walkRef(operation.response);
      if (operation.request.body) this.walkRef(operation.request.body);
      if (operation.request.searchDto) this.visitType(operation.request.searchDto);
      for (const param of operation.request.query) this.walkRef(param.type);
      for (const param of operation.request.path) this.walkRef(param.type);
    }
  }

  sortedTypes(): Map<string, ResolvedType> {
    return sortByKey(this.types);
  }

  sortedEnums(): Map<string, ResolvedEnum> {
    return sortByKey(this.enums);
  }

  private walkRef(ref: TypeRef): void {
    switch (ref.kind) {
      case "ref":
        this.visitType(ref.name);
        for (const arg of ref.args ?? []) this.walkRef(arg);
        break;
      case "enum":
        this.visitEnum(ref.name);
        break;
      case "container":
        this.visitContainer(ref.name);
        for (const arg of ref.args) this.walkRef(arg);
        break;
      case "pick":
        // The subset names fields of a declared type, so that type still has to be reachable.
        this.visitType(ref.of);
        break;
      default:
        // A primitive carries nothing to reach, and `param` names a type parameter of the
        // enclosing generic rather than a declaration.
        break;
    }
  }

  private visitType(name: string): void {
    // Marked before recursing so a type reachable from its own fields terminates.
    const key = `type:${name}`;
    if (this.visitedByEntity.has(key)) return;
    this.visitedByEntity.add(key);

    const known = this.types.get(name);
    const type = known?.meta ?? this.meta.types[name];
    if (!type) {
      this.reports.missingTypes.add(name);
      return;
    }
    if (known) {
      known.reachedBy.push(this.entityTag);
    } else {
      this.types.set(name, {
        name,
        meta: type,
        ancestors: this.index.ancestors(name),
        allFields: this.index.allFields(name),
        owner: this.entityTag,
        reachedBy: [this.entityTag],
      });
    }

    if (type.extends) this.visitType(type.extends);
    for (const field of type.fields) this.walkRef(field.type);
  }

  private visitEnum(name: string): void {
    const key = `enum:${name}`;
    if (this.visitedByEntity.has(key)) return;
    this.visitedByEntity.add(key);

    const known = this.enums.get(name);
    if (known) {
      known.reachedBy.push(this.entityTag);
      return;
    }
    const enumMeta = this.meta.enums[name];
    if (!enumMeta) {
      this.reports.missingEnums.add(name);
      return;
    }
    this.enums.set(name, { name, meta: enumMeta, reachedBy: [this.entityTag] });
  }

  private visitContainer(name: string): void {
    if (this.containers.has(name)) return;
    const mapping = this.containerTypes[name];
    if (!mapping) {
      this.reports.unmappedContainers.add(name);
      return;
    }
    this.containers.set(name, mapping);
  }
}

function sortByKey<T>(entries: Map<string, T>): Map<string, T> {
  return new Map(
    [...entries.entries()].sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)),
  );
}
