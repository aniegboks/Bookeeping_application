"use client";

import { Users, UserCheck, UserX, GraduationCap } from "lucide-react";
import { Student } from "@/lib/types/students";
import { ReactNode } from "react";

interface StatsCardsProps {
  students: Student[];
  filteredStudents: Student[];
}

interface CardsProps {
  title: string;
  value: number;
  icon: ReactNode;
  colorBg: string;
  progress: number;
  description: string;
}

export default function StatsCards({ students, filteredStudents }: StatsCardsProps) {
  const totalStudents = students.length || 0;
  const activeStudents = students.filter((s) => s.status === "active").length || 0;
  const graduatedStudents = students.filter((s) => s.status === "graduated").length || 0;
  const filteredCount = filteredStudents.length || 0;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: <Users className="text-blue-600" size={24} />,
      colorBg: "#E6F2FF",
      progress: 100,
      description: "All enrolled students",
    },
    {
      title: "Active Students",
      value: activeStudents,
      icon: <UserCheck className="text-green-600" size={24} />,
      colorBg: "#E6FFEF",
      progress: totalStudents ? (activeStudents / totalStudents) * 100 : 0,
      description: "Currently active students",
    },
    {
      title: "Graduated",
      value: graduatedStudents,
      icon: <GraduationCap className="text-purple-600" size={24} />,
      colorBg: "#F0EBFF",
      progress: totalStudents ? (graduatedStudents / totalStudents) * 100 : 0,
      description: "Students who have graduated",
    },
    {
      title: "Filtered Results",
      value: filteredCount,
      icon: <UserX className="text-orange-600" size={24} />,
      colorBg: "#FFF4E6",
      progress: totalStudents ? (filteredCount / totalStudents) * 100 : 0,
      description: "Students matching the current filter",
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

function Card({ title, value, icon, colorBg, progress, description }: CardsProps) {

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
              style={{ width: `${progress}%`, backgroundColor: colorBg, opacity: 0.4 }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
