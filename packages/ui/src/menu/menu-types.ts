import type { ReactNode } from "react";

// Link target — matches backend LinkTarget enum
export type LinkTarget = "SELF" | "BLANK" | "WINDOW";

// Backend LabeledEnum wrapper (`{ type, value, label }`) used when an enum
// implements `LabeledEnum` on the server. Raw enum string is also accepted.
interface LabeledEnumWrapper<T extends string> {
  type?: string;
  value: T;
  label?: string;
}

// Raw API response node — matches backend PublicMenuTreeDTO
export interface MenuNode {
  menuId: string;
  menuCode: string;
  menuName: string;
  menuNameI18n: Record<string, string>;
  icon?: string;
  url: string;
  linkTarget?: LinkTarget | LabeledEnumWrapper<LinkTarget>;
  depth: number;
  sortOrder: number;
  permissionCode?: string;
  enabled: boolean;
  children: MenuNode[];
  targetType?: string;
  targetId?: string;
}

// Permission filter callback
export type MenuPermissionFilter = (permissionCode: string) => boolean;

// Transformed navigation item (i18n-resolved, permission-filtered)
export interface NavigationItem {
  key: string;         // menuCode
  label: string;       // i18n-resolved name
  href: string;        // url
  icon?: string;
  linkTarget?: LinkTarget;
  permissionCode?: string;
  hasChildren: boolean;
  children?: NavigationItem[];
  targetType?: string;
  targetId?: string;
}

// Depth-0 menu group container
export interface NavigationGroup {
  groupCode: string;   // "ADMIN" | "FRONT" | ...
  basePath: string;    // "/" | "/admin" | ...
  items: NavigationItem[];
}

// Fixed (code-defined) menu item
export interface FixedMenuItem {
  key: string;
  labelKey: string;    // Translation key, resolved by app via t(item.labelKey)
  href?: string;
  icon?: string;
  linkTarget?: LinkTarget;
  action?: () => void;
  children?: FixedMenuItem[];
}

// Fixed menu group (e.g. PROFILE_MENU)
export interface FixedMenuGroup {
  groupCode: string;
  items: FixedMenuItem[];
}

// Menu group config — each entry specifies a menuCode to fetch + its basePath
export interface MenuGroupConfig {
  menuCode: string;
  basePath: string;
}

// MenuProvider props
export interface MenuProviderProps {
  fetchMenuTree: (menuCode: string, signal?: AbortSignal) => Promise<MenuNode[]>;
  menuGroups: MenuGroupConfig[];
  fixedGroups?: FixedMenuGroup[];
  permissionFilter?: MenuPermissionFilter;
  locale?: string;
  children: ReactNode;
}

// Context value shape (returned by useMenu)
export interface MenuContextValue {
  groups: NavigationGroup[];
  getFixedGroup: (code: string) => FixedMenuItem[];
  isLoading: boolean;
  error: Error | null;
}
