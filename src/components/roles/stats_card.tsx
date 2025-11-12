"use client";

import { Role } from "@/lib/types/roles";
import { Shield, Users, Power } from "lucide-react";

interface RolesStatsProps {
  roles: Role[];
}

export default function RolesStats({ roles }: RolesStatsProps) {
  const total = roles.length || 0;
  const active = roles.filter((r) => r.status === "active").length || 0;
  const inactive = total - active;

  const activePercent = total ? (active / total) * 100 : 0;
  const inactivePercent = total ? (inactive / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
      <Card
        icon={<Users className="h-6 w-6 text-[#7B61FF]" />}
        title="Total Roles"
        value={total}
        description="All roles currently defined in the system."
        colorBg="#F0EBFF"
        colorBar="#7B61FF"
        progress={100}
      />

      <Card
        icon={<Power className="h-6 w-6 text-[#61FF8C]" />}
        title="Active Roles"
        value={active}
        description={`${activePercent.toFixed(0)}% of all roles are active.`}
        colorBg="#E6FFEF"
        colorBar="#61FF8C"
        progress={activePercent}
      />

      <Card
        icon={<Shield className="h-6 w-6 text-[#FF6B6B]" />}
        title="Inactive Roles"
        value={inactive}
        description={`${inactivePercent.toFixed(0)}% of roles are inactive.`}
        colorBg="#FFE6E6"
        colorBar="#FF6B6B"
        progress={inactivePercent}
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
