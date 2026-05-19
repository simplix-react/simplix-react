import type { LinkTarget, MenuNode, MenuPermissionFilter, NavigationItem, NavigationGroup, MenuGroupConfig } from "./menu-types";

function resolveLabel(node: MenuNode, locale: string): string {
  return node.menuNameI18n?.[locale] ?? node.menuName;
}

function isPermitted(permissionCode: string | undefined, filter: MenuPermissionFilter | undefined): boolean {
  if (!filter || !permissionCode) return true;
  return filter(permissionCode);
}

// Backend `LabeledEnum` types serialize as `{ type, value, label }`. Accept both
// the raw enum string and the wrapped object, and return the underlying value.
function unwrapLinkTarget(v: MenuNode["linkTarget"]): LinkTarget | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "value" in v && typeof v.value === "string") {
    return v.value;
  }
  return undefined;
}

export function transformMenuNodes(
  nodes: MenuNode[],
  locale: string,
  permissionFilter?: MenuPermissionFilter,
): NavigationItem[] {
  return nodes
    .filter((node) => node.enabled && isPermitted(node.permissionCode, permissionFilter))
    .map((node) => {
      const children = transformMenuNodes(node.children, locale, permissionFilter);
      return {
        key: node.menuCode,
        label: resolveLabel(node, locale),
        href: node.url,
        icon: node.icon,
        linkTarget: unwrapLinkTarget(node.linkTarget),
        permissionCode: node.permissionCode,
        hasChildren: children.length > 0,
        children: children.length > 0 ? children : undefined,
      };
    });
}

export function transformToGroup(
  config: MenuGroupConfig,
  nodes: MenuNode[],
  locale: string,
  permissionFilter?: MenuPermissionFilter,
): NavigationGroup {
  return {
    groupCode: config.menuCode,
    basePath: config.basePath,
    items: transformMenuNodes(nodes, locale, permissionFilter),
  };
}
