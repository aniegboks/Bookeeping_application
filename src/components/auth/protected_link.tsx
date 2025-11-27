// components/auth/ProtectedLink.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useUser } from "@/contexts/UserContext";

interface ProtectedLinkProps {
  href: string;
  children: ReactNode;
  requiredPrivilege?: string;
  requiredAction?: 'create' | 'read' | 'update' | 'delete' | 'get';
  module?: string;
  hideIfNoAccess?: boolean;
  className?: string;
}

/**
 * Link that only shows if user has required privilege
 */
export function ProtectedLink({
  href,
  children,
  requiredPrivilege,
  requiredAction,
  module,
  hideIfNoAccess = false,
  className,
  ...props
}: ProtectedLinkProps) {
  const { hasPrivilege, canPerformAction } = useUser();

  const hasAccess = (() => {
    if (requiredPrivilege) {
      return hasPrivilege(requiredPrivilege, module);
    }
    if (requiredAction && module) {
      return canPerformAction(module, requiredAction);
    }
    return true;
  })();

  if (hideIfNoAccess && !hasAccess) {
    return null;
  }

  if (!hasAccess) {
    return (
      <span className={`${className} opacity-50 cursor-not-allowed`}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

// Hook for programmatic privilege checking
export function usePrivileges() {
  const { hasPrivilege, canPerformAction, privileges } = useUser();

  return {
    hasPrivilege,
    canPerformAction,
    privileges,
    
    // Convenience methods
    canCreate: (module: string) => canPerformAction(module, 'create'),
    canRead: (module: string) => canPerformAction(module, 'read'),
    canUpdate: (module: string) => canPerformAction(module, 'update'),
    canDelete: (module: string) => canPerformAction(module, 'delete'),
  };
}