"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't need auth state handling
  const isPublicRoute = pathname?.startsWith("/login") || 
                        pathname?.startsWith("/auth/");

  const handleAuthChange = useCallback((event: AuthChangeEvent, session: Session | null) => {
    // Update state
    setSession(session);
    setUser(session?.user ?? null);

    switch (event) {
      case "SIGNED_IN":
        // User just signed in - handled by login form redirect
        break;

      case "SIGNED_OUT":
        // User was signed out (could be manual or session expired)
        if (!isPublicRoute) {
          toast.info("Sua sessão foi encerrada", {
            description: "Faça login novamente para continuar.",
          });
          router.push("/login");
        }
        break;

      case "TOKEN_REFRESHED":
        // Token was refreshed successfully - session is still valid
        console.log("[Auth] Token refreshed successfully");
        break;

      case "USER_UPDATED":
        // User data was updated (e.g., password change)
        toast.success("Seus dados foram atualizados");
        break;

      case "PASSWORD_RECOVERY":
        // Password recovery email was sent
        // This is handled by the reset password flow
        break;

      default:
        break;
    }
  }, [isPublicRoute, router]);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("[Auth] Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
