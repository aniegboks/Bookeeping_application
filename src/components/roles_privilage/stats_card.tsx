"use client";

import { RolePrivilege } from "@/lib/types/roles_privilage";
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";

interface RolePrivilegesStatsProps {
  privileges: RolePrivilege[];
}

export default function RolePrivilegesStats({ privileges }: RolePrivilegesStatsProps) {
  const total = privileges.length || 0;
  const active = privileges.filter((p) => p.status === "active").length || 0;
  const inactive = total - active;

  const activePercent = total ? (active / total) * 100 : 0;
  const inactivePercent = total ? (inactive / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
      <Card
        icon={<ShieldCheck className="h-6 w-6 text-[#7B61FF]" />}
        title="Total Privileges"
        value={total}
        description="All privileges defined across roles."
        colorBg="#F0EBFF"
        colorBar="#7B61FF"
        progress={100}
      />

      <Card
        icon={<CheckCircle className="h-6 w-6 text-[#61FF8C]" />}
        title="Active Privileges"
        value={active}
        description={`${activePercent.toFixed(0)}% of privileges are active.`}
        colorBg="#E6FFEF"
        colorBar="#61FF8C"
        progress={activePercent}
      />

      <Card
        icon={<XCircle className="h-6 w-6 text-[#FF6B6B]" />}
        title="Inactive Privileges"
        value={inactive}
        description={`${inactivePercent.toFixed(0)}% of privileges are inactive.`}
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