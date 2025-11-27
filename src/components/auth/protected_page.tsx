"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { ShieldAlert, Loader2 } from "lucide-react";

interface ProtectedPageProps {
  children: ReactNode;
  module: string;
  requiredAction?: 'read' | 'create' | 'update' | 'delete';
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export function ProtectedPage({
  children,
  module,
  requiredAction = 'read',
  redirectTo = '/dashboard',
  showAccessDenied = true
}: ProtectedPageProps) {
  const { loading, canPerformAction } = useUser();
  const router = useRouter();
  
  const hasAccess = canPerformAction(module, requiredAction);

  useEffect(() => {
    if (!loading && !hasAccess) {
      router.push(redirectTo);
    }
  }, [loading, hasAccess, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-sm">Checking permissions...</p>
      </div>
    );
  }

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <ShieldAlert className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2 text-center">
              Access Denied
            </h1>
            <p className="text-gray-700 text-center mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-600 text-center">
              Required: <span className="font-semibold">{module}</span> - {requiredAction}
            </p>
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push(redirectTo)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}