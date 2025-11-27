"use client";

import { ReactNode } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PrivilegeGuardProps {
  children: ReactNode;
  requiredPrivilege?: string;
  requiredAction?: 'create' | 'read' | 'update' | 'delete' | 'get';
  module?: string;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Component that only renders children if user has required privilege
 */
export function PrivilegeGuard({
  children,
  requiredPrivilege,
  requiredAction,
  module,
  fallback = null,
  redirectTo
}: PrivilegeGuardProps) {
  const { hasPrivilege, canPerformAction, loading } = useUser();
  const router = useRouter();

  const hasAccess = (() => {
    if (requiredPrivilege) {
      return hasPrivilege(requiredPrivilege, module);
    }
    if (requiredAction && module) {
      return canPerformAction(module, requiredAction);
    }
    return true; // No requirements specified
  })();

  useEffect(() => {
    if (!loading && !hasAccess && redirectTo) {
      router.push(redirectTo);
    }
  }, [hasAccess, loading, redirectTo, router]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 rounded"></div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}