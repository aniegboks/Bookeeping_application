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
      router.push('/login');
    }
  }, [loading, hasAccess, router]);

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="bg-white shadow-xl rounded-2xl p-12 max-w-lg w-full border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-50 p-4 rounded-full">
                <ShieldAlert className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
              Access Denied
            </h1>
            <p className="text-gray-600 text-center mb-6 text-lg">
              You don&apos;t have permission to access this page.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-500 text-center">
                Required permission
              </p>
              <p className="text-base font-semibold text-gray-800 text-center mt-1">
                {module} · {requiredAction}
              </p>
            </div>
            <div className="text-center">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Go to Login
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