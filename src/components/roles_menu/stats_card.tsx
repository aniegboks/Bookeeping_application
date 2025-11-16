"use client";

import { RoleMenu } from "@/lib/types/roles_menu";
import { Menu, Link2, Users } from "lucide-react";

interface RoleMenusStatsProps {
  roleMenus: RoleMenu[];
}

export default function RoleMenusStats({ roleMenus }: RoleMenusStatsProps) {
  const total = roleMenus.length || 0;
  
  // Count unique roles
  const uniqueRoles = new Set(roleMenus.map(rm => rm.role_code)).size;
  
  // Count unique menus
  const uniqueMenus = new Set(roleMenus.map(rm => rm.menu_id)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
      <Card
        icon={<Link2 className="h-6 w-6 text-[#7B61FF]" />}
        title="Total Assignments"
        value={total}
        description="All role-menu assignments."
        colorBg="#F0EBFF"
        colorBar="#7B61FF"
        progress={100}
      />

      <Card
        icon={<Users className="h-6 w-6 text-[#61FF8C]" />}
        title="Roles with Menus"
        value={uniqueRoles}
        description={`${uniqueRoles} roles have menu access.`}
        colorBg="#E6FFEF"
        colorBar="#61FF8C"
        progress={total ? (uniqueRoles / total) * 100 : 0}
      />

      <Card
        icon={<Menu className="h-6 w-6 text-[#FF6B6B]" />}
        title="Assigned Menus"
        value={uniqueMenus}
        description={`${uniqueMenus} menus are assigned.`}
        colorBg="#FFE6E6"
        colorBar="#FF6B6B"
        progress={total ? (uniqueMenus / total) * 100 : 0}
      />
    </div>
  );
}

function Card({
  icon,
  title,
  value,
  description,
  colorBg,
  colorBar,
  progress,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  colorBg: string;
  colorBar: string;
  progress: number;
}) {
  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: colorBg }}>
          {icon}
        </div>
        <div className="flex flex-col w-full">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#171D26]">{value}</p>
          <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>
          <div className="w-[100px] bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{ width: `${progress}%`, backgroundColor: colorBar, opacity: 0.4 }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}