"use client";

import { Users, UserCheck, UserX, Filter } from "lucide-react";
import { ClassTeacher } from "@/lib/types/class_teacher";

interface StatsCardsProps {
  teachers: ClassTeacher[];
  filteredTeachers: ClassTeacher[];
}

export default function StatsCards({ teachers, filteredTeachers }: StatsCardsProps) {
  const totalTeachers = teachers.length || 0;
  const activeTeachers = teachers.filter((t) => t.status === "active").length || 0;
  const inactiveTeachers = teachers.filter((t) => t.status === "inactive").length || 0;
  const filteredCount = filteredTeachers.length || 0;

  const stats = [
    {
      title: "Total Assignments",
      value: totalTeachers,
      icon: <Users className="text-blue-600" size={24} />,
      colorBg: "#E6F2FF",
      progress: 100,
      description: "All assigned teachers",
    },
    {
      title: "Active Teachers",
      value: activeTeachers,
      icon: <UserCheck className="text-green-600" size={24} />,
      colorBg: "#E6FFEF",
      progress: totalTeachers ? (activeTeachers / totalTeachers) * 100 : 0,
      description: "Teachers currently active",
    },
    {
      title: "Inactive Teachers",
      value: inactiveTeachers,
      icon: <UserX className="text-red-600" size={24} />,
      colorBg: "#FFE6E6",
      progress: totalTeachers ? (inactiveTeachers / totalTeachers) * 100 : 0,
      description: "Teachers currently inactive",
    },
    {
      title: "Filtered Results",
      value: filteredCount,
      icon: <Filter className="text-purple-600" size={24} />,
      colorBg: "#F0EBFF",
      progress: totalTeachers ? (filteredCount / totalTeachers) * 100 : 0,
      description: "Teachers matching current filter",
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

function Card({ title, value, icon, colorBg, progress, description }: any) {
  const barWidthFactor = 70; // reduce bar width

  return (
    <div className="bg-white rounded-sm p-6 border border-gray-200 hover:shadow-md transition">
    <div className="flex items-center gap-4">
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
            style={{ width: `${progress}%`, backgroundColor: colorBg, opacity: 0.7 }}
          ></div>
        </div>
      </div>
    </div>
  </div>
  );
}
