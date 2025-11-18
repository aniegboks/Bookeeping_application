"use client";

import { useUser } from "@/contexts/UserContext";
import Nav from "@/components/ui/nav";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useUser();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="h-screen flex-shrink-0">
        <Nav />
      </div>

      {/* Main Content with independent scroll */}
      <main className="flex-1 h-screen overflow-y-auto p-10 scrollbar-none">
        {children}
      </main>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}