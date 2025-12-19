"use client";

/**
 * ProtectedRoute Component
 * 
 * Wrapper component that protects routes based on user permissions.
 * Redirects unauthorized users to the home page.
 */

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "sonner";
import type { Permission } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required permission to access this route */
  requiredPermission?: Permission;
  /** Redirect path when access is denied */
  redirectTo?: string;
  /** Custom message to show when access is denied */
  accessDeniedMessage?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  redirectTo = "/",
  accessDeniedMessage = "Você não tem permissão para acessar esta página.",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { can, isLoading, role } = usePermissions();
  const hasRedirected = useRef(false);

  // Compute authorization status without useState
  const authStatus = useMemo(() => {
    if (isLoading) return "loading";
    if (!role) return "unauthenticated";
    if (requiredPermission && !can(requiredPermission)) return "unauthorized";
    return "authorized";
  }, [isLoading, role, requiredPermission, can]);

  // Handle redirects in useEffect
  useEffect(() => {
    // Prevent duplicate redirects/toasts
    if (hasRedirected.current) return;

    if (authStatus === "unauthenticated") {
      hasRedirected.current = true;
      router.replace("/login");
    } else if (authStatus === "unauthorized") {
      hasRedirected.current = true;
      toast.error("Acesso negado", {
        description: accessDeniedMessage,
      });
      router.replace(redirectTo);
    }
  }, [authStatus, router, redirectTo, accessDeniedMessage]);

  // Show nothing while checking auth or redirecting
  if (authStatus !== "authorized") {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
}


