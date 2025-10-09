"use client";

import { School, Users, CheckCircle, XCircle } from "lucide-react";
import { SchoolClass } from "@/lib/types/classes";

interface StatsCardsProps {
  classes: SchoolClass[];
  filteredClasses: SchoolClass[];
}

export default function StatsCards({ classes, filteredClasses }: StatsCardsProps) {
  const totalClasses = classes.length || 0;
  const activeClasses = classes.filter((c) => c.status === "active").length || 0;
  const inactiveClasses = classes.filter((c) => c.status === "inactive").length || 0;
  const filteredCount = filteredClasses.length || 0;

  const stats = [
    {
      title: "Total Classes",
      value: totalClasses,
      icon: <School className="text-blue-600" size={24} />,
      colorBg: "#E6F2FF",
      colorBar: "#3B82F6",
      progress: 100,
      description: "All classes in the system",
    },
    {
      title: "Active Classes",
      value: activeClasses,
      icon: <CheckCircle className="text-green-600" size={24} />,
      colorBg: "#E6FFEF",
      colorBar: "#22C55E",
      progress: totalClasses ? (activeClasses / totalClasses) * 100 : 0,
      description: "Currently active classes",
    },
    {
      title: "Inactive Classes",
      value: inactiveClasses,
      icon: <XCircle className="text-red-600" size={24} />,
      colorBg: "#FFE6E6",
      colorBar: "#EF4444",
      progress: totalClasses ? (inactiveClasses / totalClasses) * 100 : 0,
      description: "Classes not active",
    },
    {
      title: "Filtered Results",
      value: filteredCount,
      icon: <Users className="text-purple-600" size={24} />,
      colorBg: "#F0EBFF",
      colorBar: "#8B5CF6",
      progress: totalClasses ? (filteredCount / totalClasses) * 100 : 0,
      description: "Classes matching current filter",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx} {...stat} />
      ))}
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  colorBg,
  colorBar,
  progress,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorBg: string;
  colorBar: string;
  progress: number;
  description: string;
}) {
  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: colorBg }}>
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-[#171D26]">{value}</p>
          <p className="text-xs text-gray-500 mt-1 mb-2">{description}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: colorBar,
                opacity: 0.6,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
