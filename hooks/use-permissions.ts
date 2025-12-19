"use client";

/**
 * usePermissions Hook
 * 
 * Provides permission checking utilities based on the current user's role.
 * Uses the AuthProvider context to get the user's profile.
 */

import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { 
  hasPermission, 
  canAccessRoute, 
  filterNavItems,
  type Permission, 
  type NavItem 
} from "@/lib/permissions";
import type { UserRole } from "@/lib/types/database.types";

export interface UsePermissionsReturn {
  /** Current user role */
  role: UserRole | undefined;
  /** Check if user has a specific permission */
  can: (permission: Permission) => boolean;
  /** Check if user can access a specific route */
  canAccess: (pathname: string) => boolean;
  /** Filter navigation items based on permissions */
  filterNav: (items: NavItem[]) => NavItem[];
  /** Whether user can view financial data */
  canViewFinancials: boolean;
  /** Whether user can create/edit projects */
  canEditProjects: boolean;
  /** Whether user can create posts */
  canCreatePosts: boolean;
  /** Whether user can manage users */
  canManageUsers: boolean;
  /** Whether auth is still loading */
  isLoading: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { profile, isLoading } = useAuth();
  const role = profile?.role;

  const permissions = useMemo(() => ({
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    canAccess: (pathname: string) => canAccessRoute(role, pathname),
    filterNav: (items: NavItem[]) => filterNavItems(items, role),
    canViewFinancials: hasPermission(role, "view:financials"),
    canEditProjects: hasPermission(role, "edit:projects"),
    canCreatePosts: hasPermission(role, "create:posts"),
    canManageUsers: hasPermission(role, "manage:users"),
    isLoading,
  }), [role, isLoading]);

  return permissions;
}
