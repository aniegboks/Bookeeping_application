"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AcademicSessionTerms, NavItem } from "@/utils/nav";
import { Home, BookOpen, Calendar, Users } from "lucide-react";

// Map labels to icons
const navIcons: Record<string, React.ReactNode> = {
  Dashboard: <Home className="w-5 h-5" />,
  Sessions: <BookOpen className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
};

const VerticalNav = () => {
  return (
    <div className="w-64 h-screen bg-white flex flex-col border-r border-gray-200">
      {/* Profile Section */}
      <div className="flex flex-col items-center py-6 border-b border-gray-200">
        <div className="w-16 h-16 relative mb-3">
          <Image
            src="/images/profile.jpg"
            alt="profile"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-gray-800 text-lg tracking-tighter">
          Administrator
        </h3>
        <p className="text-sm text-gray-500">admin@admin.com</p>
      </div>

      {/* Scrollable Nav Links */}
      <nav className="flex-1 overflow-y-auto px-4 mt-6 scrollbar-none">
        <ul className="flex flex-col gap-2">
          {AcademicSessionTerms.map((item: NavItem) => (
            <li key={item.label}>
              <Link
                href={item.link}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F3F4F7] transition-colors duration-200 text-gray-700 font-sm"
              >
                {navIcons[item.label] ?? <BookOpen className="w-5 h-5" />}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto py-4 px-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">&copy; 2025 My Dashboard</p>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default VerticalNav;
