"use client";

import { ButtonHTMLAttributes } from "react";
import { useUser } from "@/contexts/UserContext";

interface ProtectedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  requiredPrivilege?: string;
  requiredAction?: 'create' | 'read' | 'update' | 'delete' | 'get';
  module?: string;
  hideIfNoAccess?: boolean;
  disabledMessage?: string;
}

/**
 * Button that automatically disables if user lacks privilege
 */
export function ProtectedButton({
  children,
  requiredPrivilege,
  requiredAction,
  module,
  hideIfNoAccess = false,
  disabledMessage = "You don't have permission for this action",
  disabled,
  ...props
}: ProtectedButtonProps) {
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

  const isDisabled = disabled || !hasAccess;

  if (!hasAccess) {
    return (
      <button
        {...props}
        disabled={isDisabled}
        title={disabledMessage}
        className={`${props.className} opacity-50 cursor-not-allowed`}
      >
        {children}
      </button>
    );
  }

  return (
    <button {...props} disabled={disabled}>
      {children}
    </button>
  );
}