"use client"

import { usePermissions } from "@/hooks/use-permissions";

/**
 * useAdmin Hook
 * 
 * Checks if the current user has admin-level permissions.
 * This hook uses the central permissions system.
 */
export function useAdmin() {
    const { can, isLoading } = usePermissions();
    
    return {
        isAdmin: can("manage:users"),
        loading: isLoading
    }
}

