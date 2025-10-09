"use client";

import Nav from "@/components/ui/nav";
import ApiDebugVertical from "@/components/ui/helper_component";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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

      {/* Right-hand API Debug Panel */}


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
