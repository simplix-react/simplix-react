interface MenuNodeLike<T> {
  key: string;
  href?: string;
  children?: T[];
}

export function isOnPath<T extends MenuNodeLike<T>>(
  pathname: string,
  item: T,
): boolean {
  if (item.href && pathname.startsWith(item.href)) return true;
  if (item.children && item.children.length > 0) {
    return item.children.some((c) => isOnPath(pathname, c));
  }
  return false;
}

export function collectExpandKeys<T extends MenuNodeLike<T>>(
  pathname: string,
  items: T[] | undefined,
): string[] {
  if (!items || items.length === 0) return [];
  const result: string[] = [];
  for (const item of items) {
    const hasChildren = !!(item.children && item.children.length > 0);
    if (!hasChildren) continue;
    if (item.children!.some((c) => isOnPath(pathname, c))) {
      result.push(item.key);
    }
    result.push(...collectExpandKeys(pathname, item.children));
  }
  return result;
}
