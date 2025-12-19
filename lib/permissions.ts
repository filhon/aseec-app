/**
 * ASEEC App - Permissions System
 * 
 * Defines permissions for each user role:
 * - admin: Full access to everything
 * - editor: Can create/edit projects and posts, no settings access
 * - director: View-only access, cannot create/edit
 * - user: Limited access, no financial data or settings
 */

import type { UserRole } from "@/lib/types/database.types";

// =============================================================================
// PERMISSION DEFINITIONS
// =============================================================================

export type Permission =
  | "view:map"
  | "view:projects"
  | "view:dashboard"
  | "view:financeiro"
  | "view:financials"
  | "view:settings"
  | "view:aseecia"
  | "view:feed"
  | "view:favorites"
  | "create:projects"
  | "edit:projects"
  | "create:posts"
  | "manage:users";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view:map",
    "view:projects",
    "view:dashboard",
    "view:financeiro",
    "view:financials",
    "view:settings",
    "view:aseecia",
    "view:feed",
    "view:favorites",
    "create:projects",
    "edit:projects",
    "create:posts",
    "manage:users",
  ],
  editor: [
    "view:map",
    "view:projects",
    "view:dashboard",
    "view:financeiro",
    "view:financials",
    "view:aseecia",
    "view:feed",
    "view:favorites",
    "create:projects",
    "edit:projects",
    "create:posts",
  ],
  director: [
    "view:map",
    "view:projects",
    "view:dashboard",
    "view:financeiro",
    "view:financials",
    "view:aseecia",
    "view:feed",
    "view:favorites",
  ],
  user: [
    "view:map",
    "view:projects",
    "view:aseecia",
    "view:feed",
    "view:favorites",
  ],
};

// =============================================================================
// ROUTE ACCESS CONTROL
// =============================================================================

interface RouteConfig {
  path: string;
  requiredPermission?: Permission;
  blockedRoles?: UserRole[];
}

export const PROTECTED_ROUTES: RouteConfig[] = [
  { path: "/configuracoes", requiredPermission: "view:settings" },
  { path: "/financeiro", requiredPermission: "view:financeiro" },
  { path: "/dashboard", requiredPermission: "view:dashboard" },
  { path: "/projetos/novo", requiredPermission: "create:projects" },
  { path: "/aseec-ia", requiredPermission: "view:aseecia" },
];

// =============================================================================
// PERMISSION HELPERS
// =============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole | undefined, pathname: string): boolean {
  if (!role) return false;
  
  // Find matching route config
  const routeConfig = PROTECTED_ROUTES.find(route => 
    pathname === route.path || pathname.startsWith(route.path + "/")
  );
  
  // If no config found, route is public
  if (!routeConfig) return true;
  
  // Check if role is blocked
  if (routeConfig.blockedRoles?.includes(role)) return false;
  
  // Check if role has required permission
  if (routeConfig.requiredPermission) {
    return hasPermission(role, routeConfig.requiredPermission);
  }
  
  return true;
}

/**
 * Get navigation items filtered by user role
 */
export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: Permission;
}

export function filterNavItems(items: NavItem[], role: UserRole | undefined): NavItem[] {
  if (!role) return [];
  
  return items.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(role, item.requiredPermission);
  });
}

/**
 * Get role display name in Portuguese
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: "Administrador",
    editor: "Editor",
    director: "Diretor",
    user: "Usuário",
  };
  return names[role] || role;
}

/**
 * Get all available roles for selection
 */
export function getAvailableRoles(): { value: UserRole; label: string }[] {
  return [
    { value: "admin", label: "Administrador" },
    { value: "editor", label: "Editor" },
    { value: "director", label: "Diretor" },
    { value: "user", label: "Usuário" },
  ];
}
