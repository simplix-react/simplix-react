import type { ExtractedEntity, DomainGroup } from "./types.js";

/**
 * Create a tag matcher from a pattern string.
 * Supports exact match or /regex/ syntax.
 */
export function createTagMatcher(pattern: string): (tag: string) => boolean {
  const regexMatch = pattern.match(/^\/(.+)\/$/);
  if (regexMatch) {
    const regex = new RegExp(regexMatch[1]);
    return (tag) => regex.test(tag);
  }
  return (tag) => tag === pattern;
}

/**
 * Check if an entity matches a domain by its tags.
 * Returns true if any of the entity's tags match any of the patterns.
 */
export function entityMatchesDomain(
  entity: ExtractedEntity,
  patterns: string[],
): boolean {
  const matchers = patterns.map(createTagMatcher);
  return entity.tags.some((tag) => matchers.some((matcher) => matcher(tag)));
}

/**
 * Group entities by domain using tag-based matching (first-match-wins).
 * Entities that don't match any domain go to the fallback domain.
 */
export function groupEntitiesByDomain(
  entities: ExtractedEntity[],
  domainConfig: Record<string, string[]>,
  fallbackDomain: string,
): DomainGroup[] {
  const domainEntries = Object.entries(domainConfig);
  const groups = new Map<string, ExtractedEntity[]>();
  const unmatched: ExtractedEntity[] = [];

  for (const entity of entities) {
    let matched = false;

    for (const [domainName, patterns] of domainEntries) {
      if (entityMatchesDomain(entity, patterns)) {
        const list = groups.get(domainName) ?? [];
        list.push(entity);
        groups.set(domainName, list);
        matched = true;
        break; // first-match-wins
      }
    }

    if (!matched) {
      unmatched.push(entity);
    }
  }

  const result: DomainGroup[] = [];

  for (const [domainName, domainEntities] of groups) {
    result.push({ domainName, entities: domainEntities });
  }

  if (unmatched.length > 0) {
    result.push({ domainName: fallbackDomain, entities: unmatched });
  }

  return result;
}
