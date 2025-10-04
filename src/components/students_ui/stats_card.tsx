// components/student_ui/stats_card.tsx

import { Users, UserCheck, UserX, GraduationCap } from "lucide-react";
import { Student } from "@/lib/types/students";

interface StatsCardsProps {
  students: Student[];
  filteredStudents: Student[];
}

export default function StatsCards({ students, filteredStudents }: StatsCardsProps) {
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const inactiveStudents = students.filter((s) => s.status === "inactive").length;
  const graduatedStudents = students.filter((s) => s.status === "graduated").length;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Students",
      value: activeStudents,
      icon: UserCheck,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Graduated",
      value: graduatedStudents,
      icon: GraduationCap,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Filtered Results",
      value: filteredStudents.length,
      icon: UserX,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}